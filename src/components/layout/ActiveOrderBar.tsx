import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bike, ChevronRight, ShoppingBag } from 'lucide-react'
import { useActiveOrderStore } from '@/store/activeOrderStore'
import { useAuthStore } from '@/store/authStore'

const LABELS: Record<string, [string, string]> = {
  pending:          ['Order placed', 'Waiting for the store to confirm'],
  confirmed:        ['Order confirmed', 'Arriving in ~20 mins'],
  preparing:        ['Packing your order', 'Arriving in ~15 mins'],
  out_for_delivery: ['Order is on the way', 'Arriving in ~5 mins'],
}

/** Orange status pill for the latest undelivered order, pinned to the bottom
 *  of every page; links to live tracking. */
export default function ActiveOrderBar() {
  const order   = useActiveOrderStore((s) => s.order)
  const refresh = useActiveOrderStore((s) => s.refresh)
  const token   = useAuthStore((s) => s.token)
  const { pathname } = useLocation()

  // On load, on login/logout, and on every navigation (cheap, keeps it fresh).
  useEffect(() => { refresh() }, [token, pathname, refresh])

  // Hidden on the tracking page for this order — it already shows the status.
  if (!order || pathname === `/orders/${order.id}`) return null
  const [title, subtitle] = LABELS[order.status] ?? ['Order in progress', 'Tap to track']
  const onTheWay = order.status === 'out_for_delivery'

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
      <Link
        to={`/orders/${order.id}`}
        className="flex items-center gap-3 bg-primaryOrange hover:bg-orangeDark text-white rounded-full pl-2 pr-4 h-14 shadow-[0_6px_16px_rgba(234,88,12,0.35)] transition-colors"
      >
        <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          {onTheWay ? <Bike size={20} /> : <ShoppingBag size={20} />}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-inter font-bold text-sm truncate">{title}</span>
          <span className="block font-jakarta text-xs text-white/85 truncate">{subtitle} · #{order.id}</span>
        </span>
        <span className="font-inter font-bold text-sm flex items-center shrink-0">
          Track <ChevronRight size={18} />
        </span>
      </Link>
    </div>
  )
}
