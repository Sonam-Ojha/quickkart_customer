import { Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/types/product'

interface Props {
  product: Product
}

const badgeConfig = {
  bestseller: { label: 'BEST SELLER', bg: 'bg-accentYellow text-ink'  },
  deal:       { label: 'DEAL',        bg: 'bg-accentCoral text-white' },
  fresh:      { label: 'FRESH',       bg: 'bg-success text-white'     },
  new:        { label: 'NEW',         bg: 'bg-deepTeal text-white'    },
}

const catColors: Record<string, string> = {
  Fresh:     '#DCFCE7', Dairy:     '#FEF9C3',
  Snacks:    '#FEE2E2', Beverages: '#DBEAFE',
  Bakery:    '#FEF3C7', Beauty:    '#FCE7F3',
  Staples:   '#F0FDF4', default:   '#F5F5F4',
}

export default function ProductCard({ product }: Props) {
  const navigate  = useNavigate()
  const items     = useCartStore((s) => s.items)
  const add       = useCartStore((s) => s.add)
  const increment = useCartStore((s) => s.increment)
  const decrement = useCartStore((s) => s.decrement)

  const qty     = items[product.id]?.qty ?? 0
  const disc    = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0
  const bgColor = catColors[product.category ?? 'default'] ?? catColors.default

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200 overflow-hidden group">

      {/* Image */}
      <div
        className="relative w-full aspect-square overflow-hidden cursor-pointer"
        style={{ background: bgColor }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = 'none'
            const p = t.parentElement
            if (p && !p.querySelector('.fb')) {
              const d = document.createElement('div')
              d.className = 'fb text-4xl flex items-center justify-center w-full h-full'
              d.textContent = '🛒'
              p.appendChild(d)
            }
          }}
        />
        {product.badge && (
          <span className={`absolute top-1.5 left-1.5 text-[9px] font-inter font-bold px-1.5 py-0.5 rounded-full ${badgeConfig[product.badge].bg}`}>
            {badgeConfig[product.badge].label}
          </span>
        )}
        {disc > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-green-500 text-white text-[9px] font-inter font-bold px-1.5 py-0.5 rounded-full">
            {disc}% off
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-2 flex-1">

        {/* Weight */}
        <span className="text-gray-400 text-[10px] font-jakarta">{product.weight}</span>

        {/* Name */}
        <p
          className="font-jakarta text-gray-800 text-[12px] leading-snug line-clamp-2 flex-1 cursor-pointer hover:text-primaryOrange transition-colors"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </p>

        {/* Price row + ADD button */}
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <div className="flex flex-col">
            <span className="font-inter font-bold text-gray-900 text-[13px] leading-none">₹{product.price}</span>
            {disc > 0 && (
              <span className="font-inter text-[10px] text-gray-400 line-through leading-none mt-0.5">₹{product.originalPrice}</span>
            )}
          </div>

          {qty === 0 ? (
            <button
              onClick={() => add(product)}
              className="flex items-center gap-1 h-7 px-3 bg-primaryOrange hover:bg-[#c2410c] text-white rounded-lg font-inter font-bold text-[12px] transition-colors shrink-0"
            >
              <Plus size={11} strokeWidth={3} />
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-primaryOrange rounded-lg h-7 shrink-0">
              <button
                onClick={() => decrement(product.id)}
                className="w-6 h-7 flex items-center justify-center text-white hover:bg-[#c2410c] rounded-l-lg transition-colors"
              >
                <Minus size={11} strokeWidth={3} />
              </button>
              <span className="font-inter font-bold text-white text-[12px] w-5 text-center">{qty}</span>
              <button
                onClick={() => increment(product.id)}
                className="w-6 h-7 flex items-center justify-center text-white hover:bg-[#c2410c] rounded-r-lg transition-colors"
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
