import { RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '@/components/ui/SearchBar'
import { useOrderStore } from '@/store/orderStore'
import { useCartStore } from '@/store/cartStore'

export default function BuyAgainPage() {
  const navigate    = useNavigate()
  const orders      = useOrderStore((s) => s.orders)
  const items       = useCartStore((s) => s.items)
  const add         = useCartStore((s) => s.add)
  const increment   = useCartStore((s) => s.increment)
  const decrement   = useCartStore((s) => s.decrement)

  const allItems = orders.flatMap((o) => o.items)
  const seen     = new Set<string>()
  const unique   = allItems.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  const daysSince = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primaryOrange text-white px-4 pt-10 pb-4 space-y-3">
        <h1 className="font-inter font-bold text-xl">Buy Again</h1>
        <SearchBar placeholder='Search past orders...' />
      </div>

      {unique.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-8">
          <div className="w-20 h-20 rounded-full bg-orangeTint flex items-center justify-center">
            <RotateCcw size={36} className="text-primaryOrange" />
          </div>
          <h2 className="font-inter font-bold text-ink text-lg">No previous orders</h2>
          <p className="font-jakarta text-sm text-textSecondary leading-relaxed">
            Items you order will appear here so you can quickly reorder them.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="h-11 px-8 bg-primaryOrange text-white rounded-btn font-inter font-bold text-sm"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <p className="font-jakarta text-xs text-textSecondary">{unique.length} items from your past orders</p>
          {unique.map((item) => {
            const order = orders.find((o) => o.items.some((i) => i.id === item.id))
            const days  = order ? daysSince(order.createdAt) : 0
            const disc  = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            const qty   = items[item.id]?.qty ?? 0

            return (
              <div key={item.id} className="bg-cardSurface rounded-card border border-border p-3 flex gap-3 items-center">
                <div className="w-16 h-16 rounded-lg bg-inputFill shrink-0 overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-jakarta text-xs text-ink line-clamp-2 leading-snug">{item.name}</p>
                  <p className="font-jakarta text-[10px] text-muted mt-0.5">{item.weight}</p>
                  <p className="font-jakarta text-[10px] text-textSecondary mt-0.5">
                    Ordered {days === 0 ? 'today' : `${days} day${days > 1 ? 's' : ''} ago`}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-inter font-bold text-sm text-ink">₹{item.price}</span>
                    {disc > 0 && (
                      <>
                        <span className="font-inter text-[10px] text-muted line-through">₹{item.originalPrice}</span>
                        <span className="font-inter text-[9px] text-success font-semibold">{disc}% off</span>
                      </>
                    )}
                  </div>
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => add(item)}
                    className="h-9 px-4 border-2 border-deepTeal text-deepTeal rounded-btn text-xs font-inter font-bold shrink-0"
                  >
                    ADD
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-deepTeal rounded-btn h-9 px-1.5 shrink-0">
                    <button onClick={() => decrement(item.id)} className="w-6 h-6 flex items-center justify-center text-white font-bold text-sm">−</button>
                    <span className="font-inter font-bold text-white text-sm w-4 text-center">{qty}</span>
                    <button onClick={() => increment(item.id)} className="w-6 h-6 flex items-center justify-center text-white font-bold text-sm">+</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
