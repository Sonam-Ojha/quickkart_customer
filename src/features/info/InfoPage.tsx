import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '@/lib/api'

interface Section { heading: string; body: string }
interface PageData { title: string; subtitle: string; sections: Section[] }

export default function InfoPage() {
  const { slug }   = useParams<{ slug: string }>()
  const navigate   = useNavigate()
  const [page, setPage]       = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    api.get<PageData>(`/api/app/pages/${slug}`)
      .then(r => setPage(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>
  }

  if (error || !page) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 xl:px-20 2xl:px-28 py-24 text-center">
        <p className="text-6xl mb-6">🔍</p>
        <h1 className="font-inter font-bold text-2xl text-gray-900 mb-2">Page not found</h1>
        <p className="font-jakarta text-gray-500 mb-8">This page doesn't exist.</p>
        <Link to="/home" className="inline-block bg-primaryOrange text-white font-inter font-bold px-8 py-3 rounded-xl hover:bg-[#c2410c] transition-colors">
          Go to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-jakarta text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 className="font-inter font-black text-3xl text-gray-900 leading-tight">{page.title}</h1>
            {page.subtitle && <p className="font-jakarta text-gray-500 mt-1">{page.subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
        {page.sections.map((sec, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
            {sec.heading && <h2 className="font-inter font-bold text-gray-900 text-lg mb-3">{sec.heading}</h2>}
            <p className="font-jakarta text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">{sec.body}</p>
          </div>
        ))}
        <div className="pt-4 pb-8 text-center">
          <Link to="/home" className="inline-flex items-center gap-2 text-primaryOrange font-inter font-semibold text-sm hover:underline">
            ← Back to Jhatpats Home
          </Link>
        </div>
      </div>
    </div>
  )
}
