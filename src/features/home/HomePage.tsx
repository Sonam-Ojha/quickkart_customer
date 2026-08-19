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

// Horizontally-scrolling product row: card width is sized so N full cards show
// plus a peek of the next one, signalling the row scrolls for more.
const SCROLL_ROW  = "flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
const SCROLL_ITEM = "shrink-0 snap-start w-[calc((100%-2rem)/2.5)] sm:w-[calc((100%-3rem)/3.5)] md:w-[calc((100%-4rem)/4.5)] lg:w-[calc((100%-5rem)/5.5)] xl:w-[calc((100%-6rem)/6.5)]"

// Cycling tints for category icon-tile backgrounds
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

function ProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={SCROLL_ROW}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${SCROLL_ITEM} rounded-xl bg-gray-100 animate-pulse h-52`} />
      ))}
    </div>
  )
}

// ── Per-category product row (fetches its own data) ───────────────────────────
function CategoryProductRow({ cat }: { cat: Category }) {
  const navigate = useNavigate()
  const { data: detail, isLoading } = useCategoryDetail(cat.id)
  const products = (detail?.products ?? []).slice(0, 8)

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
        ? <ProductSkeleton count={8} />
        : (
          <div className={SCROLL_ROW}>
            {products.map(p => <div key={p.id} className={SCROLL_ITEM}><ProductCard product={p} /></div>)}
          </div>
        )
      }
    </section>
  )
}

// ── Main categories grid ─────────────────────────────────────────────────────
function MainCategoryGrid({ categories, loading }: { categories: Category[]; loading: boolean }) {
  const navigate = useNavigate()
  const roots = categories.filter(c => !c.parentId)

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-3 gap-y-6">
      {loading
        ? Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="w-14 h-3 rounded bg-slate-100 animate-pulse" />
            </div>
          ))
        : roots.map((cat, i) => {
            const iconBg = CAT_ICON_BG[i % CAT_ICON_BG.length]
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                className="flex flex-col items-center gap-2 group"
              >
                {/* Icon tile */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-[1.05] ${!cat.imageUrl ? iconBg : 'bg-slate-50'}`}>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl sm:text-4xl leading-none select-none">{cat.icon || '🛒'}</span>
                  )}
                </div>
                {/* Name below — compact, two lines */}
                <p className="font-inter text-xs sm:text-sm font-semibold text-ink text-center leading-tight line-clamp-2 w-full group-hover:text-primaryOrange transition-colors">
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
  const { data: dealData,  isLoading: dealLoading  } = useProducts({ tag: 'deal',       limit: 8 })
  const { data: bestData,  isLoading: bestLoading  } = useProducts({ tag: 'bestseller', limit: 8 })

  const dealProducts = dealData?.products  ?? []
  const bestProducts = bestData?.products  ?? []

  // Only root (main) categories for per-category rows — capped so total homepage
  // sections (Deal of the Day + category rows + Best Sellers) come to 7
  const mainCategories = categories.filter(c => !c.parentId).slice(0, 5)

  return (
    <div>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-20 2xl:px-28 py-6 space-y-10">

        {/* ── Hero carousel ── */}
        {/* Horizontal inset matches the visual gap the category icons sit in
            (icon width vs. its grid column width) so the banner's edges line
            up with the outermost category icons, not the full grid track. */}
        <div className="px-[calc((100%_-_36px)/8_-_32px)] sm:px-[calc((100%_-_48px)/10_-_40px)] md:px-[calc((100%_-_60px)/12_-_40px)] lg:px-[calc((100%_-_84px)/16_-_40px)] xl:px-[calc((100%_-_108px)/20_-_40px)]">
          {bannersLoading ? (
            <div className="w-full h-56 lg:h-64 rounded-card bg-gray-100 animate-pulse" />
          ) : heroBanners.length > 0 ? (
            <BannerCarousel banners={heroBanners} desktop />
          ) : null}
        </div>

        {/* ── Main categories grid ── */}
        {(catsLoading || mainCategories.length > 0) && (
          <section>
            <MainCategoryGrid categories={categories} loading={catsLoading} />
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
              ? <ProductSkeleton count={8} />
              : <div className={SCROLL_ROW}>
                  {dealProducts.map(p => <div key={p.id} className={SCROLL_ITEM}><ProductCard product={p} /></div>)}
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
              ? <ProductSkeleton count={8} />
              : <div className={SCROLL_ROW}>
                  {bestProducts.map(p => <div key={p.id} className={SCROLL_ITEM}><ProductCard product={p} /></div>)}
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
