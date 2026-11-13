import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CategoryTile, { ViewAllTile, CATEGORY_GRID } from '@/components/ui/CategoryTile'
import { useQueryClient } from '@tanstack/react-query'
import BannerCarousel from '@/components/ui/BannerCarousel'
import ProductCard from '@/components/ui/ProductCard'
import CountdownTimer from '@/components/ui/CountdownTimer'
import PromoTile, { type PromoTileData } from '@/components/ui/PromoTile'
import { useCategories, useCategoryDetail } from '@/hooks/useCategories'
import { useBanners } from '@/hooks/useBanners'
import { useProducts } from '@/hooks/useProducts'
import type { Category } from '@/hooks/useCategories'
import api from '@/lib/api'

interface ServiceStatus { isOpen: boolean; message?: string; reopensAt?: string; nextShiftName?: string }

function useServiceStatus() {
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  useEffect(() => {
    api.get<ServiceStatus>('/service-status')
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ isOpen: true }))
  }, [])
  return status
}

function ClosedScreen({ message, reopensAt, nextShiftName }: { message?: string; reopensAt?: string; nextShiftName?: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-50">
        <span className="text-5xl">🕐</span>
      </div>
      <h1 className="font-inter font-black text-2xl text-gray-900 mb-2">We're closed right now</h1>
      <p className="font-jakarta text-gray-500 text-base max-w-sm leading-relaxed mb-6">
        {message || "We're not accepting orders at the moment. Please check back soon!"}
      </p>
      {reopensAt && (
        <div className="inline-flex items-center gap-2 rounded-2xl bg-orange-50 border border-orange-100 px-5 py-3">
          <span className="text-xl">⏰</span>
          <div className="text-left">
            <p className="font-inter text-xs font-semibold text-orange-400 uppercase tracking-wide">
              {nextShiftName ? `${nextShiftName} shift opens at` : 'Opens at'}
            </p>
            <p className="font-inter font-bold text-orange-600 text-lg leading-tight">
              {(() => {
                try {
                  const d = new Date(reopensAt);
                  return isNaN(d.getTime()) ? reopensAt : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
                } catch { return reopensAt; }
              })()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

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
// Home shows at most this many tiles (two rows on desktop); beyond that the
// last slot becomes "View all", which opens the full category list.
const HOME_CATEGORY_LIMIT = 20

function MainCategoryGrid({ categories, loading }: { categories: Category[]; loading: boolean }) {
  const roots    = categories.filter(c => !c.parentId)
  const overflow = roots.length > HOME_CATEGORY_LIMIT
  const shown    = overflow ? roots.slice(0, HOME_CATEGORY_LIMIT - 1) : roots

  return (
    <div className={CATEGORY_GRID}>
      {loading
        ? Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full max-w-[7rem] aspect-square rounded-2xl bg-slate-100 animate-pulse" />
              <div className="w-14 h-3 rounded bg-slate-100 animate-pulse" />
            </div>
          ))
        : <>
            {shown.map(cat => <CategoryTile key={cat.id} cat={cat} />)}
            {overflow && <ViewAllTile hidden={roots.slice(shown.length)} />}
          </>
      }
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const serviceStatus = useServiceStatus()

  const { data: heroBanners = [], isLoading: bannersLoading } = useBanners('hero')
  const { data: promoRaw   = [], isLoading: promosLoading  } = useBanners('promo')
  const { data: categories = [], isLoading: catsLoading, isError: catsError } = useCategories()
  const queryClient = useQueryClient()

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
  const { data: dealData,  isLoading: dealLoading, isError: dealError } = useProducts({ tag: 'deal', limit: 8 })
  const { data: bestData,  isLoading: bestLoading  } = useProducts({ tag: 'bestseller', limit: 8 })

  const dealProducts = dealData?.products  ?? []
  const bestProducts = bestData?.products  ?? []

  // Only root (main) categories for per-category rows — capped so total homepage
  // sections (Deal of the Day + category rows + Best Sellers) come to 7
  const mainCategories = categories.filter(c => !c.parentId).slice(0, 5)

  if (serviceStatus && !serviceStatus.isOpen) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-20 2xl:px-28 py-6">
        <ClosedScreen
          message={serviceStatus.message}
          reopensAt={serviceStatus.reopensAt}
          nextShiftName={serviceStatus.nextShiftName}
        />
      </div>
    )
  }

  // Backend unreachable — say so with a Retry, rather than an empty page that
  // looks like the catalogue is empty.
  if (catsError && dealError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="font-jakarta text-textSecondary text-base max-w-sm mb-5">
          Couldn't load products. Check your connection and try again.
        </p>
        <button
          onClick={() => queryClient.refetchQueries({ type: 'active' })}
          className="h-11 px-6 border border-deepTeal text-deepTeal hover:bg-tealTint rounded-btn font-inter font-semibold text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-20 2xl:px-28 py-6 space-y-10">

        {/* ── Hero carousel ── */}
        {/* Horizontal inset matches the visual gap the category icons sit in
            (icon width vs. its grid column width) so the banner's edges line
            up with the outermost category icons, not the full grid track. */}
        {(bannersLoading || heroBanners.length > 0) && (
        <div className="px-[calc((100%_-_36px)/8_-_32px)] sm:px-[calc((100%_-_48px)/10_-_40px)] md:px-[calc((100%_-_60px)/12_-_40px)] lg:px-[calc((100%_-_84px)/16_-_40px)] xl:px-[calc((100%_-_108px)/20_-_40px)]">
          {bannersLoading ? (
            <div className="w-full h-56 lg:h-64 rounded-card bg-gray-100 animate-pulse" />
          ) : heroBanners.length > 0 ? (
            <BannerCarousel banners={heroBanners} desktop />
          ) : null}
        </div>
        )}

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
          className="bg-primaryOrange rounded-2xl p-6 sm:p-8 flex items-center justify-between gap-4 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="text-white">
            <p className="font-inter font-black text-2xl sm:text-3xl">QuickPrints</p>
            <p className="font-jakarta text-sm sm:text-base opacity-80 mt-1">Documents printed & delivered in 25 minutes</p>
            <button className="mt-4 bg-white text-primaryOrange font-inter font-bold text-sm px-6 py-2.5 rounded-btn shadow-cta hover:bg-orangeTint transition-colors">
              Upload & Print
            </button>
          </div>
          <span className="text-6xl lg:text-7xl hidden md:block shrink-0">🖨️</span>
        </div>

      </div>
    </div>
  )
}
