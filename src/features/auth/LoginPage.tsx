import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const navigate          = useNavigate()
  const [mode, setMode]   = useState<Mode>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm]   = useState({ name: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-appBackground flex">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primaryOrange via-orangeDark to-[#9a3412] flex-col justify-between p-14 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <Link to="/home" className="relative z-10">
          <span className="font-inter font-black text-4xl text-white">quick</span>
          <span className="font-inter font-black text-4xl text-accentYellow">kart</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="font-inter font-black text-white text-5xl leading-tight">
              Groceries<br />delivered in<br />
              <span className="text-accentYellow">10 minutes</span>
            </h1>
            <p className="font-jakarta text-white/70 text-lg mt-4">
              Fresh produce, daily essentials & more — right at your door.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { Icon: Zap,          text: 'Delivery in 10 minutes guaranteed' },
              { Icon: ShieldCheck,  text: '100% fresh & quality assured'      },
              { Icon: Truck,        text: 'Free delivery on orders above ₹99' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-accentYellow" />
                </div>
                <span className="font-jakarta text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-jakarta text-white/40 text-xs relative z-10">
          © 2026 QuickKart · 30,000+ products
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/home" className="flex lg:hidden mb-10">
            <span className="font-inter font-black text-3xl text-primaryOrange">quick</span>
            <span className="font-inter font-black text-3xl text-deepTeal">kart</span>
          </Link>

          <h2 className="font-inter font-bold text-ink text-3xl mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="font-jakarta text-textSecondary text-sm mb-8">
            {mode === 'login'
              ? 'Login to your QuickKart account'
              : 'Sign up to start ordering in minutes'}
          </p>

          {/* Mode toggle */}
          <div className="flex bg-inputFill rounded-btn p-1 mb-8">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg font-inter font-semibold text-sm transition-all ${
                  mode === m
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-textSecondary hover:text-ink'
                }`}
              >
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="font-inter font-semibold text-ink text-sm block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Sonam Ojha"
                  value={form.name}
                  onChange={set('name')}
                  required
                  className="w-full h-12 bg-inputFill border border-border rounded-btn px-4 font-jakarta text-sm text-ink placeholder:text-muted outline-none focus:border-primaryOrange focus:bg-white transition-all"
                />
              </div>
            )}

            <div>
              <label className="font-inter font-semibold text-ink text-sm block mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-jakarta text-sm text-textSecondary flex items-center gap-2">
                  <Phone size={15} className="text-muted" />
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={set('phone')}
                  required
                  maxLength={10}
                  className="w-full h-12 bg-inputFill border border-border rounded-btn pl-16 pr-4 font-jakarta text-sm text-ink placeholder:text-muted outline-none focus:border-primaryOrange focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="font-inter font-semibold text-ink text-sm block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={set('password')}
                  required
                  className="w-full h-12 bg-inputFill border border-border rounded-btn pl-10 pr-12 font-jakarta text-sm text-ink placeholder:text-muted outline-none focus:border-primaryOrange focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <Link to="#" className="font-jakarta text-sm text-primaryOrange hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primaryOrange hover:bg-orangeDark text-white font-inter font-bold text-base rounded-btn shadow-cta flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Login to QuickKart' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {mode === 'register' && (
            <p className="font-jakarta text-xs text-muted text-center mt-4">
              By signing up, you agree to our{' '}
              <Link to="#" className="text-primaryOrange hover:underline">Terms</Link> &{' '}
              <Link to="#" className="text-primaryOrange hover:underline">Privacy Policy</Link>
            </p>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-appBackground px-3 font-jakarta text-xs text-muted">or continue with</span>
            </div>
          </div>

          <button className="w-full h-12 border border-border rounded-btn flex items-center justify-center gap-3 font-inter font-semibold text-sm text-ink hover:bg-inputFill hover:border-ink/20 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="font-jakarta text-sm text-textSecondary text-center mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-primaryOrange font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up free' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
