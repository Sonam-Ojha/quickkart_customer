import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { SlidersHorizontal, Package } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import CategoryTile, { CATEGORY_GRID } from '@/components/ui/CategoryTile'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { useCategories, useCategoryDetail, useSubCategoryProducts } from '@/hooks/useCategories'
import type { Product } from '@/types/product'

const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Discount']

function sortProducts(products: Product[], sort: string) {
  return [...products].sort((a, b) => {
    if (sort === 'Price: Low to High')  return a.price - b.price
    if (sort === 'Price: High to Low')  return b.price - a.price
    if (sort === 'Discount') return (b.originalPrice - b.price) - (a.originalPrice - a.price)
    return 0
  })
}

// ── Skeleton loaders ─────────────────────────────────────────────────────────
function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-slate-100 animate-pulse h-52" />
      ))}
    </div>
  )
}

// ── Root Category Grid ────────────────────────────────────────────────────────
function RootGrid() {
  const { data: allCats = [], isLoading } = useCategories()
  const roots = allCats.filter(c => !c.parentId)

  if (isLoading) {
    return (
      <div className={CATEGORY_GRID}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-full max-w-[7rem] aspect-square rounded-2xl bg-slate-100 animate-pulse" />
            <div className="w-14 h-3 rounded bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (!roots.length) {
    return (
      <div className="py-20 text-center text-textSecondary font-jakarta">
        No categories found.
      </div>
    )
  }

  return (
    <div className={CATEGORY_GRID}>
      {roots.map(cat => <CategoryTile key={cat.id} cat={cat} />)}
    </div>
  )
}

// ── Category Detail (with subcategory sidebar) ────────────────────────────────
function CategoryDetail({ categoryId }: { categoryId: number }) {
  // null = not yet initialized (waiting for data), will default to first sub
  const [activeSubId, setActiveSubId] = useState<number | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [sort, setSort] = useState('Relevance')

  const { data: detail, isLoading: detailLoading } = useCategoryDetail(categoryId)
  const { data: subData, isLoading: subLoading }   = useSubCategoryProducts(activeSubId)

  const subcategories = detail?.subcategories ?? []
  const category      = detail?.category

  // Auto-select first subcategory once data loads
  useEffect(() => {
    if (!initialized && subcategories.length > 0) {
      setActiveSubId(subcategories[0].id)
      setInitialized(true)
    }
  }, [subcategories, initialized])

  const isLoading = activeSubId ? subLoading : detailLoading

  const rawProducts: Product[] = activeSubId
    ? (subData?.products ?? [])
    : (detail?.products ?? [])

  const products = useMemo(() => sortProducts(rawProducts, sort), [rawProducts, sort])

  const activeSub = subcategories.find(s => s.id === activeSubId)

  return (
    <div className="bg-white border-y sm:border border-border sm:rounded-2xl">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-3 border-b border-border">
        <div className="min-w-0">
          <h1 className="font-inter font-bold text-ink text-base sm:text-lg leading-tight line-clamp-2 sm:truncate">
            {activeSub ? `Buy ${activeSub.name} Online` : (category?.name ?? 'Products')}
          </h1>
          {!isLoading && (
            <p className="font-jakarta text-xs text-textSecondary mt-0.5">
              {category?.name}{activeSub ? ' · ' : ''}{products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal size={15} className="text-textSecondary hidden sm:block" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="font-jakarta text-xs sm:text-sm text-ink border border-border rounded-btn px-2 sm:px-3 py-2 max-w-[7.5rem] sm:max-w-none bg-white outline-none focus:border-primaryOrange"
          >
            {sortOptions.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-start">
        {/* ── Sidebar: Subcategories ── */}
        {subcategories.length > 0 && (
          <aside className="w-16 sm:w-24 lg:w-28 shrink-0 self-start sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar border-r border-border">
            {subcategories.map(sub => {
              const active = activeSubId === sub.id
              return (
                <button
                  key={sub.id}
                  onClick={() => { setActiveSubId(sub.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className={`relative w-full flex flex-col items-center gap-1.5 px-1 sm:px-1.5 py-3 transition-colors ${
                    active ? 'bg-orangeTint/40' : 'hover:bg-inputFill'
                  }`}
                >
                  <span className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center overflow-hidden transition-transform ${
                    active ? 'bg-orangeTint scale-105' : 'bg-inputFill'
                  }`}>
                    {sub.imageUrl
                      ? <img src={sub.imageUrl} alt="" className="w-full h-full object-contain p-1 mix-blend-multiply" />
                      : <span className="text-2xl leading-none">{sub.icon || '🛒'}</span>
                    }
                  </span>
                  <span className={`text-[11px] sm:text-xs text-center leading-tight line-clamp-2 ${
                    active ? 'font-inter font-semibold text-ink' : 'font-jakarta text-textSecondary'
                  }`}>
                    {sub.name}
                  </span>
                  {/* Active indicator bar */}
                  <span className={`absolute right-0 top-2 bottom-2 w-1 rounded-l-full ${active ? 'bg-primaryOrange' : 'bg-transparent'}`} />
                </button>
              )
            })}
          </aside>
        )}

        {/* ── Products ── */}
        <div className="flex-1 min-w-0 self-stretch bg-stone-50 p-2 sm:p-3 sm:rounded-br-2xl">
          {isLoading ? (
            <GridSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <Package size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="font-inter font-semibold text-textSecondary">No products here yet</p>
              <p className="font-jakarta text-sm text-muted mt-1">Check back later or try another subcategory</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page Entry ────────────────────────────────────────────────────────────────
export default function CategoryPage() {
  const { id } = useParams<{ id?: string }>()
  const categoryId = id ? Number(id) : null

  return (
    <div className={`max-w-screen-xl mx-auto sm:px-6 lg:px-8 ${categoryId ? 'py-3 sm:py-8' : 'px-4 py-8'}`}>
      {categoryId ? (
        <CategoryDetail categoryId={categoryId} />
      ) : (
        <>
          <Breadcrumb items={[{ label: 'Categories' }]} />
          <div className="mb-8">
            <h1 className="font-inter font-bold text-ink text-3xl">Categories</h1>
            <p className="font-jakarta text-textSecondary text-sm mt-1">
              Browse all product categories
            </p>
          </div>
          <RootGrid />
        </>
      )}
    </div>
  )
}
