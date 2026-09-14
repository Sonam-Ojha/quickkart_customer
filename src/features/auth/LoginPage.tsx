import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const redirectTo     = params.get('redirect') ?? '/home'
  const setAuth        = useAuthStore(s => s.setAuth)

  const [mobile, setMobile]   = useState('')
  const [step, setStep]       = useState<'mobile' | 'otp'>('mobile')
  const [otp, setOtp]         = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError]     = useState('')
  const [devOtp, setDevOtp]   = useState<string | null>(null)

  const sendOtp = async () => {
    if (mobile.length !== 10) { setError('Enter a valid 10-digit mobile number'); return }
    setSending(true); setError(''); setDevOtp(null)
    try {
      const { data } = await api.post('/otp/send', { mobile })
      if (data.devOtp) setDevOtp(data.devOtp)
      setStep('otp')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to send OTP')
    } finally { setSending(false) }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) return
    setVerifying(true); setError('')
    try {
      const { data } = await api.post('/auth/otp-login', { mobile, otp })
      setAuth(data.user, data.token)
      navigate(redirectTo)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Invalid OTP')
    } finally { setVerifying(false) }
  }

  return (
    <div className="min-h-screen bg-appBackground flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/home">
            <span className="font-inter font-black text-4xl text-primaryOrange">Jhat</span>
            <span className="font-inter font-black text-4xl text-deepTeal">pats</span>
          </Link>
          <p className="font-jakarta text-textSecondary text-sm mt-2">
            {step === 'mobile' ? 'Enter your mobile number to continue' : `OTP sent to +91 ${mobile}`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">

          {/* Shield icon */}
          <div className="flex items-center gap-3 pb-1">
            <div className="w-10 h-10 rounded-xl bg-orangeTint flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-primaryOrange" />
            </div>
            <div>
              <p className="font-inter font-bold text-ink text-base leading-tight">
                {step === 'mobile' ? 'Login with OTP' : 'Enter OTP'}
              </p>
              <p className="font-jakarta text-xs text-muted mt-0.5">
                {step === 'mobile' ? 'No password needed' : 'Check your SMS'}
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-jakarta">
              <AlertCircle size={14} className="shrink-0" />{error}
            </div>
          )}

          {step === 'mobile' ? (
            <>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  <Phone size={15} className="text-muted" />
                  <span className="font-jakarta text-sm text-muted border-r border-border pr-2">+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  placeholder="98765 43210"
                  autoFocus
                  className="w-full h-12 bg-inputFill border border-border rounded-btn pl-20 pr-4 font-jakarta text-sm text-ink placeholder:text-muted outline-none focus:border-primaryOrange focus:bg-white transition-all"
                />
              </div>
              <button
                onClick={sendOtp}
                disabled={sending || mobile.length !== 10}
                className="w-full h-12 bg-primaryOrange hover:bg-orangeDark text-white font-inter font-bold text-base rounded-btn flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {sending
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ArrowRight size={16} /> Send OTP</>
                }
              </button>
            </>
          ) : (
            <>
              {devOtp && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-xl">🔑</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Demo OTP</p>
                    <p className="font-inter font-black text-2xl tracking-widest text-amber-800">{devOtp}</p>
                  </div>
                </div>
              )}
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                placeholder="• • • • • •"
                autoFocus
                className="w-full h-14 bg-inputFill border border-border rounded-btn px-4 font-inter font-bold text-2xl text-ink text-center tracking-[0.4em] placeholder:text-muted outline-none focus:border-primaryOrange focus:bg-white transition-all"
              />
              <button
                onClick={verifyOtp}
                disabled={verifying || otp.length !== 6}
                className="w-full h-12 bg-primaryOrange hover:bg-orangeDark text-white font-inter font-bold text-base rounded-btn flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {verifying
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Verify & Login <ArrowRight size={16} /></>
                }
              </button>
              <div className="flex items-center justify-between text-sm font-jakarta">
                <button
                  onClick={() => { setStep('mobile'); setOtp(''); setError(''); setDevOtp(null) }}
                  className="text-muted hover:text-ink transition-colors"
                >
                  ← Change number
                </button>
                <button
                  onClick={sendOtp}
                  disabled={sending}
                  className="text-primaryOrange font-semibold hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </div>

        <p className="font-jakarta text-xs text-muted text-center mt-6">
          By continuing, you agree to our{' '}
          <Link to="/info/terms" className="text-primaryOrange hover:underline">Terms</Link> &{' '}
          <Link to="/info/privacy" className="text-primaryOrange hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
