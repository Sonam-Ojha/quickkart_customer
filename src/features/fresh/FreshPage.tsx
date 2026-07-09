import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import SearchBar from '@/components/ui/SearchBar'
import { useCartStore } from '@/store/cartStore'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import type { Product } from '@/types/product'

export default function FreshPage() {
  const [activeCatId, setActiveCatId] = useState<number | null>(null)

  const { data: categories = [] } = useCategories()

  const freshParent = categories.find(c => c.name.toLowerCase() === 'fresh' && !c.parentId)
  const freshChildren = freshParent
    ? categories.filter(c => c.parentId === freshParent.id)
    : []

  const { data, isLoading } = useProducts({
    category_id: activeCatId ?? freshParent?.id ?? undefined,
    category_name: (!freshParent && !activeCatId) ? 'Fresh' : undefined,
    limit: 60,
  })

  const shown = data?.products ?? []

  const railItems = [
    { id: null, label: 'All' },
    ...freshChildren.map(c => ({ id: c.id, label: c.name })),
  ]

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-gradient-to-br from-tealDark via-deepTeal to-tealDark text-white px-4 pt-10 pb-5 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-inter font-extrabold text-2xl">Fresh today</h1>
            <p className="font-jakarta text-xs opacity-70 mt-0.5">Hand-picked produce, delivered in 10 minutes</p>
          </div>
          <span className="text-4xl">🥬</span>
        </div>
        <div className="mt-3">
          <SearchBar placeholder="Search fresh produce..." />
        </div>
      </div>

      <div className="flex flex-1">
        {railItems.length > 1 && (
          <nav className="w-[80px] bg-white border-r border-border shrink-0 sticky top-0 self-start">
            {railItems.map(item => (
              <button
                key={item.id ?? 'all'}
                onClick={() => setActiveCatId(item.id)}
                className={`w-full px-2 py-3 text-left text-xs font-jakarta leading-tight border-b border-border transition-colors ${
                  activeCatId === item.id
                    ? 'bg-tealTint text-deepTeal font-semibold border-l-2 border-l-deepTeal'
                    : 'text-textSecondary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex-1 p-3 bg-appBackground">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-deepTeal" />
            </div>
          ) : shown.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-jakarta text-sm text-textSecondary">No fresh produce found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {shown.map(p => <FreshProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FreshProductCard({ product }: { product: Product }) {
  const items     = useCartStore(s => s.items)
  const add       = useCartStore(s => s.add)
  const increment = useCartStore(s => s.increment)
  const decrement = useCartStore(s => s.decrement)

  const qty  = items[String(product.id)]?.qty ?? 0
  const disc = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="bg-cardSurface rounded-card border border-border p-2.5 flex flex-col">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-inputFill mb-2">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover" loading="lazy"
          onError={e => { e.currentTarget.src = 'https://picsum.photos/seed/fresh/200/200' }} />
        <span className="absolute top-1 left-1 bg-deepTeal text-white text-2xs font-inter font-bold px-1.5 py-0.5 rounded-full">
          8 mins
        </span>
      </div>
      <p className="font-jakarta text-xs text-ink line-clamp-1 font-semibold">{product.name}</p>
      {product.weight && <p className="font-jakarta text-2xs text-muted mt-0.5">{product.weight}</p>}
      <div className="flex items-center gap-1 mt-1 mb-2">
        <span className="font-inter font-bold text-sm text-ink">₹{product.price}</span>
        {disc > 0 && <span className="font-inter text-2xs text-success font-semibold">{disc}% off</span>}
      </div>
      {qty === 0 ? (
        <button onClick={() => add(product)}
          className="w-full h-8 bg-cardSurface border border-deepTeal text-deepTeal hover:bg-tealTint rounded-btn text-xs font-inter font-bold uppercase tracking-wide transition-colors">
          ADD
        </button>
      ) : (
        <div className="flex items-center justify-between bg-deepTeal rounded-btn h-8 px-1.5">
          <button onClick={() => decrement(String(product.id))} className="w-6 h-6 flex items-center justify-center text-white font-bold hover:opacity-80">−</button>
          <span className="font-inter font-bold text-white text-sm">{qty}</span>
          <button onClick={() => increment(String(product.id))} className="w-6 h-6 flex items-center justify-center text-white font-bold hover:opacity-80">+</button>
        </div>
      )}
    </div>
  )
}
