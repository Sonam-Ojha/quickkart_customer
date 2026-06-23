import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { infoPages } from '@/data/infoPages'

export default function InfoPage() {
  const { slug }   = useParams<{ slug: string }>()
  const navigate   = useNavigate()
  const page       = slug ? infoPages[slug] : undefined

  if (!page) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 py-24 text-center">
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

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-jakarta text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{page.emoji}</span>
            <div>
              <h1 className="font-inter font-black text-3xl text-gray-900 leading-tight">{page.title}</h1>
              <p className="font-jakarta text-gray-500 mt-1">{page.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
        {page.sections.map((sec) => (
          <div key={sec.heading} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
            <h2 className="font-inter font-bold text-gray-900 text-lg mb-3">{sec.heading}</h2>
            <p className="font-jakarta text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">{sec.body}</p>
          </div>
        ))}

        {/* Back to home */}
        <div className="pt-4 pb-8 text-center">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-primaryOrange font-inter font-semibold text-sm hover:underline"
          >
            ← Back to QuickKart Home
          </Link>
        </div>
      </div>
    </div>
  )
}
