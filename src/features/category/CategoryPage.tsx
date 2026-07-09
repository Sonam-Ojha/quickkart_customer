import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '@/components/ui/ProductCard'
import { useCategories } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'

const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Discount']

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-48" />
      ))}
    </div>
  )
}

export default function CategoryPage() {
  const [params]  = useSearchParams()
  const [sort, setSort] = useState('Relevance')

  const { data: categories = [], isLoading: catsLoading } = useCategories()

  // Find selected category from URL param or default to empty
  const tabName = params.get('tab') ?? ''
  const [selected, setSelected] = useState<number | null>(() => {
    if (!tabName) return null
    return null // will be resolved once categories load
  })
  const [selectedName, setSelectedName] = useState(tabName)

  const handleSelect = (id: number | null, name: string) => {
    setSelected(id)
    setSelectedName(name)
  }

  // Group into parents + children
  const parents  = categories.filter(c => !c.parentId)
  const children = categories.filter(c => c.parentId)
  const getChildren = (parentId: number) => children.filter(c => c.parentId === parentId)

  // Fetch products
  const { data: productsData, isLoading: prodLoading } = useProducts({
    category_id: selected ?? undefined,
    limit: 48,
  })

  const raw = productsData?.products ?? []
  const sorted = [...raw].sort((a, b) => {
    if (sort === 'Price: Low to High')  return a.price - b.price
    if (sort === 'Price: High to Low')  return b.price - a.price
    if (sort === 'Discount') return (b.originalPrice - b.price) - (a.originalPrice - a.price)
    return 0
  })

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">

        {/* ── Left sidebar ── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-cardSurface rounded-2xl border border-border p-4 sticky top-28">
            <h3 className="font-inter font-bold text-ink text-base mb-4">Categories</h3>

            <button
              onClick={() => handleSelect(null, '')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-jakarta mb-1 transition-colors ${
                !selected ? 'bg-orangeTint text-primaryOrange font-semibold' : 'text-textSecondary hover:bg-inputFill'
              }`}
            >
              All Products
            </button>

            {catsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded-lg mb-1 animate-pulse" />
              ))
            ) : parents.length > 0 ? (
              parents.map(parent => (
                <div key={parent.id} className="mt-4">
                  <p className="font-inter font-bold text-ink text-sm px-3 mb-2">
                    {parent.icon ? `${parent.icon} ` : ''}{parent.name}
                  </p>
                  {getChildren(parent.id).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelect(cat.id, cat.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-jakarta transition-colors ${
                        selected === cat.id ? 'bg-orangeTint text-primaryOrange font-semibold' : 'text-textSecondary hover:bg-inputFill'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.id, cat.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-jakarta transition-colors ${
                    selected === cat.id ? 'bg-orangeTint text-primaryOrange font-semibold' : 'text-textSecondary hover:bg-inputFill'
                  }`}
                >
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-inter font-bold text-ink text-2xl">
              {selectedName || 'All Products'}
              {!prodLoading && (
                <span className="font-jakarta font-normal text-sm text-textSecondary ml-2">
                  ({sorted.length} products)
                </span>
              )}
            </h1>
            <div className="flex items-center gap-3">
              <SlidersHorizontal size={16} className="text-textSecondary" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="font-jakarta text-sm text-ink border border-border rounded-lg px-3 py-1.5 bg-white outline-none focus:border-primaryOrange"
              >
                {sortOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Mobile category chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 lg:hidden mb-4">
            <button
              onClick={() => handleSelect(null, '')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-inter font-semibold border transition-colors ${
                !selected ? 'bg-primaryOrange text-white border-primaryOrange' : 'border-border text-textSecondary bg-white'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id, cat.name)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-inter font-semibold border transition-colors ${
                  selected === cat.id ? 'bg-primaryOrange text-white border-primaryOrange' : 'border-border text-textSecondary bg-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {prodLoading ? (
            <ProductSkeleton />
          ) : sorted.length === 0 ? (
            !selected ? (
              // No category selected — show category grid
              <div className="space-y-10">
                {(parents.length > 0 ? parents : categories).map(parent => (
                  <section key={parent.id}>
                    <h2 className="font-inter font-bold text-ink text-lg mb-4">
                      {parent.icon ? `${parent.icon} ` : ''}{parent.name}
                    </h2>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                      {(getChildren(parent.id).length > 0 ? getChildren(parent.id) : [parent]).map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelect(cat.id, cat.name)}
                          className="flex flex-col items-center gap-2 group"
                        >
                          <div className="w-full aspect-square rounded-xl bg-inputFill flex items-center justify-center text-2xl group-hover:bg-orangeTint transition-colors">
                            {cat.icon ?? '🛒'}
                          </div>
                          <span className="font-jakarta text-xs text-textSecondary text-center leading-tight group-hover:text-primaryOrange">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="font-jakarta text-textSecondary">No products found in this category.</p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sorted.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
