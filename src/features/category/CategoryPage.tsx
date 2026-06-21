import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { products } from '@/data/products'

const sections = [
  {
    title: 'Grocery & Kitchen', emoji: '🧅',
    categories: ['Fruits & Veg', 'Dairy & Eggs', 'Atta & Rice', 'Oils & Ghee', 'Spices', 'Snacks', 'Beverages', 'Frozen Foods'],
  },
  {
    title: 'Snacks & Drinks', emoji: '🧃',
    categories: ['Chips & Namkeen', 'Biscuits', 'Cold Drinks', 'Juices', 'Tea & Coffee', 'Energy Drinks', 'Water', 'Chocolates'],
  },
  {
    title: 'Beauty & Personal Care', emoji: '💄',
    categories: ['Skin Care', 'Hair Care', 'Bath & Body', 'Oral Care', 'Feminine Care', "Men's Grooming", 'Fragrances', 'Baby Care'],
  },
  {
    title: 'Household Essentials', emoji: '🧹',
    categories: ['Cleaning', 'Detergents', 'Kitchen Supplies', 'Pest Control', 'Air Fresheners', 'Paper Products', 'Pooja Items', 'Stationery'],
  },
]

const catEmojis: Record<string, string> = {
  'Fruits & Veg':'🥦','Dairy & Eggs':'🥛','Atta & Rice':'🌾','Oils & Ghee':'🫙',
  'Spices':'🌶️','Snacks':'🍟','Beverages':'🧃','Frozen Foods':'🧊',
  'Chips & Namkeen':'🥔','Biscuits':'🍪','Cold Drinks':'🥤','Juices':'🍊',
  'Tea & Coffee':'☕','Energy Drinks':'⚡','Water':'💧','Chocolates':'🍫',
  'Skin Care':'✨','Hair Care':'💇','Bath & Body':'🛁','Oral Care':'🦷',
  'Feminine Care':'🌸',"Men's Grooming":'🪒','Fragrances':'🌹','Baby Care':'🍼',
  'Cleaning':'🧽','Detergents':'🫧','Kitchen Supplies':'🍳','Pest Control':'🪲',
  'Air Fresheners':'🌿','Paper Products':'📄','Pooja Items':'🪔','Stationery':'✏️',
}

const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Discount']

export default function CategoryPage() {
  const [params]         = useSearchParams()
const [selected, setSelected] = useState(params.get('tab') ?? '')
  const [sort, setSort]  = useState('Relevance')

  const shown = selected
    ? products.filter((p) =>
        p.category?.toLowerCase().includes(selected.toLowerCase()) ||
        selected.toLowerCase().includes((p.category ?? '').toLowerCase())
      )
    : products

  const sorted = [...shown].sort((a, b) => {
    if (sort === 'Price: Low to High')  return a.price - b.price
    if (sort === 'Price: High to Low')  return b.price - a.price
    if (sort === 'Discount') return (b.originalPrice - b.price) - (a.originalPrice - a.price)
    return 0
  })

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-8">


<div className="flex gap-8">
        {/* ── Left sidebar ── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-cardSurface rounded-2xl border border-border p-4 sticky top-28">
            <h3 className="font-inter font-bold text-ink text-base mb-4">Categories</h3>
            <button
              onClick={() => setSelected('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-jakarta mb-1 transition-colors ${
                !selected ? 'bg-orangeTint text-primaryOrange font-semibold' : 'text-textSecondary hover:bg-inputFill'
              }`}
            >
              All Products
            </button>
            {sections.map((sec) => (
              <div key={sec.title} className="mt-4">
                <p className="font-inter font-bold text-ink text-sm px-3 mb-2">{sec.emoji} {sec.title}</p>
                {sec.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelected(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-jakarta transition-colors ${
                      selected === cat ? 'bg-orangeTint text-primaryOrange font-semibold' : 'text-textSecondary hover:bg-inputFill'
                    }`}
                  >
                    {catEmojis[cat]} {cat}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-inter font-bold text-ink text-2xl">
              {selected || 'All Products'}
              <span className="font-jakarta font-normal text-sm text-textSecondary ml-2">
                ({sorted.length} products)
              </span>
            </h1>
            <div className="flex items-center gap-3">
              <SlidersHorizontal size={16} className="text-textSecondary" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="font-jakarta text-sm text-ink border border-border rounded-lg px-3 py-1.5 bg-white outline-none focus:border-primaryOrange"
              >
                {sortOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Mobile category chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 lg:hidden mb-4">
            <button
              onClick={() => setSelected('')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-inter font-semibold border transition-colors ${
                !selected ? 'bg-primaryOrange text-white border-primaryOrange' : 'border-border text-textSecondary bg-white'
              }`}
            >
              All
            </button>
            {sections.flatMap((s) => s.categories).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-inter font-semibold border transition-colors ${
                  selected === cat ? 'bg-primaryOrange text-white border-primaryOrange' : 'border-border text-textSecondary bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-jakarta text-textSecondary">No products found in this category.</p>
            </div>
          ) : (
            /* ── If no category selected show section grid ── */
            !selected ? (
              <div className="space-y-10">
                {sections.map((sec) => (
                  <section key={sec.title}>
                    <h2 className="font-inter font-bold text-ink text-lg mb-4">{sec.emoji} {sec.title}</h2>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-6">
                      {sec.categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelected(cat)}
                          className="flex flex-col items-center gap-2 group"
                        >
                          <div className="w-full aspect-square rounded-xl bg-inputFill flex items-center justify-center text-2xl group-hover:bg-orangeTint transition-colors">
                            {catEmojis[cat]}
                          </div>
                          <span className="font-jakarta text-xs text-textSecondary text-center leading-tight group-hover:text-primaryOrange">
                            {cat}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {sorted.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
