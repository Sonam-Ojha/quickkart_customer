import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const EMPTY_OTP = ['', '', '', '', '', '']

// Inline mobile-number + OTP login, used to authenticate without leaving the
// current page/flow (header Login, mid-checkout, mid-print-order). Same
// branded look as the cart's checkout login.
export default function LoginOtpModal({ onClose, onSuccess }: Props) {
  const setAuth = useAuthStore(s => s.setAuth)

  const [mobile, setMobile]   = useState('')
  const [step, setStep]       = useState<'mobile' | 'otp'>('mobile')
  const [otp, setOtp]         = useState(EMPTY_OTP)
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')
  const [devOtp, setDevOtp]   = useState<string | null>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const otpRefs  = useRef<Array<HTMLInputElement | null>>([])

  const otpValue = otp.join('')

  useEffect(() => {
    if (step === 'mobile') phoneRef.current?.focus()
    else otpRefs.current[0]?.focus()
  }, [step])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') back() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const back = () => {
    if (step === 'otp') { setStep('mobile'); setError(''); setDevOtp(null) }
    else onClose()
  }

  const sendOtp = async () => {
    if (mobile.length !== 10 || busy) return
    setBusy(true); setError(''); setDevOtp(null)
    try {
      const { data } = await api.post('/otp/send', { mobile })
      if (data.devOtp) setDevOtp(data.devOtp)
      setOtp(EMPTY_OTP)
      setStep('otp')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to send OTP')
    } finally { setBusy(false) }
  }

  const verifyOtp = async () => {
    if (otpValue.length !== 6 || busy) return
    setBusy(true); setError('')
    try {
      const { data } = await api.post('/auth/otp-login', { mobile, otp: otpValue })
      setAuth(data.user, data.token)
      onSuccess()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Invalid OTP')
      setOtp(EMPTY_OTP)
      otpRefs.current[0]?.focus()
    } finally { setBusy(false) }
  }

  const setOtpDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1)
    setOtp(prev => { const n = [...prev]; n[i] = d; return n })
    setError('')
    if (d && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const ctaClass = (enabled: boolean) =>
    `mt-5 w-full h-14 rounded-btn font-inter font-bold text-base transition-colors ${
      enabled ? 'bg-primaryOrange text-white shadow-cta hover:bg-orangeDark' : 'bg-muted text-white cursor-not-allowed'
    }`

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="px-6 sm:px-10 pt-4 pb-5">
          <div className="relative flex flex-col items-center text-center">
            <button
              onClick={back}
              aria-label="Back"
              className="absolute left-0 top-3.5 w-9 h-9 flex items-center justify-center rounded-full hover:bg-inputFill transition-colors"
            >
              <ArrowLeft size={22} className="text-ink" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-primaryOrange flex items-center justify-center shadow-cta mb-4">
              <ShoppingBag size={30} className="text-white" />
            </div>
            <span className="font-inter font-black text-2xl tracking-tight">
              <span className="text-primaryOrange">Jhat</span>
              <span className="text-deepTeal">pats</span>
            </span>

            {step === 'mobile' ? (
              <>
                <h3 className="font-inter font-extrabold text-ink text-2xl mt-4">Groceries in 10 minutes</h3>
                <p className="font-jakarta text-textSecondary text-base mt-1.5">Log in or Sign up</p>
              </>
            ) : (
              <>
                <h3 className="font-inter font-extrabold text-ink text-2xl mt-4">Verify your number</h3>
                <p className="font-jakarta text-textSecondary text-base mt-1.5">
                  OTP sent to +91 {mobile}{' '}
                  <button onClick={back} className="text-primaryOrange font-semibold hover:underline">
                    Change
                  </button>
                </p>
              </>
            )}
          </div>

          {step === 'mobile' ? (
            <>
              <div className="mt-6 flex items-center h-14 bg-white border border-border rounded-btn px-4 focus-within:border-primaryOrange focus-within:ring-2 focus-within:ring-primaryOrange/15 transition-all">
                <span className="font-inter font-bold text-ink text-base">+91</span>
                <span className="w-px h-6 bg-border mx-3.5" />
                <input ref={phoneRef} value={mobile}
                  onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendOtp() }}
                  type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Enter mobile number"
                  className="flex-1 min-w-0 bg-transparent font-jakarta text-base text-ink placeholder:text-muted outline-none border-none"
                />
              </div>

              {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}

              <button onClick={sendOtp} disabled={busy || mobile.length !== 10}
                className={ctaClass(!busy && mobile.length === 10)}>
                {busy ? 'Sending OTP…' : 'Continue'}
              </button>
            </>
          ) : (
            <>
              {devOtp && (
                <div className="mt-5 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-2xl">🔑</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Demo OTP</p>
                    <p className="font-inter font-black text-2xl tracking-widest text-amber-800">{devOtp}</p>
                  </div>
                </div>
              )}
              <div className="mt-8 flex justify-between gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    value={d}
                    onChange={(e) => setOtpDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) {
                        otpRefs.current[i - 1]?.focus()
                        setOtp(prev => { const n = [...prev]; n[i - 1] = ''; return n })
                      } else if (e.key === 'Enter') {
                        verifyOtp()
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
                      if (!digits.length) return
                      const n = [...EMPTY_OTP]
                      digits.forEach((dg, idx) => { n[idx] = dg })
                      setOtp(n)
                      otpRefs.current[Math.min(digits.length, 5)]?.focus()
                    }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    className="flex-1 min-w-0 h-14 text-center font-inter font-bold text-xl text-ink bg-white border border-border rounded-btn outline-none focus:border-primaryOrange focus:ring-2 focus:ring-primaryOrange/15 transition-all"
                  />
                ))}
              </div>

              {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}

              <button onClick={verifyOtp} disabled={otpValue.length !== 6 || busy}
                className={ctaClass(otpValue.length === 6 && !busy)}>
                {busy ? 'Verifying…' : 'Verify & Continue'}
              </button>

              <p className="mt-4 text-center font-jakarta text-sm text-textSecondary">
                Didn&apos;t receive the code?{' '}
                <button onClick={sendOtp} disabled={busy}
                  className="text-primaryOrange font-semibold hover:underline disabled:opacity-50">
                  Resend OTP
                </button>
              </p>
            </>
          )}
        </div>

        <div className="border-t border-border px-6 sm:px-10 py-4 text-center">
          <p className="font-jakarta text-13 text-muted">
            By continuing, you agree to our{' '}
            <a href="/info/terms-of-service" target="_blank" className="text-textSecondary underline hover:text-primary">Terms of service</a> &{' '}
            <a href="/info/privacy-policy" target="_blank" className="text-textSecondary underline hover:text-primary">Privacy policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
