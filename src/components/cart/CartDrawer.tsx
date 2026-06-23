import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, Plus, Minus, Trash2, ShoppingBag, CheckCircle,
  Clock, ChevronRight, ShieldCheck,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useCartUi } from '@/store/cartUiStore'
import { useOrderStore } from '@/store/orderStore'
import { useAuthStore } from '@/store/authStore'

const DELIVERY_FEE    = 25
const FREE_DELIVERY   = 99
const HANDLING_CHARGE = 5

export default function CartDrawer() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isOpen   = useCartUi((s) => s.isOpen)
  const close    = useCartUi((s) => s.close)

  const items      = useCartStore((s) => s.items)
  const increment  = useCartStore((s) => s.increment)
  const decrement  = useCartStore((s) => s.decrement)
  const removeLine = useCartStore((s) => s.removeLine)
  const clear      = useCartStore((s) => s.clear)
  const subtotal   = useCartStore((s) => s.subtotal())
  const mrpTotal   = useCartStore((s) => s.mrpTotal())
  const savings    = useCartStore((s) => s.savings())
  const recordOrder = useOrderStore((s) => s.recordOrder)
  const setAuth     = useAuthStore((s) => s.setAuth)

  const [success, setSuccess]       = useState(false)
  const [placedTotal, setPlacedTotal] = useState(0)
  const [showAuth, setShowAuth]     = useState(false)
  const [step, setStep]             = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone]           = useState('')
  const [otp, setOtp]               = useState(['', '', '', '', '', ''])
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef    = useRef<HTMLDivElement>(null)
  const closeBtnRef  = useRef<HTMLButtonElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const itemList    = Object.values(items)
  const deliveryFee = subtotal >= FREE_DELIVERY ? 0 : DELIVERY_FEE
  const grandTotal  = subtotal + deliveryFee + HANDLING_CHARGE

  // Lock body scroll + close on Escape while open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showAuth && step === 'otp') setStep('phone')
      else if (showAuth) setShowAuth(false)
      else close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, close, showAuth, step])

  // On open: reset scroll to top + move focus into the dialog
  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollTo(0, 0)
      closeBtnRef.current?.focus()
    }
  }, [isOpen])

  // On close: reset success/auth + cancel any pending auto-clear timer
  useEffect(() => {
    if (!isOpen) {
      setSuccess(false)
      setShowAuth(false)
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    }
  }, [isOpen])

  // Phone modal: focus input when opened, reset everything when closed
  useEffect(() => {
    if (showAuth) {
      setStep('phone')
      phoneInputRef.current?.focus()
    } else {
      setPhone('')
      setOtp(['', '', '', '', '', ''])
      setStep('phone')
    }
  }, [showAuth])

  // Focus the first OTP box when entering the OTP step
  useEffect(() => {
    if (showAuth && step === 'otp') otpRefs.current[0]?.focus()
  }, [showAuth, step])

  // Close the drawer on any route change (browser back/forward, in-app nav)
  useEffect(() => { close() }, [pathname, close])

  // Cancel the timer if the component ever unmounts
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const goShop = () => { close(); navigate('/home') }

  // Step 1: checkout button → open the phone-login modal
  const openCheckout = () => {
    if (itemList.length === 0) return
    setShowAuth(true)
  }

  // Step 2: place the order (after phone login)
  const placeOrder = () => {
    if (itemList.length === 0 || success) return
    recordOrder(itemList, grandTotal)
    setPlacedTotal(grandTotal)
    setShowAuth(false)
    setSuccess(true)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      clear()
      close()
    }, 2500)
  }

  // Step 1 → 2: phone number Continue → move to OTP entry
  const handleContinue = () => {
    if (phone.length !== 10) return
    setOtp(['', '', '', '', '', ''])
    setStep('otp')
  }

  const otpValue = otp.join('')

  // Step 2: verify OTP → sign in (mock) and place the order
  const handleVerify = () => {
    if (otpValue.length !== 6) return
    setAuth(
      { id: `U-${phone}`, name: 'Guest', phone, walletBalance: 0 },
      `token-${phone}`,
    )
    placeOrder()
  }

  const setOtpDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1)
    setOtp((prev) => { const n = [...prev]; n[i] = d; return n })
    if (d && i < 5) otpRefs.current[i + 1]?.focus()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Cart"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-appBackground flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 bg-white border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <button
              ref={closeBtnRef}
              onClick={close}
              aria-label="Close cart"
              className="w-9 h-9 -ml-1.5 flex items-center justify-center rounded-full hover:bg-inputFill transition-colors"
            >
              <ArrowLeft size={20} className="text-ink" />
            </button>
            <h2 className="font-inter font-bold text-ink text-lg">My Cart</h2>
          </div>
          {itemList.length > 0 && !success && (
            <button
              onClick={clear}
              className="flex items-center gap-1 text-textSecondary hover:text-error font-inter font-semibold text-sm transition-colors"
            >
              <Trash2 size={15} /> Clear
            </button>
          )}
        </div>

        {/* ── Success state ── */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 bg-successBg rounded-full flex items-center justify-center mb-5">
              <CheckCircle size={44} className="text-success" />
            </div>
            <h3 className="font-inter font-bold text-ink text-2xl mb-2">Order Placed!</h3>
            <p className="font-jakarta text-textSecondary mb-5">
              Delivery in <span className="text-deepTeal font-semibold">10 minutes</span>
            </p>
            <div className="bg-inputFill rounded-card px-6 py-4">
              <p className="font-jakarta text-xs text-textSecondary">Order Total</p>
              <p className="font-inter font-extrabold text-3xl text-ink mt-1">₹{placedTotal.toFixed(0)}</p>
            </div>
          </div>
        ) : itemList.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-24 h-24 rounded-full bg-orangeTint flex items-center justify-center mb-6">
              <ShoppingBag size={46} className="text-primaryOrange" />
            </div>
            <h3 className="font-inter font-bold text-ink text-xl mb-2">Your cart is empty</h3>
            <p className="font-jakarta text-textSecondary text-sm mb-7">
              Add items to get started — delivered in 10 minutes
            </p>
            <button
              onClick={goShop}
              className="h-11 px-8 bg-primaryOrange text-white rounded-btn shadow-cta font-inter font-bold text-sm hover:bg-orangeDark transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">

              {/* Savings strip */}
              {savings > 0 && (
                <div className="flex items-center justify-between bg-successBg rounded-card px-4 py-2.5">
                  <span className="font-inter font-semibold text-success text-sm">Your total savings</span>
                  <span className="font-inter font-bold text-success text-sm">₹{savings.toFixed(0)}</span>
                </div>
              )}

              {/* Delivery banner + items */}
              <div className="bg-cardSurface rounded-card border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <div className="w-9 h-9 rounded-full bg-tealTint flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-deepTeal" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-inter font-bold text-ink text-sm">Delivery in 10 minutes</p>
                    <p className="font-jakarta text-xs text-muted">
                      Shipment of {itemList.length} item{itemList.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {itemList.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 ${idx < itemList.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-12 h-12 rounded-btn object-cover bg-inputFill shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-jakarta text-sm text-ink line-clamp-2 leading-snug">{item.name}</p>
                      <p className="font-jakarta text-xs text-muted mt-0.5">{item.weight}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-inter font-bold text-ink text-sm">₹{item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="font-inter text-2xs text-muted line-through">₹{item.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center bg-primaryOrange rounded-btn h-8 shrink-0">
                      <button
                        onClick={() => decrement(item.id)}
                        aria-label="Decrease quantity"
                        className="w-7 h-8 flex items-center justify-center text-white hover:bg-orangeDark rounded-l-btn transition-colors"
                      >
                        <Minus size={13} strokeWidth={3} />
                      </button>
                      <span className="font-inter font-bold text-white text-sm w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => increment(item.id)}
                        aria-label="Increase quantity"
                        className="w-7 h-8 flex items-center justify-center text-white hover:bg-orangeDark rounded-r-btn transition-colors"
                      >
                        <Plus size={13} strokeWidth={3} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeLine(item.id)}
                      aria-label="Remove item"
                      className="text-muted hover:text-error transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bill details */}
              <div className="bg-cardSurface rounded-card border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-inter font-bold text-ink text-sm">Bill details</h3>
                </div>
                <div className="px-4 py-3 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="font-jakarta text-textSecondary">Item total (MRP)</span>
                    <span className="font-inter text-ink">₹{mrpTotal.toFixed(0)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between">
                      <span className="font-jakarta text-textSecondary">Item discount</span>
                      <span className="font-inter text-success font-semibold">−₹{savings.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-jakarta text-textSecondary">
                      Delivery charge
                      {deliveryFee === 0 && <span className="ml-1 line-through text-muted text-xs">₹{DELIVERY_FEE}</span>}
                    </span>
                    <span className={`font-inter font-semibold ${deliveryFee === 0 ? 'text-success' : 'text-ink'}`}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-jakarta text-textSecondary">Handling charge</span>
                    <span className="font-inter text-ink">₹{HANDLING_CHARGE}</span>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-border flex justify-between">
                  <span className="font-inter font-bold text-ink">Grand total</span>
                  <span className="font-inter font-bold text-ink">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              {subtotal < FREE_DELIVERY && (
                <p className="text-center font-jakarta text-xs text-textSecondary">
                  Add ₹{(FREE_DELIVERY - subtotal).toFixed(0)} more for free delivery
                </p>
              )}

              {/* Cancellation policy */}
              <div className="bg-cardSurface rounded-card border border-border px-4 py-3">
                <p className="font-inter font-bold text-ink text-sm mb-1">Cancellation Policy</p>
                <p className="font-jakarta text-xs text-muted leading-relaxed">
                  Orders cannot be cancelled once packed for delivery. In case of unexpected delays,
                  a refund will be provided, if applicable.
                </p>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-muted">
                <ShieldCheck size={14} />
                <span className="font-jakarta text-xs">Safe & secure payments</span>
              </div>
            </div>

            {/* Sticky checkout bar */}
            <div className="shrink-0 border-t border-border bg-white p-4">
              <button
                onClick={openCheckout}
                className="w-full h-[52px] bg-primaryOrange hover:bg-orangeDark text-white rounded-btn shadow-cta flex items-center justify-between px-5 transition-colors"
              >
                <span className="flex flex-col items-start leading-none gap-0.5">
                  <span className="font-inter font-extrabold text-base">₹{grandTotal.toFixed(0)}</span>
                  <span className="font-jakarta text-2xs text-white/80">TOTAL</span>
                </span>
                <span className="flex items-center gap-1 font-inter font-bold text-sm">
                  Proceed to Checkout <ChevronRight size={18} />
                </span>
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ── Phone-login modal (QuickKart branding) ── */}
      {showAuth && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAuth(false)} />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-10 pt-4 pb-5">
              <div className="relative flex flex-col items-center text-center">
                <button
                  onClick={() => { if (step === 'otp') setStep('phone'); else setShowAuth(false) }}
                  aria-label="Back"
                  className="absolute left-0 top-3.5 w-9 h-9 flex items-center justify-center rounded-full hover:bg-inputFill transition-colors"
                >
                  <ArrowLeft size={22} className="text-ink" />
                </button>
                <div className="w-16 h-16 rounded-2xl bg-primaryOrange flex items-center justify-center shadow-cta mb-4">
                  <ShoppingBag size={30} className="text-white" />
                </div>
                <span className="font-inter font-black text-2xl tracking-tight">
                  <span className="text-primaryOrange">quick</span>
                  <span className="text-deepTeal">kart</span>
                </span>
                {step === 'phone' ? (
                  <>
                    <h3 className="font-inter font-extrabold text-ink text-2xl mt-4">Groceries in 10 minutes</h3>
                    <p className="font-jakarta text-textSecondary text-base mt-1.5">Log in or Sign up</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-inter font-extrabold text-ink text-2xl mt-4">Verify your number</h3>
                    <p className="font-jakarta text-textSecondary text-base mt-1.5">
                      OTP sent to +91 {phone}{' '}
                      <button
                        onClick={() => setStep('phone')}
                        className="text-primaryOrange font-semibold hover:underline"
                      >
                        Change
                      </button>
                    </p>
                  </>
                )}
              </div>

              {step === 'phone' ? (
                <>
                  {/* Phone input */}
                  <div className="mt-8 flex items-center h-14 bg-white border border-border rounded-btn px-4 focus-within:border-primaryOrange focus-within:ring-2 focus-within:ring-primaryOrange/15 transition-all">
                    <span className="font-inter font-bold text-ink text-base">+91</span>
                    <span className="w-px h-6 bg-border mx-3.5" />
                    <input
                      ref={phoneInputRef}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleContinue() }}
                      inputMode="numeric"
                      placeholder="Enter mobile number"
                      className="flex-1 min-w-0 bg-transparent font-jakarta text-base text-ink placeholder:text-muted outline-none border-none"
                    />
                  </div>

                  {/* Continue */}
                  <button
                    onClick={handleContinue}
                    disabled={phone.length !== 10}
                    className={`mt-5 w-full h-14 rounded-btn font-inter font-bold text-base transition-colors ${
                      phone.length === 10
                        ? 'bg-primaryOrange text-white shadow-cta hover:bg-orangeDark'
                        : 'bg-muted text-white cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  {/* OTP boxes */}
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
                            setOtp((prev) => { const n = [...prev]; n[i - 1] = ''; return n })
                          } else if (e.key === 'Enter') {
                            handleVerify()
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault()
                          const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
                          if (!digits.length) return
                          const n = ['', '', '', '', '', '']
                          digits.forEach((dg, idx) => { n[idx] = dg })
                          setOtp(n)
                          otpRefs.current[Math.min(digits.length, 5)]?.focus()
                        }}
                        inputMode="numeric"
                        maxLength={1}
                        className="flex-1 min-w-0 h-14 text-center font-inter font-bold text-xl text-ink bg-white border border-border rounded-btn outline-none focus:border-primaryOrange focus:ring-2 focus:ring-primaryOrange/15 transition-all"
                      />
                    ))}
                  </div>

                  {/* Verify */}
                  <button
                    onClick={handleVerify}
                    disabled={otpValue.length !== 6}
                    className={`mt-5 w-full h-14 rounded-btn font-inter font-bold text-base transition-colors ${
                      otpValue.length === 6
                        ? 'bg-primaryOrange text-white shadow-cta hover:bg-orangeDark'
                        : 'bg-muted text-white cursor-not-allowed'
                    }`}
                  >
                    Verify &amp; Continue
                  </button>

                  {/* Resend */}
                  <p className="mt-4 text-center font-jakarta text-sm text-textSecondary">
                    Didn&apos;t receive the code?{' '}
                    <button
                      onClick={() => { setOtp(['', '', '', '', '', '']); otpRefs.current[0]?.focus() }}
                      className="text-primaryOrange font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  </p>
                </>
              )}
            </div>

            {/* Terms footer */}
            <div className="border-t border-border px-10 py-4 text-center">
              <p className="font-jakarta text-13 text-muted">
                By continuing, you agree to our{' '}
                <span className="text-textSecondary underline">Terms of service</span> &{' '}
                <span className="text-textSecondary underline">Privacy policy</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
