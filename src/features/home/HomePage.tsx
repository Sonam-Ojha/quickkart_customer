import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BannerCarousel from '@/components/ui/BannerCarousel'
import ProductCard from '@/components/ui/ProductCard'
import CountdownTimer from '@/components/ui/CountdownTimer'
import PromoTile, { type PromoTileData } from '@/components/ui/PromoTile'
import { useCategories } from '@/hooks/useCategories'
import { useBanners } from '@/hooks/useBanners'
import { useProducts } from '@/hooks/useProducts'

const BG_THEME: Record<string, Pick<PromoTileData, 'gradient' | 'ring' | 'accent'>> = {
  'orange-tint':  { gradient: 'from-orange-50 to-amber-50',   ring: 'ring-orange-100',  accent: 'text-orange-600'  },
  'teal-tint':    { gradient: 'from-teal-50 to-cyan-50',      ring: 'ring-teal-100',    accent: 'text-teal-700'    },
  'blue-tint':    { gradient: 'from-blue-50 to-indigo-50',    ring: 'ring-blue-100',    accent: 'text-blue-700'    },
  'emerald-tint': { gradient: 'from-emerald-50 to-green-50',  ring: 'ring-emerald-100', accent: 'text-emerald-700' },
  'rose-tint':    { gradient: 'from-rose-50 to-pink-50',      ring: 'ring-pink-100',    accent: 'text-rose-600'    },
  'purple-tint':  { gradient: 'from-purple-50 to-violet-50',  ring: 'ring-purple-100',  accent: 'text-purple-600'  },
}
const DEFAULT_THEME = BG_THEME['orange-tint']

// Skeleton row for product grids
function ProductSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl bg-gray-100 animate-pulse" style={{ height: 200 }} />
      ))}
    </div>
  )
}

export default function HomePage() {
  const navigate    = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('All')

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

  // Products — All tab (filtered by active category)
  const activeCat = categories.find(c => c.name === activeTab)
  const { data: allData, isLoading: allLoading } = useProducts(
    activeTab === 'All' ? { limit: 12 } : { category_id: activeCat?.id, limit: 12 }
  )

  // Homepage sections
  const { data: dealData,  isLoading: dealLoading  } = useProducts({ tag: 'deal',       limit: 6 })
  const { data: bestData,  isLoading: bestLoading  } = useProducts({ tag: 'bestseller', limit: 6 })
  const { data: freshData, isLoading: freshLoading } = useProducts({ category_name: 'Fresh', limit: 6 })

  const allProducts   = allData?.products   ?? []
  const dealProducts  = dealData?.products  ?? []
  const bestProducts  = bestData?.products  ?? []
  const freshProducts = freshData?.products ?? []

  return (
    <div>
      <div className="max-w-screen-2xl mx-auto px-12 sm:px-16 lg:px-24 py-8 space-y-12">

        {/* ── Hero carousel — dynamic from admin panel ── */}
        {bannersLoading ? (
          <div className="w-full h-56 lg:h-64 rounded-card bg-gray-100 animate-pulse" />
        ) : heroBanners.length > 0 ? (
          <BannerCarousel banners={heroBanners} desktop />
        ) : null}

        {/* ── Promo tile row — dynamic from admin panel ── */}
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

        {/* ── Department tabs + product grid ── */}
        <section>
          <div className="flex items-center gap-0 border-b border-border mb-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('All')}
              className={`relative shrink-0 px-5 py-3 font-inter font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === 'All' ? 'text-primaryOrange' : 'text-textSecondary hover:text-ink'
              }`}
            >
              All
              {activeTab === 'All' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primaryOrange rounded-full" />}
            </button>
            {catsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shrink-0 mx-3 h-4 w-16 bg-gray-100 rounded animate-pulse" />
                ))
              : categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.name)}
                    className={`relative shrink-0 px-5 py-3 font-inter font-semibold text-sm whitespace-nowrap transition-colors ${
                      activeTab === cat.name ? 'text-primaryOrange' : 'text-textSecondary hover:text-ink'
                    }`}
                  >
                    {cat.name}
                    {activeTab === cat.name && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primaryOrange rounded-full" />}
                  </button>
                ))
            }
          </div>
          {allLoading
            ? <ProductSkeleton count={12} />
            : allProducts.length > 0
            ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {allProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <p className="text-center text-textSecondary py-10 font-jakarta text-sm">No products found.</p>
            )
          }
        </section>

        {/* ── Deal of the Day ── */}
        {(dealLoading || dealProducts.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="font-inter font-bold text-ink text-xl">Deal of the Day</h2>
                <CountdownTimer />
              </div>
              <button className="font-inter text-sm text-primaryOrange font-semibold hover:underline">
                See all deals →
              </button>
            </div>
            {dealLoading
              ? <ProductSkeleton count={6} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {dealProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
            }
          </section>
        )}

        {/* ── Best Sellers ── */}
        {(bestLoading || bestProducts.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-inter font-bold text-ink text-xl">Best Sellers</h2>
              <button className="font-inter text-sm text-primaryOrange font-semibold hover:underline">
                See all →
              </button>
            </div>
            {bestLoading
              ? <ProductSkeleton count={6} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {bestProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
            }
          </section>
        )}

        {/* ── Fresh Deals ── */}
        {(freshLoading || freshProducts.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-inter font-bold text-ink text-xl">🥬 Fresh Deals</h2>
              <button
                onClick={() => navigate('/category?tab=Fresh')}
                className="font-inter text-sm text-primaryOrange font-semibold hover:underline"
              >
                See all fresh →
              </button>
            </div>
            {freshLoading
              ? <ProductSkeleton count={6} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {freshProducts.map((p) => <ProductCard key={p.id} product={p} />)}
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
