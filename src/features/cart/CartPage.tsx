import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle, ChevronRight, Tag, Loader2, Lock } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useOrderStore } from '@/store/orderStore'
import { useSettings } from '@/hooks/useSettings'
import { useProducts } from '@/hooks/useProducts'
import { useAuthStore } from '@/store/authStore'
import ProductCard from '@/components/ui/ProductCard'
import api from '@/lib/api'

export default function CartPage() {
  const navigate      = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const [success, setSuccess]         = useState(false)
  const [coupon, setCoupon]           = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponMsg, setCouponMsg]     = useState('')
  const [couponOk, setCouponOk]       = useState(false)
  const [applying, setApplying]       = useState(false)

  const items       = useCartStore(s => s.items)
  const increment   = useCartStore(s => s.increment)
  const decrement   = useCartStore(s => s.decrement)
  const removeLine  = useCartStore(s => s.removeLine)
  const clear       = useCartStore(s => s.clear)
  const subtotal    = useCartStore(s => s.subtotal())
  const mrpTotal    = useCartStore(s => s.mrpTotal())
  const savings     = useCartStore(s => s.savings())
  const recordOrder = useOrderStore(s => s.recordOrder)

  const { data: settings } = useSettings()
  const { data: suggestedData } = useProducts({ limit: 4 })

  const deliveryFeeBase  = Number(settings?.delivery_fee  ?? 30)
  const freeThreshold    = Number(settings?.free_delivery_threshold ?? 99)
  const handlingCharge   = Number(settings?.handling_charge ?? 5)

  const deliveryFee  = subtotal >= freeThreshold ? 0 : deliveryFeeBase
  const grandTotal   = subtotal - couponDiscount + deliveryFee + handlingCharge
  const itemList     = Object.values(items)
  const suggested    = (suggestedData?.products ?? []).filter(p => !items[String(p.id)]).slice(0, 4)

  const applyCoupon = async () => {
    if (!coupon.trim()) return
    setApplying(true); setCouponMsg(''); setCouponOk(false); setCouponDiscount(0)
    try {
      const { data } = await api.post('/coupons/validate', { code: coupon.trim(), subtotal })
      setCouponDiscount(data.discount)
      setCouponOk(true)
      setCouponMsg(`✓ ${data.coupon.type === 'percent' ? `${data.coupon.value}%` : `₹${data.coupon.value}`} discount applied!`)
    } catch (err: any) {
      setCouponMsg(err?.response?.data?.message ?? 'Invalid coupon')
    } finally { setApplying(false) }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart')
      return
    }
    recordOrder(itemList, grandTotal)
    setSuccess(true)
    setTimeout(() => { clear(); navigate('/home') }, 3000)
  }

  if (itemList.length === 0 && !success) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-28 h-28 rounded-full bg-orangeTint flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={52} className="text-primaryOrange" />
        </div>
        <h2 className="font-inter font-bold text-ink text-2xl mb-2">Your cart is empty</h2>
        <p className="font-jakarta text-textSecondary mb-8">Add items from the store to get started</p>
        <Link to="/home" className="inline-block bg-primaryOrange text-white font-inter font-bold px-10 py-3 rounded-btn shadow-cta hover:bg-orangeDark transition-colors">
          Shop Now
        </Link>
        {suggested.length > 0 && (
          <div className="mt-16 text-left">
            <h3 className="font-inter font-bold text-ink text-lg mb-5">You might like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {suggested.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-sm mx-auto bg-cardSurface rounded-2xl border border-border p-10 shadow-card">
          <div className="w-20 h-20 bg-successBg rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={44} className="text-success" />
          </div>
          <h2 className="font-inter font-bold text-ink text-2xl mb-2">Order Placed!</h2>
          <p className="font-jakarta text-textSecondary mb-5">
            Delivery in <span className="text-deepTeal font-semibold">10 minutes</span>
          </p>
          <div className="bg-inputFill rounded-xl px-6 py-4 mb-6">
            <p className="font-jakarta text-xs text-textSecondary">Order Total</p>
            <p className="font-inter font-extrabold text-3xl text-ink mt-1">₹{grandTotal.toFixed(0)}</p>
          </div>
          <p className="font-jakarta text-xs text-muted">Redirecting to home...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-xs font-jakarta text-textSecondary mb-6">
        <Link to="/home" className="hover:text-primaryOrange">Home</Link>
        <ChevronRight size={12} />
        <span className="text-ink font-semibold">My Cart</span>
      </nav>

      <h1 className="font-inter font-bold text-2xl text-ink mb-8">
        My Cart <span className="text-textSecondary font-normal text-base">({itemList.length} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-tealTint border border-teal-100 rounded-xl px-5 py-3 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <p className="font-inter font-semibold text-deepTeal text-sm">
              Delivery in <span className="text-tealDark">10 minutes</span>
            </p>
          </div>

          <div className="bg-cardSurface rounded-2xl border border-border overflow-hidden">
            {itemList.map((item, idx) => (
              <div key={item.id} className={`flex items-center gap-4 px-6 py-4 ${idx < itemList.length - 1 ? 'border-b border-border' : ''}`}>
                <img src={item.img} alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-inputFill shrink-0 cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                  onError={e => { e.currentTarget.src = 'https://picsum.photos/seed/product/200/200' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta text-sm text-ink font-medium line-clamp-2">{item.name}</p>
                  {item.weight && <p className="font-jakarta text-xs text-muted mt-0.5">{item.weight}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-inter font-bold text-ink">₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="font-inter text-xs text-muted line-through">₹{item.originalPrice}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => decrement(item.id)} className="w-8 h-8 rounded-btn bg-orangeTint flex items-center justify-center">
                    <Minus size={14} className="text-primaryOrange" />
                  </button>
                  <span className="font-inter font-bold text-ink w-6 text-center">{item.qty}</span>
                  <button onClick={() => increment(item.id)} className="w-8 h-8 rounded-btn bg-primaryOrange flex items-center justify-center">
                    <Plus size={14} className="text-white" />
                  </button>
                </div>
                <p className="font-inter font-bold text-ink text-sm w-16 text-right shrink-0">
                  ₹{(item.price * item.qty).toFixed(0)}
                </p>
                <button onClick={() => removeLine(item.id)} className="ml-2 text-muted hover:text-error transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <Link to="/home" className="inline-flex items-center gap-2 text-primaryOrange font-inter font-semibold text-sm hover:underline">
            + Add more items
          </Link>

          {savings > 0 && (
            <div className="bg-successBg border border-success/20 rounded-xl px-5 py-3 flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <p className="font-inter font-semibold text-success text-sm">
                You're saving ₹{savings.toFixed(0)} on this order!
              </p>
            </div>
          )}

          {suggested.length > 0 && (
            <div className="mt-6">
              <h3 className="font-inter font-bold text-ink text-base mb-4">Frequently bought together</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {suggested.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-cardSurface rounded-2xl border border-border p-5">
            <h3 className="font-inter font-bold text-ink text-sm mb-3 flex items-center gap-2">
              <Tag size={15} className="text-primaryOrange" /> Apply Coupon
            </h3>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponMsg(''); setCouponOk(false); setCouponDiscount(0) }}
                placeholder="Enter coupon code"
                className="flex-1 bg-inputFill border border-border rounded-lg px-3 py-2 text-sm font-jakarta outline-none focus:border-primaryOrange"
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
              />
              <button
                onClick={applyCoupon}
                disabled={applying || !coupon.trim()}
                className="px-4 py-2 bg-primaryOrange text-white rounded-lg font-inter font-bold text-sm hover:bg-orangeDark transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {applying && <Loader2 size={12} className="animate-spin" />}
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={`font-jakarta text-xs mt-2 ${couponOk ? 'text-success' : 'text-error'}`}>
                {couponMsg}
              </p>
            )}
          </div>

          {/* Bill details */}
          <div className="bg-cardSurface rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-inter font-bold text-ink text-sm">Bill Details</h3>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
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
              {couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="font-jakarta text-textSecondary">Coupon discount</span>
                  <span className="font-inter text-success font-semibold">−₹{couponDiscount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-jakarta text-textSecondary">
                  Delivery fee
                  {deliveryFee === 0 && <span className="ml-1 line-through text-muted text-xs">₹{deliveryFeeBase}</span>}
                </span>
                <span className={`font-inter font-semibold ${deliveryFee === 0 ? 'text-success' : 'text-ink'}`}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-jakarta text-textSecondary">Handling charge</span>
                <span className="font-inter text-ink">₹{handlingCharge}</span>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-between">
              <span className="font-inter font-bold text-ink">To Pay</span>
              <span className="font-inter font-bold text-ink text-lg">₹{grandTotal.toFixed(0)}</span>
            </div>
            <div className="px-5 pb-5">
              {!isAuthenticated && (
                <div className="mb-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-jakarta text-amber-700">
                  <Lock size={13} className="shrink-0" />
                  Checkout ke liye login karein
                </div>
              )}
              <button
                onClick={handleCheckout}
                className="w-full h-12 bg-primaryOrange text-white rounded-btn shadow-cta font-inter font-bold text-base hover:bg-orangeDark transition-colors flex items-center justify-between px-5"
              >
                <span>{isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
                <span className="bg-orangeDark/30 px-3 py-1 rounded-btn text-sm">₹{grandTotal.toFixed(0)}</span>
              </button>
              {subtotal < freeThreshold && (
                <p className="text-center font-jakarta text-xs text-textSecondary mt-3">
                  Add ₹{(freeThreshold - subtotal).toFixed(0)} more for free delivery
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
