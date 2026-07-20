import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Tag } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { useProducts } from '@/hooks/useProducts'
import { useSettings, parseWhyItems } from '@/hooks/useSettings'
import ProductCard from '@/components/ui/ProductCard'
import type { Product } from '@/types/product'

const TAG_LABELS: Record<string, string> = {
  deal:       '🔥 Deal of the Day',
  bestseller: '⭐ Best Seller',
  new:        '🆕 New Arrival',
  fresh:      '🌿 Fresh Pick',
}

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

  const { data: settings } = useSettings()
  const whyItems = parseWhyItems(settings?.why_choose_us ?? '[]')

  const { data: similarData } = useProducts({ category_name: product?.category, limit: 6 })
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
        <button onClick={() => navigate('/home')} className="mt-4 text-primaryOrange font-semibold text-sm">← Back to Home</button>
      </div>
    )
  }

  const qty  = items[String(product.id)]?.qty ?? 0
  const disc = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Categories', href: '/category' },
        ...(product.category ? [{ label: product.category }] : []),
        { label: product.name },
      ]} />

      {/* ── Main Grid: Image | Right Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 xl:gap-14 items-start">

        {/* ── Left: Product Image ── */}
        <div className="sticky top-24">
          <div className="bg-white rounded-3xl border border-border p-8 aspect-square flex items-center justify-center shadow-sm">
            <img
              src={product.img}
              alt={product.name}
              className="w-4/5 h-4/5 object-contain drop-shadow-md"
              onError={e => { e.currentTarget.src = 'https://picsum.photos/seed/product/400/400' }}
            />
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col gap-5">

          {/* Badge */}
          {product.badge && (
            <span className="self-start bg-orangeTint text-primaryOrange text-xs font-inter font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {TAG_LABELS[product.badge] ?? product.badge}
            </span>
          )}

          {/* Name */}
          <h1 className="font-inter font-bold text-ink text-3xl leading-tight">{product.name}</h1>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            {product.weight && (
              <span className="font-jakarta text-sm text-textSecondary bg-inputFill border border-border px-3 py-1 rounded-full">
                {product.weight}
              </span>
            )}
            {product.category && (
              <span className="font-jakarta text-sm text-textSecondary bg-inputFill border border-border px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Price row */}
          <div className="flex items-center gap-3">
            <span className="font-inter font-extrabold text-4xl text-ink">₹{product.price}</span>
            {disc > 0 && (
              <>
                <span className="font-inter text-xl text-muted line-through">₹{product.originalPrice}</span>
                <span className="bg-green-100 text-green-700 text-sm font-inter font-bold px-2.5 py-1 rounded-lg">
                  {disc}% off
                </span>
              </>
            )}
          </div>

          {/* Savings callout */}
          {disc > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
              <Tag size={14} className="text-green-600 shrink-0" />
              <span className="font-jakarta text-sm text-green-700">
                You save <strong>₹{product.originalPrice - product.price}</strong> on this order
              </span>
            </div>
          )}

          {/* Add to Cart */}
          {qty === 0 ? (
            <button
              onClick={() => add(product)}
              className="w-full sm:w-64 h-12 bg-primaryOrange hover:bg-orangeDark text-white rounded-btn shadow-cta font-inter font-bold text-base flex items-center justify-center gap-2 transition-colors"
            >
              + Add to Cart
            </button>
          ) : (
            <div className="flex items-center w-full sm:w-64 bg-primaryOrange rounded-btn h-12">
              <button onClick={() => decrement(String(product.id))} className="w-12 h-12 flex items-center justify-center text-white text-2xl font-bold hover:bg-orangeDark rounded-l-btn transition-colors">−</button>
              <span className="font-inter font-bold text-white text-lg flex-1 text-center">{qty}</span>
              <button onClick={() => increment(String(product.id))} className="w-12 h-12 flex items-center justify-center text-white text-2xl font-bold hover:bg-orangeDark rounded-r-btn transition-colors">+</button>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* ── Why Choose Us — compact vertical list ── */}
          {whyItems.length > 0 && (
            <div className="space-y-3">
              <p className="font-inter font-semibold text-ink text-sm">Why shop from us?</p>
              {whyItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orangeTint flex items-center justify-center text-lg shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-ink text-sm leading-tight">{item.title}</p>
                    {item.desc && (
                      <p className="font-jakarta text-xs text-textSecondary mt-0.5 leading-relaxed">{item.desc}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Similar Products ── */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="font-inter font-bold text-ink text-xl mb-5">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {similar.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
