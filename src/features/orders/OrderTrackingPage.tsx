import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  ArrowLeft, Phone, Star, Bike, CheckCircle2, Clock,
  Package, Truck, XCircle, Loader2, AlertCircle, X,
} from 'lucide-react'
import api from '@/lib/api'

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Orange rider icon
const riderIcon = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;background:#f97316;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🛵</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
})

// ── Status config ─────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'pending',          label: 'Order Placed', icon: Clock },
  { key: 'confirmed',        label: 'Confirmed',    icon: CheckCircle2 },
  { key: 'preparing',        label: 'Preparing',    icon: Package },
  { key: 'out_for_delivery', label: 'On the Way',   icon: Truck },
  { key: 'delivered',        label: 'Delivered',    icon: CheckCircle2 },
]

const STEP_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, preparing: 2, out_for_delivery: 3, delivered: 4,
}

const ETA: Record<string, string> = {
  pending:          '~25 mins',
  confirmed:        '~20 mins',
  preparing:        '~15 mins',
  out_for_delivery: '~5 mins',
  delivered:        'Delivered!',
  cancelled:        '',
}

// ── Map auto-fit ──────────────────────────────────────────────────────────────

function MapFit({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) { map.setView(positions[0], 15); return }
    map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] })
  }, [positions.map(p => p.join()).join()])
  return null
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [order, setOrder]           = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`)
      setOrder(data)
      if (['delivered', 'cancelled'].includes(data.status)) {
        if (pollRef.current) clearInterval(pollRef.current)
      }
    } catch {
      setError('Order not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    pollRef.current = setInterval(fetchOrder, 10000) // poll every 10s
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [id])

  const handleCancel = async (reason = '') => {
    setCancelling(true)
    try {
      await api.patch(`/orders/${id}/cancel`, { reason })
      await fetchOrder()
      setShowCancel(false)
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Cannot cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-primaryOrange" />
    </div>
  )

  if (error || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
      <AlertCircle size={32} className="text-red-400" />
      <p className="font-inter font-bold text-ink">{error || 'Order not found'}</p>
      <button onClick={() => navigate('/orders')}
        className="h-10 px-6 bg-primaryOrange text-white rounded-btn font-inter font-semibold text-sm">
        My Orders
      </button>
    </div>
  )

  const isCancelled = order.status === 'cancelled'
  const stepIdx     = isCancelled ? -1 : (STEP_INDEX[order.status] ?? 0)
  const canCancel   = ['pending', 'confirmed'].includes(order.status)
  const eta         = ETA[order.status] ?? ''
  const rider       = order.rider

  // Map positions
  const riderLat = rider?.currentLat ? parseFloat(rider.currentLat) : null
  const riderLng = rider?.currentLng ? parseFloat(rider.currentLng) : null
  const hasRiderLocation = riderLat !== null && riderLng !== null
  const showMap = order.status === 'out_for_delivery' && hasRiderLocation

  const mapPositions: [number, number][] = hasRiderLocation ? [[riderLat!, riderLng!]] : []

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-16">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/orders')}
          className="w-9 h-9 rounded-full hover:bg-inputFill flex items-center justify-center transition-colors">
          <ArrowLeft size={18} className="text-ink" />
        </button>
        <div className="flex-1">
          <p className="font-inter font-bold text-ink text-lg leading-none">Order #{order.id}</p>
          {eta && <p className="font-jakarta text-xs text-muted mt-0.5">Estimated: {eta}</p>}
        </div>
        {canCancel && (
          <button onClick={() => setShowCancel(true)}
            className="h-8 px-3 border border-red-200 text-red-500 rounded-btn font-inter font-semibold text-xs hover:bg-red-50 transition-colors">
            Cancel
          </button>
        )}
      </div>

      {/* ── LIVE MAP (out_for_delivery + rider has location) ── */}
      {showMap && (
        <div className="rounded-2xl overflow-hidden border border-border mb-4 relative" style={{ height: 260 }}>
          <MapContainer
            center={[riderLat!, riderLng!]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapFit positions={mapPositions} />

            {/* Rider marker */}
            <Marker position={[riderLat!, riderLng!]} icon={riderIcon}>
              <Popup>{rider?.name ?? 'Rider'}</Popup>
            </Marker>
          </MapContainer>

          {/* Live badge */}
          <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-md">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-inter font-bold text-xs text-ink">Live Tracking</span>
          </div>

          {/* Attribution */}
          <div className="absolute bottom-1 right-1 z-[1000] text-[9px] text-gray-500 bg-white/80 px-1 rounded">
            © OpenStreetMap
          </div>
        </div>
      )}

      {/* Preparing state — static info card instead of map */}
      {['preparing', 'confirmed', 'pending'].includes(order.status) && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primaryOrange rounded-xl flex items-center justify-center shrink-0">
            <Package size={18} className="text-white" />
          </div>
          <div>
            <p className="font-inter font-semibold text-ink text-sm">
              {order.status === 'pending' ? 'Order placed — waiting for confirmation' :
               order.status === 'confirmed' ? 'Order confirmed — being prepared' :
               'Packing your order...'}
            </p>
            <p className="font-jakarta text-xs text-muted mt-0.5">Map will appear when rider picks up your order</p>
          </div>
        </div>
      )}

      {/* Delivered state */}
      {order.status === 'delivered' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-green-600 shrink-0" />
          <div>
            <p className="font-inter font-bold text-green-700 text-sm">Order Delivered!</p>
            <p className="font-jakarta text-xs text-green-500 mt-0.5">Thank you for ordering from Jhatpats</p>
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <XCircle size={22} className="text-red-500 shrink-0" />
          <div>
            <p className="font-inter font-bold text-red-600 text-sm">Order Cancelled</p>
            <p className="font-jakarta text-xs text-red-400 mt-0.5">
              {order.timeline?.find((t: any) => t.status === 'cancelled')?.note ?? 'Cancelled by customer'}
            </p>
          </div>
        </div>
      )}

      {/* Status stepper */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-border p-5 mb-4">
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-border" />
            <div
              className="absolute top-4 left-[10%] h-0.5 bg-primaryOrange transition-all duration-700"
              style={{ width: stepIdx > 0 ? `${(stepIdx / (STEPS.length - 1)) * 80}%` : '0%' }}
            />
            {STEPS.map((step, i) => {
              const done   = i <= stepIdx
              const active = i === stepIdx
              const Icon   = step.icon
              const tl     = order.timeline?.find((t: any) => t.status === step.key)
              return (
                <div key={step.key} className="flex flex-col items-center gap-1.5 z-10" style={{ width: `${100 / STEPS.length}%` }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                    ${done ? 'bg-primaryOrange border-primaryOrange text-white' : 'bg-white border-border text-muted'}
                    ${active ? 'ring-4 ring-orange-100 scale-110' : ''}`}>
                    <Icon size={14} />
                  </div>
                  <p className={`text-center text-[10px] font-inter font-semibold leading-tight ${done ? 'text-ink' : 'text-muted'}`}>
                    {step.label}
                  </p>
                  {tl && (
                    <p className="text-[9px] font-jakarta text-muted">
                      {new Date(tl.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rider card */}
      {order.status === 'out_for_delivery' && rider && (
        <div className="bg-white rounded-2xl border border-border p-4 mb-4">
          <p className="font-inter font-semibold text-xs text-muted uppercase tracking-wide mb-3">Your Delivery Partner</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primaryOrange to-orange-300 flex items-center justify-center text-white font-inter font-bold text-lg shrink-0">
              {rider.name?.[0]?.toUpperCase() ?? 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-bold text-ink text-sm">{rider.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 font-jakarta text-xs text-muted">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  {parseFloat(rider.rating ?? '5').toFixed(1)}
                </span>
                <span className="flex items-center gap-1 font-jakarta text-xs text-muted">
                  <Bike size={11} />
                  {rider.vehicleType} · {rider.vehicleNumber ?? '—'}
                </span>
              </div>
              {hasRiderLocation && rider.locationUpdatedAt && (
                <p className="text-[10px] font-jakarta text-green-600 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                  Location updated {Math.floor((Date.now() - new Date(rider.locationUpdatedAt).getTime()) / 1000)}s ago
                </p>
              )}
            </div>
            {rider.mobile && (
              <a href={`tel:${rider.mobile}`}
                className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center hover:bg-green-100 transition-colors">
                <Phone size={16} className="text-green-600" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <p className="font-inter font-semibold text-xs text-muted uppercase tracking-wide mb-3">
          Items ({order.items?.length ?? 0})
        </p>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-inputFill flex items-center justify-center shrink-0 overflow-hidden">
                {item.product?.imageUrl
                  ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  : <Package size={16} className="text-muted" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter font-semibold text-ink text-sm truncate">{item.product?.name ?? 'Item'}</p>
                {item.product?.unit && <p className="font-jakarta text-xs text-muted">{item.product.unit}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="font-inter font-bold text-ink text-sm">₹{item.total ?? item.unitPrice * item.quantity}</p>
                <p className="font-jakarta text-xs text-muted">×{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <p className="font-inter font-semibold text-xs text-muted uppercase tracking-wide mb-3">Bill Details</p>
        <div className="space-y-2">
          <BillRow label="Subtotal"     value={`₹${order.subtotal}`} />
          <BillRow label="Delivery Fee" value={order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                   valueClass={order.deliveryFee === 0 ? 'text-green-600' : undefined} />
          {order.discount > 0 && <BillRow label="Discount" value={`-₹${order.discount}`} valueClass="text-green-600" />}
          <div className="border-t border-border pt-2 mt-2">
            <BillRow label="Total" value={`₹${order.total}`} bold />
          </div>
        </div>
      </div>

      <Link to="/orders" className="flex items-center justify-center gap-2 font-inter font-semibold text-sm text-primaryOrange hover:underline">
        ← View all orders
      </Link>

      {/* Cancel modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancel(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <button onClick={() => setShowCancel(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full hover:bg-inputFill flex items-center justify-center">
              <X size={14} className="text-muted" />
            </button>
            <p className="font-inter font-bold text-ink text-lg mb-1">Cancel Order?</p>
            <p className="font-jakarta text-muted text-sm mb-5">Are you sure you want to cancel Order #{order.id}?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)}
                className="flex-1 h-11 border border-border rounded-btn font-inter font-semibold text-sm text-ink hover:bg-inputFill transition-colors">
                Keep Order
              </button>
              <button onClick={() => handleCancel('Cancelled by customer')} disabled={cancelling}
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-btn font-inter font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {cancelling && <Loader2 size={14} className="animate-spin" />}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BillRow({ label, value, bold, valueClass }: { label: string; value: string; bold?: boolean; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`font-jakarta text-sm ${bold ? 'font-bold text-ink' : 'text-muted'}`}>{label}</span>
      <span className={`font-inter text-sm ${bold ? 'font-bold text-ink' : ''} ${valueClass ?? 'text-ink'}`}>{value}</span>
    </div>
  )
}
