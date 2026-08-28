import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronRight, Clock, CheckCircle2, XCircle, Loader2, Package } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:          { label: 'Order Placed',     color: 'text-orange-500 bg-orange-50',  icon: <Clock size={13} /> },
  confirmed:        { label: 'Confirmed',         color: 'text-blue-600 bg-blue-50',      icon: <CheckCircle2 size={13} /> },
  preparing:        { label: 'Preparing',         color: 'text-purple-600 bg-purple-50',  icon: <Package size={13} /> },
  out_for_delivery: { label: 'Out for Delivery',  color: 'text-teal-600 bg-teal-50',      icon: <Package size={13} /> },
  delivered:        { label: 'Delivered',         color: 'text-green-600 bg-green-50',    icon: <CheckCircle2 size={13} /> },
  cancelled:        { label: 'Cancelled',         color: 'text-red-500 bg-red-50',        icon: <XCircle size={13} /> },
}

export default function OrdersPage() {
  const token = useAuthStore((s) => s.token)
  const [orders, setOrders]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.get('/orders')
      .then((r) => setOrders(r.data))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [token])

  if (!token) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="w-16 h-16 bg-orangeTint rounded-full flex items-center justify-center">
        <ShoppingBag size={28} className="text-primaryOrange" />
      </div>
      <p className="font-inter font-bold text-ink text-lg">Login to see your orders</p>
      <Link to="/login" className="h-10 px-6 bg-primaryOrange text-white rounded-btn font-inter font-semibold text-sm flex items-center">
        Login
      </Link>
    </div>
  )

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-primaryOrange" />
    </div>
  )

  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-6">
      <p className="font-jakarta text-muted">{error}</p>
    </div>
  )

  if (orders.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-6">
      <div className="w-16 h-16 bg-orangeTint rounded-full flex items-center justify-center">
        <ShoppingBag size={28} className="text-primaryOrange" />
      </div>
      <p className="font-inter font-bold text-ink text-lg">No orders yet</p>
      <p className="font-jakarta text-muted text-sm">Your past orders will appear here</p>
      <Link to="/home" className="h-10 px-6 bg-primaryOrange text-white rounded-btn font-inter font-semibold text-sm flex items-center">
        Shop Now
      </Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-inter font-bold text-ink text-2xl mb-5">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order: any) => {
          const meta = STATUS_META[order.status] ?? STATUS_META.pending
          const itemNames = order.items?.slice(0, 2).map((i: any) => i.product?.name ?? 'Item').join(', ')
          const more = (order.items?.length ?? 0) - 2
          return (
            <Link key={order.id} to={`/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-border p-4 hover:border-primaryOrange/40 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-inter font-bold text-ink text-sm">Order #{order.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-inter font-semibold ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                  <p className="font-jakarta text-muted text-xs truncate">
                    {itemNames}{more > 0 ? ` +${more} more` : ''}
                  </p>
                  <p className="font-jakarta text-xs text-muted mt-1">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-inter font-bold text-ink text-base">₹{order.total}</span>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
