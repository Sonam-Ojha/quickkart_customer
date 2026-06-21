import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Leaf, ShieldCheck, Truck } from 'lucide-react'
import BannerCarousel from '@/components/ui/BannerCarousel'
import ProductCard from '@/components/ui/ProductCard'
import CountdownTimer from '@/components/ui/CountdownTimer'
import { banners } from '@/data/banners'
import { homeCategories } from '@/data/categories'
import { products, dealOfTheDay, bestSellers, freshDeals } from '@/data/products'

const promoBanners = [
  { title: 'Get printouts delivered',   sub: 'Safe, secure & fast',     emoji: '🖨️', color: 'bg-blue-50   border-blue-100',  btn: 'text-blue-700',  to: '/print'    },
  { title: 'Pharmacy at your doorstep', sub: 'Medicines & more',        emoji: '💊', color: 'bg-green-50  border-green-100', btn: 'text-green-700', to: '/category' },
  { title: 'Fresh daily produce',       sub: 'Farm-picked, delivered',  emoji: '🥬', color: 'bg-teal-50   border-teal-100',  btn: 'text-teal-700',  to: '/category' },
  { title: 'No time for a diaper run?', sub: 'Baby care essentials',    emoji: '🍼', color: 'bg-pink-50   border-pink-100',  btn: 'text-pink-700',  to: '/category' },
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
      {/* ── Hero strip ── */}
      <div className="bg-primaryOrange text-white">
        <div className="max-w-screen-2xl mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-accentYellow" />
            <span className="font-inter font-bold text-sm">Delivery in 10 minutes</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-jakarta opacity-90">
            <span className="flex items-center gap-1"><ShieldCheck size={13} /> Quality assured</span>
            <span className="flex items-center gap-1"><Truck size={13} /> Free delivery above ₹99</span>
            <span className="flex items-center gap-1"><Leaf size={13} /> 30,000+ products</span>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 py-8 space-y-12">

        {/* ── Banner + Category grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Banner (3/4 width) */}
          <div className="lg:col-span-3">
            <BannerCarousel banners={banners} desktop />
          </div>

          {/* Category sidebar (1/4 width) */}
          <div className="bg-cardSurface rounded-2xl border border-border p-4">
            <h3 className="font-inter font-bold text-ink text-sm mb-3">Shop by Category</h3>
            <div className="grid grid-cols-2 gap-2">
              {homeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/category?tab=${cat.name}`)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-orangeTint transition-colors group"
                >
                  <span className="text-2xl">{cat.img}</span>
                  <span className="font-jakarta text-xs text-textSecondary group-hover:text-primaryOrange text-center leading-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Promo banners row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {promoBanners.map((b) => (
            <button
              key={b.title}
              onClick={() => navigate(b.to)}
              className={`${b.color} border rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform`}
            >
              <span className="text-3xl">{b.emoji}</span>
              <p className="font-inter font-bold text-ink text-sm mt-2">{b.title}</p>
              <p className="font-jakarta text-xs text-textSecondary mt-0.5">{b.sub}</p>
              <p className={`${b.btn} text-xs font-inter font-semibold mt-3`}>Order Now →</p>
            </button>
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
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
            <button className="mt-4 bg-white text-primaryOrange font-inter font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-orangeTint transition-colors">
              Upload & Print
            </button>
          </div>
          <span className="text-7xl hidden md:block">🖨️</span>
        </div>
      </div>
    </div>
  )
}
