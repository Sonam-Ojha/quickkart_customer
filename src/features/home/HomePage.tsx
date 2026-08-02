import { useNavigate } from 'react-router-dom'
import BannerCarousel from '@/components/ui/BannerCarousel'
import ProductCard from '@/components/ui/ProductCard'
import CountdownTimer from '@/components/ui/CountdownTimer'
import PromoTile, { type PromoTileData } from '@/components/ui/PromoTile'
import { useCategories, useCategoryDetail } from '@/hooks/useCategories'
import { useBanners } from '@/hooks/useBanners'
import { useProducts } from '@/hooks/useProducts'
import type { Category } from '@/hooks/useCategories'

const BG_THEME: Record<string, Pick<PromoTileData, 'gradient' | 'ring' | 'accent'>> = {
  'orange-tint':  { gradient: 'from-orange-50 to-amber-50',   ring: 'ring-orange-100',  accent: 'text-orange-600'  },
  'teal-tint':    { gradient: 'from-teal-50 to-cyan-50',      ring: 'ring-teal-100',    accent: 'text-teal-700'    },
  'blue-tint':    { gradient: 'from-blue-50 to-indigo-50',    ring: 'ring-blue-100',    accent: 'text-blue-700'    },
  'emerald-tint': { gradient: 'from-emerald-50 to-green-50',  ring: 'ring-emerald-100', accent: 'text-emerald-700' },
  'rose-tint':    { gradient: 'from-rose-50 to-pink-50',      ring: 'ring-pink-100',    accent: 'text-rose-600'    },
  'purple-tint':  { gradient: 'from-purple-50 to-violet-50',  ring: 'ring-purple-100',  accent: 'text-purple-600'  },
}
const DEFAULT_THEME = BG_THEME['orange-tint']

// Cycling tints for category card backgrounds
const CAT_TINTS = [
  'bg-orange-50 border-orange-100',
  'bg-green-50 border-green-100',
  'bg-blue-50 border-blue-100',
  'bg-purple-50 border-purple-100',
  'bg-yellow-50 border-yellow-100',
  'bg-pink-50 border-pink-100',
  'bg-teal-50 border-teal-100',
  'bg-red-50 border-red-100',
]
const CAT_ICON_BG = [
  'bg-orange-100',
  'bg-green-100',
  'bg-blue-100',
  'bg-purple-100',
  'bg-yellow-100',
  'bg-pink-100',
  'bg-teal-100',
  'bg-red-100',
]

function ProductSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-52" />
      ))}
    </div>
  )
}

// ── Per-category product row (fetches its own data) ───────────────────────────
function CategoryProductRow({ cat }: { cat: Category }) {
  const navigate = useNavigate()
  const { data: detail, isLoading } = useCategoryDetail(cat.id)
  const products = (detail?.products ?? []).slice(0, 6)

  if (!isLoading && products.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {cat.imageUrl
            ? <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
            : cat.icon
              ? <span className="text-2xl">{cat.icon}</span>
              : null
          }
          <h2 className="font-inter font-bold text-ink text-xl">{cat.name}</h2>
        </div>
        <button
          onClick={() => navigate(`/category/${cat.id}`)}
          className="font-inter text-sm text-primaryOrange font-semibold hover:underline whitespace-nowrap"
        >
          See all →
        </button>
      </div>
      {isLoading
        ? <ProductSkeleton count={6} />
        : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )
      }
    </section>
  )
}

