import { useState } from 'react'
import { Phone, ArrowRight, ShieldCheck, X, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

// Inline mobile-number + OTP login, used to authenticate without leaving the
// current page/flow (e.g. mid-checkout or mid-print-order).
export default function LoginOtpModal({ onClose, onSuccess }: Props) {
  const setAuth = useAuthStore(s => s.setAuth)

  const [mobile, setMobile]       = useState('')
  const [step, setStep]           = useState<'mobile' | 'otp'>('mobile')
  const [otp, setOtp]             = useState('')
  const [sending, setSending]     = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError]         = useState('')
  const [devOtp, setDevOtp]       = useState<string | null>(null)

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
      onSuccess()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Invalid OTP')
    } finally { setVerifying(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-8 pt-8 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck size={26} className="text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{step === 'mobile' ? 'Login to continue' : 'Enter OTP'}</p>
              <p className="text-sm text-gray-500 mt-0.5">{step === 'mobile' ? 'No password needed' : `OTP sent to +91 ${mobile}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={24} /></button>
        </div>

        <div className="px-8 pb-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              <AlertCircle size={15} className="shrink-0" />{error}
            </div>
          )}

          {step === 'mobile' ? (
            <>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <Phone size={17} className="text-gray-400" />
                  <span className="text-base text-gray-400 border-r border-gray-200 pr-2.5">+91</span>
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
                  className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl pl-24 pr-4 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>
              <button
                onClick={sendOtp}
                disabled={sending || mobile.length !== 10}
                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {sending
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ArrowRight size={18} /> Send OTP</>}
              </button>
            </>
          ) : (
            <>
              {devOtp && (
                <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-2xl">🔑</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Demo OTP</p>
                    <p className="font-black text-2xl tracking-widest text-amber-800">{devOtp}</p>
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
                className="w-full h-16 bg-gray-50 border border-gray-200 rounded-xl px-4 font-bold text-3xl text-gray-900 text-center tracking-[0.4em] placeholder:text-gray-400 outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
              <button
                onClick={verifyOtp}
                disabled={verifying || otp.length !== 6}
                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {verifying
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Verify & Login <ArrowRight size={18} /></>}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button onClick={() => { setStep('mobile'); setOtp(''); setError(''); setDevOtp(null) }} className="text-gray-400 hover:text-gray-600 transition-colors">
                  ← Change number
                </button>
                <button onClick={sendOtp} disabled={sending} className="text-orange-500 font-semibold hover:underline disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
