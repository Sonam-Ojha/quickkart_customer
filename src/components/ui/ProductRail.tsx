import ProductCard from './ProductCard'
import type { Product } from '@/types/product'
import type { ReactNode } from 'react'

interface Props {
  title: string
  badge?: ReactNode
  products: Product[]
  onSeeAll?: () => void
}

export default function ProductRail({ title, badge, products, onSeeAll }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-inter font-bold text-ink text-base">{title}</h2>
          {badge}
        </div>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="font-inter text-xs text-primaryOrange font-semibold"
          >
            See all
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {products.map((p) => (
          <div key={p.id} className="w-36 shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
