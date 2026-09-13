import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import {
  ArrowLeft, Phone, Star, Bike, CheckCircle2, Clock,
  Package, Truck, XCircle, Loader2, AlertCircle, X, MapPin,
} from 'lucide-react'
import api from '@/lib/api'

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const riderIcon = L.divIcon({
  className: '',
  html: `<div style="width:42px;height:42px;background:#f97316;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(249,115,22,0.5);display:flex;align-items:center;justify-content:center;font-size:20px;">🛵</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
})

const homeIcon = L.divIcon({
  className: '',
  html: `<div style="width:42px;height:42px;background:#10b981;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(16,185,129,0.5);display:flex;align-items:center;justify-content:center;font-size:20px;">🏠</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
})

// ── Status config ─────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'pending',          label: 'Placed',     icon: Clock },
  { key: 'confirmed',        label: 'Confirmed',  icon: CheckCircle2 },
  { key: 'preparing',        label: 'Preparing',  icon: Package },
  { key: 'out_for_delivery', label: 'On the Way', icon: Truck },
  { key: 'delivered',        label: 'Delivered',  icon: CheckCircle2 },
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
    map.fitBounds(L.latLngBounds(positions), { padding: [60, 60] })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.map(p => p.join()).join(',')])
  return null
}

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Want to change items',
  'Want to change delivery address',
  'Delivery time too long',
  'Found better price elsewhere',
  'Duplicate order',
  'Other',
]

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [order, setOrder]             = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [cancelling, setCancelling]   = useState(false)
  const [showCancel, setShowCancel]   = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError]   = useState('')
  const [browserLoc, setBrowserLoc]   = useState<[number,number] | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`)
      setOrder(data)
      if (['delivered', 'cancelled'].includes(data.status)) {
        if (pollRef.current) clearInterval(pollRef.current)
      }
    } catch (e: any) {
      console.error('[OrderTracking] fetch failed:', e?.response?.status, e?.message)
      setError(e?.response?.data?.message ?? 'Order not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    pollRef.current = setInterval(fetchOrder, 10000)
    // Try to get browser location as fallback for delivery pin
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setBrowserLoc([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { timeout: 8000, maximumAge: 60000 }
      )
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleCancel = async () => {
    if (!cancelReason) { setCancelError('Please select a reason'); return }
    setCancelling(true); setCancelError('')
    try {
      await api.patch(`/orders/${id}/cancel`, { reason: cancelReason })
      await fetchOrder()
      setShowCancel(false)
      setCancelReason('')
    } catch (e: any) {
      setCancelError(e?.response?.data?.message ?? 'Cannot cancel order')
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
  const address     = order.address

  // Rider location
  const riderLat = rider?.currentLat ? parseFloat(rider.currentLat) : null
  const riderLng = rider?.currentLng ? parseFloat(rider.currentLng) : null
  const hasRider = riderLat !== null && riderLng !== null

  // Delivery address location — use saved address, fallback to browser GPS
  const addrLat = address?.lat ? parseFloat(address.lat) : browserLoc?.[0] ?? null
  const addrLng = address?.lng ? parseFloat(address.lng) : browserLoc?.[1] ?? null
  const hasAddr = addrLat !== null && addrLng !== null

  // Show map if we have at least a delivery address OR rider location
  const showMap = !isCancelled && (hasAddr || hasRider)

  // Positions for auto-fit
  const mapPositions: [number, number][] = [
    ...(hasRider ? [[riderLat!, riderLng!]] as [number, number][] : []),
    ...(hasAddr  ? [[addrLat!, addrLng!]]   as [number, number][] : []),
  ]

  // Map center fallback
  const mapCenter: [number, number] = hasAddr
    ? [addrLat!, addrLng!]
    : hasRider ? [riderLat!, riderLng!] : [28.6139, 77.2090]

  // Dashed line between rider and delivery address (only when both present and out_for_delivery)
  const showRouteLine = hasRider && hasAddr && order.status === 'out_for_delivery'

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
          <button onClick={() => { setShowCancel(true); setCancelError(''); setCancelReason('') }}
            className="h-8 px-3 border border-red-200 text-red-500 rounded-btn font-inter font-semibold text-xs hover:bg-red-50 transition-colors">
            Cancel Order
          </button>
        )}
      </div>

      {/* ── LIVE MAP ── */}
      {showMap && (
        <div className="rounded-2xl overflow-hidden border border-border mb-4 relative" style={{ height: 280 }}>
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapFit positions={mapPositions} />

            {/* Rider marker */}
            {hasRider && (
              <Marker position={[riderLat!, riderLng!]} icon={riderIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-sm">{rider?.name ?? 'Rider'}</p>
                    <p className="text-xs text-gray-500">Your delivery partner</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Delivery address marker */}
            {hasAddr && (
              <Marker position={[addrLat!, addrLng!]} icon={homeIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-sm">Delivery Address</p>
                    <p className="text-xs text-gray-500">{address?.line1 ? `${address.line1}, ${address.city}` : 'Your location'}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Dashed route line */}
            {showRouteLine && (
              <Polyline
                positions={[[riderLat!, riderLng!], [addrLat!, addrLng!]]}
                pathOptions={{ color: '#f97316', weight: 3, dashArray: '8, 8', opacity: 0.7 }}
              />
            )}
          </MapContainer>

          {/* Live badge */}
          <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-md">
            {hasRider
              ? <><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="font-inter font-bold text-xs text-ink">Live Tracking</span></>
              : <><MapPin size={11} className="text-primaryOrange" /><span className="font-inter font-bold text-xs text-ink">Delivery Location</span></>
            }
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md flex flex-col gap-1">
            {hasRider && (
              <div className="flex items-center gap-1.5 text-[10px] font-inter font-semibold text-ink">
                <span>🛵</span> Rider
              </div>
            )}
            {hasAddr && (
              <div className="flex items-center gap-1.5 text-[10px] font-inter font-semibold text-ink">
                <span>🏠</span> Your Location
              </div>
            )}
          </div>

          <div className="absolute bottom-1 left-1 z-[1000] text-[9px] text-gray-400 bg-white/70 px-1 rounded">
            © OpenStreetMap
          </div>
        </div>
      )}

      {/* No location yet info card */}
      {!showMap && !isCancelled && (
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
            <p className="font-jakarta text-xs text-muted mt-0.5">Map will appear once rider picks up your order</p>
          </div>
        </div>
      )}

      {/* Delivered */}
      {order.status === 'delivered' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-green-600 shrink-0" />
          <div>
            <p className="font-inter font-bold text-green-700 text-sm">Order Delivered!</p>
            <p className="font-jakarta text-xs text-green-500 mt-0.5">Thank you for ordering from Jhatpats 🎉</p>
          </div>
        </div>
      )}

      {/* Cancelled */}
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
              {hasRider && rider.locationUpdatedAt && (
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

      {/* Delivery address */}
      {address && (
        <div className="bg-white rounded-2xl border border-border p-4 mb-4">
          <p className="font-inter font-semibold text-xs text-muted uppercase tracking-wide mb-2">Delivering To</p>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={14} className="text-green-600" />
            </div>
            <div>
              <p className="font-inter font-semibold text-ink text-sm">{address.label ?? 'Home'}</p>
              <p className="font-jakarta text-xs text-muted mt-0.5">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
              <p className="font-jakarta text-xs text-muted">{address.city} — {address.pincode}</p>
            </div>
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
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !cancelling && setShowCancel(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <div>
                <p className="font-inter font-bold text-ink text-lg">Cancel Order #{order.id}</p>
                <p className="font-jakarta text-xs text-muted mt-0.5">This action cannot be undone</p>
              </div>
              <button onClick={() => setShowCancel(false)} disabled={cancelling}
                className="w-8 h-8 rounded-full hover:bg-inputFill flex items-center justify-center transition-colors">
                <X size={15} className="text-muted" />
              </button>
            </div>

            {/* Conditions notice */}
            <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="font-jakarta text-xs text-amber-700 font-semibold mb-1">Cancellation Policy</p>
              <ul className="space-y-0.5">
                {[
                  'Orders can be cancelled before rider picks up',
                  'Prepaid orders will be refunded within 5-7 business days',
                  'COD orders — no charges apply',
                ].map(t => (
                  <li key={t} className="font-jakarta text-xs text-amber-700 flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">•</span>{t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reason list */}
            <div className="px-5 py-4">
              <p className="font-inter font-semibold text-sm text-ink mb-3">Why do you want to cancel?</p>
              <div className="space-y-2">
                {CANCEL_REASONS.map(reason => (
                  <button key={reason} onClick={() => setCancelReason(reason)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      cancelReason === reason
                        ? 'border-red-400 bg-red-50'
                        : 'border-border hover:border-red-200 hover:bg-red-50/50'
                    }`}>
                    <span className={`font-jakarta text-sm ${cancelReason === reason ? 'text-red-700 font-semibold' : 'text-ink'}`}>
                      {reason}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      cancelReason === reason ? 'border-red-500 bg-red-500' : 'border-border'
                    }`}>
                      {cancelReason === reason && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
              {cancelError && (
                <p className="mt-2 text-xs text-red-500 font-jakarta">{cancelError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setShowCancel(false)} disabled={cancelling}
                className="flex-1 h-11 border border-border rounded-btn font-inter font-semibold text-sm text-ink hover:bg-inputFill transition-colors">
                Keep Order
              </button>
              <button onClick={handleCancel} disabled={cancelling || !cancelReason}
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-btn font-inter font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
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
