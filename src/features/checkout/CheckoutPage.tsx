import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, Loader2, Banknote, CreditCard, ChevronRight,
  ShoppingBag, ArrowLeft, MapPin, Plus, X,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useSettings } from '@/hooks/useSettings'
import api from '@/lib/api'

declare global { interface Window { Razorpay: any } }

type PayMethod = 'cod' | 'razorpay'

interface Address {
  id: number
  label: string
  line1: string
  line2?: string
  city: string
  pincode: string
  lat?: number
  lng?: number
  isDefault?: boolean
}

export default function CheckoutPage() {
  const navigate  = useNavigate()
  const items     = useCartStore(s => s.items)
  const clear     = useCartStore(s => s.clear)
  const subtotal  = useCartStore(s => s.subtotal())
  const savings   = useCartStore(s => s.savings())
  const isAuth      = useAuthStore(s => s.isAuthenticated())
  const hasHydrated = useAuthStore(s => s._hasHydrated)
  const user        = useAuthStore(s => s.user)

  const { data: settings } = useSettings()
  const deliveryFeeBase = Number(settings?.delivery_fee ?? 30)
  const freeThreshold   = Number(settings?.free_delivery_threshold ?? 99)
  const handlingCharge  = Number(settings?.handling_charge ?? 5)
  const deliveryFee     = subtotal >= freeThreshold ? 0 : deliveryFeeBase
  const grandTotal      = subtotal + deliveryFee + handlingCharge

  const [payMethod, setPayMethod]         = useState<PayMethod>('cod')
  const [placing, setPlacing]             = useState(false)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState(false)
  const [addresses, setAddresses]         = useState<Address[]>([])
  const [selectedAddr, setSelectedAddr]   = useState<number | null>(null)
  const [showAddrForm, setShowAddrForm]   = useState(false)
  const [savingAddr, setSavingAddr]       = useState(false)
  const [newAddr, setNewAddr]             = useState({ label: 'Home', line1: '', line2: '', city: '', pincode: '' })

  const itemList = Object.values(items)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuth) { navigate('/login?redirect=/checkout'); return }
    if (itemList.length === 0 && !success) navigate('/cart')
  }, [hasHydrated, isAuth, itemList.length])

  // Load Razorpay script
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  // Load saved addresses
  useEffect(() => {
    if (!isAuth) return
    api.get('/addresses').then(({ data }) => {
      setAddresses(data ?? [])
      const def = data?.find((a: Address) => a.isDefault) ?? data?.[0]
      if (def) setSelectedAddr(def.id)
    }).catch(() => {})
  }, [isAuth])

  const getBrowserLocation = (): Promise<{ lat: number; lng: number } | null> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 6000 }
      )
    })

  const saveNewAddress = async () => {
    if (!newAddr.line1 || !newAddr.city || !newAddr.pincode) return
    setSavingAddr(true)
    try {
      const geo = await getBrowserLocation()
      const { data } = await api.post('/addresses', { ...newAddr, ...(geo ?? {}) })
      setAddresses(prev => [data, ...prev])
      setSelectedAddr(data.id)
      setShowAddrForm(false)
      setNewAddr({ label: 'Home', line1: '', line2: '', city: '', pincode: '' })
    } catch {
      // ignore
    } finally {
      setSavingAddr(false)
    }
  }

  const placeOrder = async (extraPayload = {}) => {
    await api.post('/orders', {
      items: itemList.map(i => ({ id: i.id, product_id: i.id, price: i.price, qty: i.qty })),
      payment_method:  'cod',
      delivery_fee:    deliveryFee,
      handling_charge: handlingCharge,
      address_id:      selectedAddr ?? undefined,
      ...extraPayload,
    })
    setSuccess(true)
    clear()
    setTimeout(() => navigate('/orders'), 3000)
  }

  const placeOrderCod = async () => {
    setPlacing(true); setError('')
    try { await placeOrder() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Order failed. Try again.') }
    finally { setPlacing(false) }
  }

  const placeOrderRazorpay = async () => {
    setPlacing(true); setError('')
    try {
      const { data: rz } = await api.post('/payments/razorpay/create', { amount: grandTotal })
      const options = {
        key: rz.key, amount: rz.amount, currency: 'INR',
        name: 'Jhatpats', description: 'Order Payment',
        order_id: rz.razorpay_order_id,
        prefill: { name: user?.name ?? '', email: user?.email ?? '', contact: user?.phone ?? '' },
        theme: { color: '#f97316' },
        handler: async (response: any) => {
          try {
            await api.post('/payments/razorpay/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              items: itemList.map(i => ({ id: i.id, product_id: i.id, price: i.price, qty: i.qty })),
              delivery_fee: deliveryFee, handling_charge: handlingCharge,
              address_id: selectedAddr ?? undefined,
            })
            setSuccess(true); clear()
            setTimeout(() => navigate('/orders'), 3000)
          } catch { setError('Payment verification failed. Contact support.') }
          finally { setPlacing(false) }
        },
        modal: { ondismiss: () => setPlacing(false) },
      }
      new window.Razorpay(options).open()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Payment init failed.')
      setPlacing(false)
    }
  }

  const handlePay = () => payMethod === 'cod' ? placeOrderCod() : placeOrderRazorpay()

  if (success) return (
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
        <p className="font-jakarta text-xs text-muted">Redirecting to your orders…</p>
      </div>
    </div>
  )

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

        {/* ── Delivery Address ── */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primaryOrange" />
              <h2 className="font-inter font-bold text-ink text-sm">Delivery Address</h2>
            </div>
            <button onClick={() => setShowAddrForm(v => !v)}
              className="flex items-center gap-1.5 text-xs font-inter font-semibold text-primaryOrange hover:underline">
              <Plus size={13} /> Add New
            </button>
          </div>

          {/* Add new form */}
          {showAddrForm && (
            <div className="px-5 py-4 bg-orange-50 border-b border-border space-y-3">
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map(l => (
                  <button key={l} onClick={() => setNewAddr(a => ({ ...a, label: l }))}
                    className={`px-3 py-1 rounded-full text-xs font-inter font-semibold border transition-colors ${newAddr.label === l ? 'bg-primaryOrange text-white border-primaryOrange' : 'border-border text-muted bg-white'}`}>
                    {l}
                  </button>
                ))}
              </div>
              {[
                { key: 'line1', placeholder: 'House No / Street *', required: true },
                { key: 'line2', placeholder: 'Area / Landmark' },
                { key: 'city',    placeholder: 'City *', required: true },
                { key: 'pincode', placeholder: 'Pincode *', required: true },
              ].map(f => (
                <input key={f.key}
                  value={(newAddr as any)[f.key]}
                  onChange={e => setNewAddr(a => ({ ...a, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-white font-jakarta text-sm focus:outline-none focus:ring-2 focus:ring-primaryOrange/30"
                />
              ))}
              <p className="text-[11px] font-jakarta text-muted flex items-center gap-1">
                📍 Your current location will be saved for map tracking
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowAddrForm(false)}
                  className="flex-1 h-9 border border-border rounded-xl font-inter font-semibold text-sm text-muted hover:bg-white transition-colors flex items-center justify-center gap-1">
                  <X size={13} /> Cancel
                </button>
                <button onClick={saveNewAddress} disabled={savingAddr || !newAddr.line1 || !newAddr.city || !newAddr.pincode}
                  className="flex-1 h-9 bg-primaryOrange text-white rounded-xl font-inter font-semibold text-sm hover:bg-orangeDark transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                  {savingAddr ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  Save Address
                </button>
              </div>
            </div>
          )}

          {/* Address list */}
          {addresses.length === 0 && !showAddrForm ? (
            <div className="px-5 py-6 text-center">
              <MapPin size={28} className="text-muted mx-auto mb-2" />
              <p className="font-jakarta text-sm text-muted">No saved addresses</p>
              <p className="font-jakarta text-xs text-muted mt-0.5">Add an address for delivery tracking</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {addresses.map(addr => (
                <button key={addr.id} onClick={() => setSelectedAddr(addr.id)}
                  className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors ${selectedAddr === addr.id ? 'bg-orange-50' : 'hover:bg-inputFill'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${selectedAddr === addr.id ? 'border-primaryOrange bg-primaryOrange' : 'border-border'}`}>
                    {selectedAddr === addr.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-bold text-ink text-sm">{addr.label}</p>
                    <p className="font-jakarta text-xs text-muted mt-0.5 truncate">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p className="font-jakarta text-xs text-muted">{addr.city} — {addr.pincode}</p>
                    {addr.lat && addr.lng && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-inter font-semibold mt-0.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> GPS saved
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

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
          <h2 className="font-inter font-bold text-ink text-sm mb-4">Payment Method</h2>

          <button onClick={() => setPayMethod('cod')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all mb-3 ${payMethod === 'cod' ? 'border-primaryOrange bg-orangeTint' : 'border-border hover:border-primaryOrange/40'}`}>
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Banknote size={22} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-inter font-bold text-ink text-sm">Cash on Delivery</p>
              <p className="font-jakarta text-xs text-textSecondary mt-0.5">Pay in cash when order arrives</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payMethod === 'cod' ? 'border-primaryOrange bg-primaryOrange' : 'border-border'}`}>
              {payMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>

          <button onClick={() => setPayMethod('razorpay')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${payMethod === 'razorpay' ? 'border-primaryOrange bg-orangeTint' : 'border-border hover:border-primaryOrange/40'}`}>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <CreditCard size={22} className="text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-inter font-bold text-ink text-sm">Pay Online</p>
              <p className="font-jakarta text-xs text-textSecondary mt-0.5">UPI • Card • Net Banking via Razorpay</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payMethod === 'razorpay' ? 'border-primaryOrange bg-primaryOrange' : 'border-border'}`}>
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

        <button onClick={handlePay} disabled={placing}
          className="w-full h-14 bg-primaryOrange text-white rounded-btn shadow-cta font-inter font-bold text-base hover:bg-orangeDark transition-colors flex items-center justify-between px-6 disabled:opacity-60">
          {placing ? (
            <span className="flex items-center gap-2 mx-auto"><Loader2 size={20} className="animate-spin" /> Processing…</span>
          ) : (
            <>
              <span>{payMethod === 'cod' ? 'Place Order (COD)' : 'Pay & Place Order'}</span>
              <span className="flex items-center gap-1">₹{grandTotal.toFixed(0)} <ChevronRight size={18} /></span>
            </>
          )}
        </button>

        <p className="text-center font-jakarta text-xs text-muted pb-4">🔒 Safe & secure checkout</p>
      </div>
    </div>
  )
}
