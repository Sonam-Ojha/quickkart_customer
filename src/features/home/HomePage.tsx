import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BannerCarousel from '@/components/ui/BannerCarousel'
import ProductCard from '@/components/ui/ProductCard'
import CountdownTimer from '@/components/ui/CountdownTimer'
import PromoTile, { type PromoTileData } from '@/components/ui/PromoTile'
import { banners } from '@/data/banners'
import { products, dealOfTheDay, bestSellers, freshDeals } from '@/data/products'

const PIMG = '?w=600&q=80&auto=format&fit=crop'

const promoBanners: PromoTileData[] = [
  { title: 'Get printouts delivered',   sub: 'Safe, secure & fast',    cta: 'Order Now', emoji: '🖨️', img: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40${PIMG}`, gradient: 'from-blue-50 to-indigo-50',   ring: 'ring-blue-100',    accent: 'text-blue-700',  to: '/print'    },
  { title: 'Pharmacy at your doorstep', sub: 'Medicines & more',       cta: 'Order Now', emoji: '💊', img: `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae${PIMG}`, gradient: 'from-emerald-50 to-green-50', ring: 'ring-emerald-100', accent: 'text-emerald-700', to: '/category' },
  { title: 'Fresh daily produce',       sub: 'Farm-picked, delivered', cta: 'Order Now', emoji: '🥬', img: `https://images.unsplash.com/photo-1542838132-92c53300491e${PIMG}`, gradient: 'from-teal-50 to-cyan-50',     ring: 'ring-teal-100',    accent: 'text-deepTeal',  to: '/category' },
  { title: 'No time for a diaper run?', sub: 'Baby care essentials',   cta: 'Order Now', emoji: '🍼', img: `https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4${PIMG}`, gradient: 'from-rose-50 to-pink-50',     ring: 'ring-pink-100',    accent: 'text-rose-600',  to: '/category' },
]

export default function HomePage() {
  const navigate    = useNavigate()
  const [activeTab, setActiveTab] = useState('All')

  const tabs = ['All', 'Fresh', 'Dairy', 'Snacks', 'Bakery', 'Beverages', 'Beauty', 'Staples']

  const tabProducts = activeTab === 'All'
    ? products
    : products.filter((p) => p.category?.toLowerCase() === activeTab.toLowerCase() ||
        p.category?.toLowerCase().includes(activeTab.toLowerCase()))

  return (
    <div>
      <div className="max-w-screen-2xl mx-auto px-12 sm:px-16 lg:px-24 py-8 space-y-12">

        {/* ── Banner ── */}
        <BannerCarousel banners={banners} desktop />

        {/* ── Promo banners row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {promoBanners.map((b) => (
            <PromoTile key={b.title} tile={b} onClick={() => navigate(b.to)} />
          ))}
        </div>

        {/* ── Department tabs + grid ── */}
        <section>
          <div className="flex items-center gap-0 border-b border-border mb-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative shrink-0 px-5 py-3 font-inter font-semibold text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'text-primaryOrange' : 'text-textSecondary hover:text-ink'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primaryOrange rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tabProducts.slice(0, 12).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ── Deal of the Day ── */}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {dealOfTheDay.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ── Best Sellers ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-inter font-bold text-ink text-xl">Best Sellers</h2>
            <button className="font-inter text-sm text-primaryOrange font-semibold hover:underline">
              See all →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ── Fresh Deals ── */}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {freshDeals.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

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
