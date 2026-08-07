import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2, Banknote, CreditCard, ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useSettings } from '@/hooks/useSettings'
import api from '@/lib/api'

declare global {
  interface Window { Razorpay: any }
}

type PayMethod = 'cod' | 'razorpay'

export default function CheckoutPage() {
  const navigate   = useNavigate()
  const items      = useCartStore(s => s.items)
  const clear      = useCartStore(s => s.clear)
  const subtotal   = useCartStore(s => s.subtotal())
  const savings    = useCartStore(s => s.savings())
  const isAuth     = useAuthStore(s => s.isAuthenticated())
  const user       = useAuthStore(s => s.user)

  const { data: settings } = useSettings()
  const deliveryFeeBase = Number(settings?.delivery_fee  ?? 30)
  const freeThreshold   = Number(settings?.free_delivery_threshold ?? 99)
  const handlingCharge  = Number(settings?.handling_charge ?? 5)
  const deliveryFee     = subtotal >= freeThreshold ? 0 : deliveryFeeBase
  const grandTotal      = subtotal + deliveryFee + handlingCharge

  const [payMethod, setPayMethod] = useState<PayMethod>('cod')
  const [placing,   setPlacing]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)

  const itemList = Object.values(items)

  useEffect(() => {
    if (!isAuth) { navigate('/login?redirect=/checkout'); return }
    if (itemList.length === 0 && !success) navigate('/cart')
  }, [isAuth, itemList.length])

  // Load Razorpay script
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  const placeOrderCod = async () => {
    setPlacing(true); setError('')
    try {
      await api.post('/orders', {
        items: itemList.map(i => ({ id: i.id, product_id: i.id, price: i.price, qty: i.qty })),
        payment_method: 'cod',
        delivery_fee:   deliveryFee,
        handling_charge: handlingCharge,
      })
      setSuccess(true)
      clear()
      setTimeout(() => navigate('/home'), 3000)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Order failed. Try again.')
    } finally {
      setPlacing(false)
    }
  }

  const placeOrderRazorpay = async () => {
    setPlacing(true); setError('')
    try {
      // Create Razorpay order on backend
      const { data: rz } = await api.post('/payments/razorpay/create', {
        amount: grandTotal,
      })

      const options = {
        key:         rz.key,
        amount:      rz.amount,
        currency:    'INR',
        name:        'Jhatpats',
        description: 'Order Payment',
        order_id:    rz.razorpay_order_id,
        prefill: {
          name:  user?.name  ?? '',
          email: user?.email ?? '',
          contact: user?.phone ?? '',
        },
        theme: { color: '#f97316' },
        handler: async (response: any) => {
          try {
            // Verify payment + place order
            await api.post('/payments/razorpay/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              items: itemList.map(i => ({ id: i.id, product_id: i.id, price: i.price, qty: i.qty })),
              delivery_fee:   deliveryFee,
              handling_charge: handlingCharge,
            })
            setSuccess(true)
            clear()
            setTimeout(() => navigate('/home'), 3000)
          } catch {
            setError('Payment verification failed. Contact support.')
          } finally {
            setPlacing(false)
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Payment init failed.')
      setPlacing(false)
    }
  }

  const handlePay = () => {
    if (payMethod === 'cod') placeOrderCod()
    else placeOrderRazorpay()
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-appBackground px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-border p-10 shadow-card text-center">
          <div className="w-20 h-20 bg-successBg rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={44} className="text-success" />
          </div>
          <h2 className="font-inter font-bold text-ink text-2xl mb-2">Order Placed!</h2>
          <p className="font-jakarta text-textSecondary mb-5">
            Delivery in <span className="text-deepTeal font-semibold">10 minutes</span>
          </p>
          <div className="bg-inputFill rounded-xl px-6 py-4 mb-4">
            <p className="font-jakarta text-xs text-textSecondary">Order Total</p>
            <p className="font-inter font-extrabold text-3xl text-ink mt-1">₹{grandTotal.toFixed(0)}</p>
          </div>
          <p className="font-jakarta text-xs text-muted">Redirecting to home...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-appBackground">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 h-14 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/cart')} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-inputFill">
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <h1 className="font-inter font-bold text-ink text-lg">Checkout</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <ShoppingBag size={16} className="text-primaryOrange" />
            <h2 className="font-inter font-bold text-ink text-sm">Order Summary ({itemList.length} items)</h2>
          </div>
          <div className="divide-y divide-border">
            {itemList.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta text-sm text-ink line-clamp-1">{item.name}</p>
                  <p className="font-jakarta text-xs text-muted">x{item.qty}</p>
                </div>
                <p className="font-inter font-bold text-ink text-sm">₹{(item.price * item.qty).toFixed(0)}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-inputFill space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-jakarta text-textSecondary">Item total</span>
              <span className="font-inter text-ink">₹{subtotal.toFixed(0)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between">
                <span className="font-jakarta text-textSecondary">Discount</span>
                <span className="font-inter text-success font-semibold">−₹{savings.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-jakarta text-textSecondary">Delivery fee</span>
              <span className={`font-inter font-semibold ${deliveryFee === 0 ? 'text-success' : 'text-ink'}`}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-jakarta text-textSecondary">Handling charge</span>
              <span className="font-inter text-ink">₹{handlingCharge}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-inter font-bold text-ink">Total to Pay</span>
              <span className="font-inter font-bold text-primaryOrange text-base">₹{grandTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-inter font-bold text-ink text-sm mb-4">Select Payment Method</h2>

          {/* COD */}
          <button
            onClick={() => setPayMethod('cod')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all mb-3 ${
              payMethod === 'cod' ? 'border-primaryOrange bg-orangeTint' : 'border-border hover:border-primaryOrange/40'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Banknote size={22} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-inter font-bold text-ink text-sm">Cash on Delivery</p>
              <p className="font-jakarta text-xs text-textSecondary mt-0.5">Pay in cash when order arrives</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              payMethod === 'cod' ? 'border-primaryOrange bg-primaryOrange' : 'border-border'
            }`}>
              {payMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>

          {/* Razorpay / Online */}
          <button
            onClick={() => setPayMethod('razorpay')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              payMethod === 'razorpay' ? 'border-primaryOrange bg-orangeTint' : 'border-border hover:border-primaryOrange/40'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <CreditCard size={22} className="text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-inter font-bold text-ink text-sm">Pay Online</p>
              <p className="font-jakarta text-xs text-textSecondary mt-0.5">UPI • Card • Net Banking via Razorpay</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              payMethod === 'razorpay' ? 'border-primaryOrange bg-primaryOrange' : 'border-border'
            }`}>
              {payMethod === 'razorpay' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>

          {payMethod === 'razorpay' && (
            <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg">
              <p className="font-jakarta text-xs text-blue-700">
                🔒 Secured by Razorpay. Pay with UPI, Credit/Debit Card, Net Banking, or Wallets.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="font-jakarta text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={handlePay}
          disabled={placing}
          className="w-full h-14 bg-primaryOrange text-white rounded-btn shadow-cta font-inter font-bold text-base hover:bg-orangeDark transition-colors flex items-center justify-between px-6 disabled:opacity-60"
        >
          {placing ? (
            <><Loader2 size={20} className="animate-spin mr-2" /> Processing…</>
          ) : (
            <>
              <span>{payMethod === 'cod' ? 'Place Order (COD)' : 'Pay & Place Order'}</span>
              <span className="flex items-center gap-1">
                ₹{grandTotal.toFixed(0)} <ChevronRight size={18} />
              </span>
            </>
          )}
        </button>

        <p className="text-center font-jakarta text-xs text-muted pb-4">
          🔒 Safe & secure checkout
        </p>
      </div>
    </div>
  )
}
