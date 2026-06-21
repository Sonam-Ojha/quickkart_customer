import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import { products } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'

export default function SearchPage() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const q         = params.get('q') ?? ''

  const results = q.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.category ?? '').toLowerCase().includes(q.toLowerCase())
      )
    : []

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Search size={20} className="text-primaryOrange" />
        <h1 className="font-inter font-bold text-xl text-ink">
          {q ? <>Results for <span className="text-primaryOrange">"{q}"</span></> : 'Search'}
        </h1>
        {results.length > 0 && (
          <span className="font-jakarta text-sm text-textSecondary">({results.length} products)</span>
        )}
      </div>

      {!q ? (
        <div className="text-center py-20">
          <Search size={48} className="text-muted mx-auto mb-4" />
          <p className="font-jakarta text-textSecondary">Type something in the search bar above</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <SearchX size={48} className="text-muted mx-auto mb-4" />
          <h2 className="font-inter font-bold text-ink text-lg mb-2">No results for "{q}"</h2>
          <p className="font-jakarta text-sm text-textSecondary mb-6">
            Try a different search term or browse categories
          </p>
          <button
            onClick={() => navigate('/home')}
            className="h-11 px-8 bg-primaryOrange text-white rounded-xl font-inter font-bold text-sm"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
