import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, SearchX, Loader2 } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { useProducts } from '@/hooks/useProducts'

export default function SearchPage() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const q         = params.get('q') ?? ''
  const [debounced, setDebounced] = useState(q)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 350)
    return () => clearTimeout(t)
  }, [q])

  const { data, isLoading } = useProducts({
    q: debounced.trim() || undefined,
    limit: 40,
  })

  const results = data?.products ?? []

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Search size={20} className="text-primaryOrange" />
        <h1 className="font-inter font-bold text-xl text-ink">
          {q ? <>Results for <span className="text-primaryOrange">"{q}"</span></> : 'Search'}
        </h1>
        {!isLoading && results.length > 0 && (
          <span className="font-jakarta text-sm text-textSecondary">({results.length} products)</span>
        )}
      </div>

      {!q ? (
        <div className="text-center py-20">
          <Search size={48} className="text-muted mx-auto mb-4" />
          <p className="font-jakarta text-textSecondary">Type something in the search bar above</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted gap-2">
          <Loader2 size={24} className="animate-spin" />
          <span className="font-jakarta text-sm">Searching...</span>
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
            className="h-11 px-8 bg-primaryOrange text-white rounded-btn shadow-cta font-inter font-bold text-sm hover:bg-orangeDark transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
