import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export default function StickyCartBar() {
  const navigate = useNavigate()
  const count    = useCartStore((s) => s.count())
  const subtotal = useCartStore((s) => s.subtotal())

  if (count === 0) return null

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-app px-4 z-40">
      <button
        onClick={() => navigate('/cart')}
        className="w-full flex items-center justify-between bg-primaryOrange text-white px-4 py-3 rounded-btn shadow-lg active:scale-[0.98] transition-transform"
      >
        <span className="flex items-center gap-2 font-inter font-semibold text-sm">
          <ShoppingCart size={18} />
          {count} item{count > 1 ? 's' : ''}
        </span>
        <span className="font-inter font-bold text-sm">
          ₹{subtotal.toFixed(0)} · View Cart
        </span>
      </button>
    </div>
  )
}
