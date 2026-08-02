import { useState, useRef, useEffect } from 'react'
import { Mail, ShieldCheck, X, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface Props {
  email: string
  onVerified: () => void
  onClose: () => void
}

export default function OtpModal({ email, onVerified, onClose }: Props) {
  const [otp, setOtp]             = useState(['', '', '', '', '', ''])
  const [sent, setSent]           = useState(false)
  const [sending, setSending]     = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError]         = useState('')
  const [countdown, setCountdown] = useState(0)
  const inputRefs                 = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { handleSend() }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSend = async () => {
    setSending(true); setError('')
    try {
      await api.post('/otp/send', { email })
      setSent(true)
      setCountdown(30)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[index] = val.slice(-1)
    setOtp(next)
    if (val && index < 5) inputRefs.current[index + 1]?.focus()
    if (next.every(d => d !== '')) handleVerify(next.join(''))
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code?: string) => {
    const finalOtp = code ?? otp.join('')
    if (finalOtp.length !== 6) return
    setVerifying(true); setError('')
    try {
      await api.post('/otp/verify', { email, otp: finalOtp })
      onVerified()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } finally {
      setVerifying(false)
    }
  }

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Verify Your Account</p>
              <p className="text-xs text-gray-500">OTP sent to {maskedEmail}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Status row */}
          <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-4 py-3">
            <Mail size={16} className="text-orange-500 shrink-0" />
            <p className="text-sm text-gray-700 flex-1">
              {sending ? 'Sending OTP to your email…' : sent ? 'Check your email for the 6-digit OTP' : 'Preparing…'}
            </p>
            {sending && <Loader2 size={14} className="animate-spin text-orange-500" />}
          </div>

          {/* OTP inputs */}
          <div className="flex gap-2 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
                  border-gray-200 focus:border-orange-500 focus:bg-orange-50
                  disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!sent || verifying}
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* Verify button */}
          <button
            onClick={() => handleVerify()}
            disabled={otp.join('').length !== 6 || verifying || !sent}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifying
              ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
              : 'Verify & Continue'}
          </button>

          {/* Resend */}
          <p className="text-center text-sm text-gray-500">
            Didn't receive OTP?{' '}
            {countdown > 0
              ? <span className="text-gray-400">Resend in {countdown}s</span>
              : <button onClick={handleSend} disabled={sending}
                  className="text-orange-500 font-semibold hover:underline disabled:opacity-50">
                  Resend OTP
                </button>
            }
          </p>
        </div>
      </div>
    </div>
  )
}