// ── Main categories horizontal bar ───────────────────────────────────────────
function MainCategoryBar({ categories, loading }: { categories: Category[]; loading: boolean }) {
  const navigate = useNavigate()
  const roots = categories.filter(c => !c.parentId)

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 flex flex-col items-center gap-3">
              <div className="w-36 h-48 rounded-3xl bg-slate-100 animate-pulse" />
              <div className="w-32 h-4 rounded bg-slate-100 animate-pulse" />
              <div className="w-24 h-4 rounded bg-slate-100 animate-pulse" />
            </div>
          ))
        : roots.map((cat, i) => {
            const iconBg = CAT_ICON_BG[i % CAT_ICON_BG.length]
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                className="shrink-0 flex flex-col items-center gap-3 group w-36"
              >
                {/* Square card */}
                <div className={`w-36 h-48 rounded-3xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-200 group-hover:scale-[1.03] ${!cat.imageUrl ? iconBg : 'bg-slate-50'}`}>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-7xl leading-none select-none">{cat.icon || '🛒'}</span>
                    </div>
                  )}
                </div>
                {/* Name below — bold, large */}
                <p className="font-inter text-sm font-bold text-ink text-center leading-snug line-clamp-2 w-full group-hover:text-primaryOrange transition-colors">
                  {cat.name}
                </p>
              </button>
            )
          })
      }
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()

  const { data: heroBanners = [], isLoading: bannersLoading } = useBanners('hero')
  const { data: promoRaw   = [], isLoading: promosLoading  } = useBanners('promo')
  const { data: categories = [], isLoading: catsLoading    } = useCategories()

  const promoTiles: PromoTileData[] = promoRaw.map(b => ({
    title: b.title,
    sub:   b.subtitle ?? '',
    cta:   'Order Now',
    emoji: b.emoji ?? '🛒',
    img:   b.img,
    to:    b.ctaLink ?? '/home',
    ...(BG_THEME[b.bgType] ?? DEFAULT_THEME),
  }))

  // Homepage special sections
  const { data: dealData,  isLoading: dealLoading  } = useProducts({ tag: 'deal',       limit: 6 })
  const { data: bestData,  isLoading: bestLoading  } = useProducts({ tag: 'bestseller', limit: 6 })

  const dealProducts = dealData?.products  ?? []
  const bestProducts = bestData?.products  ?? []

  // Only root (main) categories for per-category rows
  const mainCategories = categories.filter(c => !c.parentId)

  return (
    <div>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-6 space-y-10">

        {/* ── Hero carousel ── */}
        {bannersLoading ? (
          <div className="w-full h-56 lg:h-64 rounded-card bg-gray-100 animate-pulse" />
        ) : heroBanners.length > 0 ? (
          <BannerCarousel banners={heroBanners} desktop />
        ) : null}

        {/* ── Main categories horizontal icon bar ── */}
        {(catsLoading || mainCategories.length > 0) && (
          <section>
            <MainCategoryBar categories={categories} loading={catsLoading} />
          </section>
        )}

        {/* ── Promo tiles ── */}
        {promosLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : promoTiles.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {promoTiles.map((b) => (
              <PromoTile key={b.title} tile={b} onClick={() => navigate(b.to)} />
            ))}
          </div>
        ) : null}

        {/* ── Deal of the Day ── */}
        {(dealLoading || dealProducts.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-inter font-bold text-ink text-xl">🔥 Deal of the Day</h2>
                <CountdownTimer />
              </div>
              <button className="font-inter text-sm text-primaryOrange font-semibold hover:underline">
                See all →
              </button>
            </div>
            {dealLoading
              ? <ProductSkeleton count={6} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {dealProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            }
          </section>
        )}

        {/* ── Per main-category rows ── */}
        {mainCategories.map(cat => (
          <CategoryProductRow key={cat.id} cat={cat} />
        ))}

        {/* ── Best Sellers ── */}
        {(bestLoading || bestProducts.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-inter font-bold text-ink text-xl">⭐ Best Sellers</h2>
              <button className="font-inter text-sm text-primaryOrange font-semibold hover:underline">
                See all →
              </button>
            </div>
            {bestLoading
              ? <ProductSkeleton count={6} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {bestProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            }
          </section>
        )}

        {/* ── QuickPrints CTA ── */}
        <div
          onClick={() => navigate('/print')}
          className="bg-gradient-to-r from-primaryOrange to-orangeDark rounded-2xl p-8 flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="text-white">
            <p className="font-inter font-black text-3xl">QuickPrints</p>
            <p className="font-jakarta text-base opacity-80 mt-1">Documents printed & delivered in 25 minutes</p>
            <button className="mt-4 bg-white text-primaryOrange font-inter font-bold text-sm px-6 py-2.5 rounded-btn shadow-cta hover:bg-orangeTint transition-colors">
              Upload & Print
            </button>
          </div>
          <span className="text-7xl hidden md:block">🖨️</span>
        </div>

      </div>
    </div>
  )
}
