import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Search, ShoppingCart, ChevronDown, User, X, LogOut } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useCartUi } from '@/store/cartUiStore'
import { useAuthStore } from '@/store/authStore'


export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const count     = useCartStore((s) => s.count())
  const subtotal  = useCartStore((s) => s.subtotal())
  const openCart  = useCartUi((s) => s.open)
  const user      = useAuthStore((s) => s.user)
  const logout    = useAuthStore((s) => s.logout)
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const inputRef  = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  useEffect(() => {
    if (!location.pathname.includes('search')) setQ('')
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 bg-white">

      {/* ── Main navbar ── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-6">

          {/* Logo */}
          <Link to="/home" className="shrink-0 leading-none">
            <span className="font-inter font-black text-3xl tracking-tight">
              <span className="text-primaryOrange">quick</span>
              <span className="text-deepTeal">kart</span>
            </span>
          </Link>

          {/* Separator */}
          <div className="h-9 w-px bg-border shrink-0 hidden lg:block" />

          {/* Location */}
          <button className="hidden lg:flex items-center gap-2.5 shrink-0 group min-w-[170px]">
            <div className="w-9 h-9 rounded-btn bg-orangeTint flex items-center justify-center shrink-0">
              <MapPin size={17} className="text-primaryOrange" />
            </div>
            <div className="text-left">
              <p className="font-jakarta text-xs text-muted leading-none">Deliver to</p>
              <p className="font-inter font-bold text-ink text-sm leading-snug flex items-center gap-1 mt-0.5">
                Sector 18, Noida
                <ChevronDown size={12} className="text-muted mt-px" />
              </p>
              <p className="font-jakarta text-xs text-muted leading-none mt-0.5">UP 201301</p>
            </div>
          </button>

          {/* Separator */}
          <div className="h-9 w-px bg-border shrink-0 hidden lg:block" />

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div
              className={`flex items-center gap-3 h-11 rounded-card px-4 transition-all duration-150 border-2 ${
                focused
                  ? 'bg-cardSurface border-primaryOrange shadow-search-focus'
                  : 'bg-inputFill border-transparent'
              }`}
            >
              <Search size={18} className="text-muted shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder='Search "milk", "eggs", "atta", "chips"...'
                className="flex-1 bg-transparent font-jakarta text-sm text-ink placeholder:text-muted outline-none border-none"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => { setQ(''); inputRef.current?.focus() }}
                  className="p-0.5 rounded-full hover:bg-border transition-colors"
                >
                  <X size={14} className="text-muted" />
                </button>
              )}
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Login / Profile */}
            {user ? (
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2 h-10 px-4 rounded-btn border border-border font-inter font-semibold text-sm text-ink hover:border-primaryOrange transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primaryOrange to-deepTeal flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={12} className="text-muted" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 bg-white rounded-xl border border-border shadow-card w-48 py-1 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="font-inter font-semibold text-sm text-ink truncate">{user.name}</p>
                      <p className="font-jakarta text-xs text-muted">{user.phone}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setProfileOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-jakarta text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 h-10 px-5 rounded-btn border border-border font-inter font-semibold text-sm text-textSecondary hover:border-primaryOrange hover:text-primaryOrange transition-all whitespace-nowrap"
              >
                <User size={16} />
                Login
              </Link>
            )}

            {/* Cart */}
            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-2.5 h-10 px-5 bg-primaryOrange hover:bg-orangeDark text-white rounded-btn font-inter font-bold text-sm shadow-cta transition-colors whitespace-nowrap"
            >
              <div className="relative">
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-accentYellow text-ink rounded-full text-2xs font-inter font-black flex items-center justify-center px-0.5 leading-none">
                    {count}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {count > 0 ? `₹${subtotal.toFixed(0)}` : 'My Cart'}
              </span>
            </button>
          </div>
        </div>
      </div>

    </header>
  )
}
