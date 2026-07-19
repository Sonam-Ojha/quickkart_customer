import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, SlidersHorizontal, ChevronRight, Package } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { useCategories, useCategoryDetail, useSubCategoryProducts } from '@/hooks/useCategories'
import type { Product } from '@/types/product'

// ── Background tints cycling for root category cards ─────────────────────────
const TINTS = [
  'bg-orange-50  border-orange-100',
  'bg-green-50   border-green-100',
  'bg-blue-50    border-blue-100',
  'bg-purple-50  border-purple-100',
  'bg-yellow-50  border-yellow-100',
  'bg-pink-50    border-pink-100',
  'bg-teal-50    border-teal-100',
  'bg-red-50     border-red-100',
]

const ICON_BG = [
  'bg-orange-100 text-orange-600',
  'bg-green-100  text-green-600',
  'bg-blue-100   text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-yellow-100 text-yellow-600',
  'bg-pink-100   text-pink-600',
  'bg-teal-100   text-teal-600',
  'bg-red-100    text-red-600',
]

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
  const navigate = useNavigate()
  const { data: allCats = [], isLoading } = useCategories()
  const roots    = allCats.filter(c => !c.parentId)
  const children = allCats.filter(c => c.parentId)
  const subCount = (parentId: number) => children.filter(c => c.parentId === parentId).length

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-100 animate-pulse h-36" />
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {roots.map((cat, i) => {
        const tint   = TINTS[i % TINTS.length]
        const iconBg = ICON_BG[i % ICON_BG.length]
        const subs   = subCount(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => navigate(`/category/${cat.id}`)}
            className={`relative flex flex-col gap-4 p-5 rounded-2xl border ${tint} hover:shadow-md hover:-translate-y-0.5 transition-all text-left group`}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${iconBg}`}>
              {cat.image_url
                ? <img src={cat.image_url} alt={cat.name} className="w-10 h-10 object-cover rounded-lg" />
                : cat.icon || '🛒'
              }
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="font-inter font-bold text-ink text-base leading-snug">{cat.name}</p>
              {subs > 0 && (
                <p className="font-jakarta text-xs text-textSecondary mt-1">
                  {subs} subcategor{subs === 1 ? 'y' : 'ies'}
                </p>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight
              size={16}
              className="absolute top-5 right-4 text-textSecondary opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>
        )
      })}
    </div>
  )
}

// ── Category Detail (with subcategory sidebar) ────────────────────────────────
function CategoryDetail({ categoryId }: { categoryId: number }) {
  const navigate   = useNavigate()
  const [activeSubId, setActiveSubId] = useState<number | null>(null)  // null = All
  const [sort, setSort] = useState('Relevance')

  const { data: detail, isLoading: detailLoading } = useCategoryDetail(categoryId)
  const { data: subData, isLoading: subLoading }   = useSubCategoryProducts(activeSubId)

  const isLoading = activeSubId ? subLoading : detailLoading

  const rawProducts: Product[] = activeSubId
    ? (subData?.products ?? [])
    : (detail?.products ?? [])

  const products = useMemo(() => sortProducts(rawProducts, sort), [rawProducts, sort])

  const subcategories = detail?.subcategories ?? []
  const category      = detail?.category

  return (
    <div>
      {/* ── Breadcrumb / Back ── */}
      <button
        onClick={() => navigate('/category')}
        className="flex items-center gap-2 text-textSecondary font-jakarta text-sm mb-6 hover:text-primaryOrange transition-colors"
      >
        <ArrowLeft size={16} />
        All Categories
      </button>

      <div className="flex gap-8 items-start">

        {/* ── Sidebar: Subcategories ── */}
        {subcategories.length > 0 && (
          <aside className="hidden lg:block w-52 shrink-0 sticky top-28">
            <div className="bg-white rounded-2xl border border-border p-4">
              <p className="font-inter font-bold text-ink text-sm mb-3 px-2">
                {category?.icon} {category?.name}
              </p>

              {/* All option */}
              <button
                onClick={() => setActiveSubId(null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-jakarta mb-1 transition-colors ${
                  !activeSubId
                    ? 'bg-orangeTint text-primaryOrange font-semibold'
                    : 'text-textSecondary hover:bg-inputFill'
                }`}
              >
                <span>All</span>
                {!activeSubId && <div className="w-1.5 h-1.5 rounded-full bg-primaryOrange" />}
              </button>

              <div className="h-px bg-border my-2" />

              {/* Subcategories */}
              {subcategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubId(sub.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-jakarta mb-0.5 transition-colors ${
                    activeSubId === sub.id
                      ? 'bg-orangeTint text-primaryOrange font-semibold'
                      : 'text-textSecondary hover:bg-inputFill'
                  }`}
                >
                  <span className="text-left leading-snug">{sub.icon ? `${sub.icon} ` : ''}{sub.name}</span>
                  {activeSubId === sub.id && <div className="w-1.5 h-1.5 rounded-full bg-primaryOrange shrink-0" />}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <div>
              <h1 className="font-inter font-bold text-ink text-2xl leading-tight">
                {activeSubId
                  ? subcategories.find(s => s.id === activeSubId)?.name ?? 'Products'
                  : (category?.name ?? 'Products')
                }
              </h1>
              {!isLoading && (
                <p className="font-jakarta text-sm text-textSecondary mt-0.5">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal size={15} className="text-textSecondary" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="font-jakarta text-sm text-ink border border-border rounded-xl px-3 py-2 bg-white outline-none focus:border-primaryOrange"
              >
                {sortOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Mobile: subcategory chips */}
          {subcategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 lg:hidden mb-5">
              <button
                onClick={() => setActiveSubId(null)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-inter font-semibold border transition-colors ${
                  !activeSubId
                    ? 'bg-primaryOrange text-white border-primaryOrange'
                    : 'border-border text-textSecondary bg-white'
                }`}
              >
                All
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubId(sub.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-inter font-semibold border transition-colors ${
                    activeSubId === sub.id
                      ? 'bg-primaryOrange text-white border-primaryOrange'
                      : 'border-border text-textSecondary bg-white'
                  }`}
                >
                  {sub.icon} {sub.name}
                </button>
              ))}
            </div>
          )}

          {/* Products */}
          {isLoading ? (
            <GridSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <Package size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="font-inter font-semibold text-textSecondary">No products here yet</p>
              <p className="font-jakarta text-sm text-muted mt-1">Check back later or try another subcategory</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {categoryId ? (
        <CategoryDetail categoryId={categoryId} />
      ) : (
        <>
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
