import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Search, ShoppingCart, ChevronDown, User, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'


export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const count     = useCartStore((s) => s.count())
  const subtotal  = useCartStore((s) => s.subtotal())
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef  = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  useEffect(() => {
    if (!location.pathname.includes('search')) setQ('')
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: '0 1px 0 #e5e7eb, 0 4px 16px rgba(0,0,0,0.07)' }}>

      {/* ── Layer 1: Announcement bar ── */}
      <div className="bg-[#1C1917]">
        <div className="max-w-screen-2xl mx-auto px-8 h-10 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {[
              { icon: '⚡', text: 'Delivery in 10 minutes'       },
              { icon: '🚚', text: 'Free delivery above ₹99'      },
              { icon: '✅', text: '100% fresh & quality assured' },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-2 text-white/75 font-jakarta text-[13px] whitespace-nowrap">
                <span>{icon}</span>
                {text}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-5 font-jakarta text-[13px] text-white/40">
            <Link to="#" className="hover:text-white/80 transition-colors">Sell on QuickKart</Link>
            <span>|</span>
            <Link to="#" className="hover:text-white/80 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>

      {/* ── Layer 2: Main navbar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-8 h-20 flex items-center gap-6">

          {/* Logo */}
          <Link to="/home" className="shrink-0 leading-none">
            <span className="font-inter font-black text-[30px] tracking-tight">
              <span className="text-primaryOrange">quick</span>
              <span className="text-deepTeal">kart</span>
            </span>
          </Link>

          {/* Separator */}
          <div className="h-9 w-px bg-gray-200 shrink-0 hidden lg:block" />

          {/* Location */}
          <button className="hidden lg:flex items-center gap-2.5 shrink-0 group min-w-[170px]">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <MapPin size={17} className="text-primaryOrange" />
            </div>
            <div className="text-left">
              <p className="font-jakarta text-[11px] text-gray-400 leading-none">Deliver to</p>
              <p className="font-inter font-bold text-gray-900 text-[14px] leading-snug flex items-center gap-1 mt-0.5">
                Sector 18, Noida
                <ChevronDown size={12} className="text-gray-400 mt-px" />
              </p>
              <p className="font-jakarta text-[11px] text-gray-400 leading-none mt-0.5">UP 201301</p>
            </div>
          </button>

          {/* Separator */}
          <div className="h-9 w-px bg-gray-200 shrink-0 hidden lg:block" />

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div
              className="flex items-center gap-3 h-11 rounded-xl px-4 transition-all duration-150"
              style={{
                background: focused ? '#fff' : '#F5F5F4',
                border: focused ? '2px solid #EA580C' : '2px solid transparent',
                boxShadow: focused ? '0 0 0 3px rgba(234,88,12,0.12)' : 'none',
                outline: 'none',
              }}
            >
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder='Search "milk", "eggs", "atta", "chips"...'
                className="flex-1 bg-transparent font-jakarta text-[14px] text-gray-900 placeholder:text-gray-400 outline-none border-none"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => { setQ(''); inputRef.current?.focus() }}
                  className="p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Login */}
            <Link
              to="/login"
              className="hidden lg:flex items-center gap-2 h-10 px-5 rounded-xl border border-gray-200 font-inter font-semibold text-[14px] text-gray-700 hover:border-primaryOrange hover:text-primaryOrange transition-all whitespace-nowrap"
            >
              <User size={16} />
              Login
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-2.5 h-10 px-5 bg-primaryOrange hover:bg-[#c2410c] text-white rounded-xl font-inter font-bold text-[14px] transition-colors whitespace-nowrap"
            >
              <div className="relative">
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-accentYellow text-[#1C1917] rounded-full text-[10px] font-inter font-black flex items-center justify-center px-0.5 leading-none">
                    {count}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {count > 0 ? `₹${subtotal.toFixed(0)}` : 'My Cart'}
              </span>
            </Link>
          </div>
        </div>
      </div>

    </header>
  )
}
