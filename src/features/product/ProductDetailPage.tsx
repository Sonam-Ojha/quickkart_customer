import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Truck, RotateCcw, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/ui/ProductCard'
import type { Product } from '@/types/product'

export default function ProductDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const add       = useCartStore(s => s.add)
  const increment = useCartStore(s => s.increment)
  const decrement = useCartStore(s => s.decrement)
  const items     = useCartStore(s => s.items)

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}`)
      return data
    },
    enabled: !!id,
  })

  const { data: similarData } = useProducts({
    category_name: product?.category,
    limit: 6,
  })
  const similar = (similarData?.products ?? []).filter(p => String(p.id) !== String(id)).slice(0, 5)

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primaryOrange" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="font-inter text-textSecondary">Product not found.</p>
        <button onClick={() => navigate('/home')} className="mt-4 text-primaryOrange font-semibold text-sm">
          ← Back to Home
        </button>
      </div>
    )
  }

  const qty  = items[String(product.id)]?.qty ?? 0
  const disc = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-textSecondary font-jakarta text-sm mb-6 hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="bg-cardSurface rounded-2xl border border-border p-8 flex items-center justify-center aspect-square">
          <img
            src={product.img}
            alt={product.name}
            className="w-3/4 h-3/4 object-contain"
            onError={e => { e.currentTarget.src = 'https://picsum.photos/seed/product/200/200' }}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {product.badge && (
            <span className="self-start bg-orangeTint text-primaryOrange text-xs font-inter font-bold px-3 py-1 rounded-full uppercase">
              {product.badge}
            </span>
          )}
          <h1 className="font-inter font-bold text-ink text-2xl leading-snug">{product.name}</h1>
          {product.weight && (
            <p className="font-jakarta text-sm text-textSecondary bg-inputFill inline-block px-3 py-1 rounded-full self-start">
              {product.weight}
            </p>
          )}

          <div className="flex items-end gap-3">
            <span className="font-inter font-extrabold text-3xl text-ink">₹{product.price}</span>
            {disc > 0 && (
              <>
                <span className="font-inter text-lg text-muted line-through">₹{product.originalPrice}</span>
                <span className="bg-successBg text-success text-sm font-inter font-bold px-2 py-0.5 rounded">
                  {disc}% off
                </span>
              </>
            )}
          </div>

          {qty === 0 ? (
            <button
              onClick={() => add(product)}
              className="w-full md:w-52 h-11 bg-primaryOrange hover:bg-orangeDark text-white rounded-btn shadow-cta font-inter font-bold text-15 flex items-center justify-center gap-2 transition-colors"
            >
              + Add to Cart
            </button>
          ) : (
            <div className="flex items-center w-full md:w-52 bg-primaryOrange rounded-btn h-11">
              <button onClick={() => decrement(String(product.id))} className="w-11 h-11 flex items-center justify-center text-white text-xl font-bold hover:bg-orangeDark rounded-l-btn transition-colors">−</button>
              <span className="font-inter font-bold text-white text-base flex-1 text-center">{qty}</span>
              <button onClick={() => increment(String(product.id))} className="w-11 h-11 flex items-center justify-center text-white text-xl font-bold hover:bg-orangeDark rounded-r-btn transition-colors">+</button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { Icon: Truck,       label: '10 min delivery' },
              { Icon: ShieldCheck, label: 'Quality assured'  },
              { Icon: RotateCcw,   label: 'Easy returns'     },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-inputFill rounded-card text-center">
                <Icon size={20} className="text-deepTeal" />
                <span className="font-jakarta text-xs text-textSecondary leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="font-inter font-bold text-ink text-xl mb-5">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {similar.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
