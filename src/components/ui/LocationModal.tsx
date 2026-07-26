import { useState, useEffect, useRef } from 'react'
import { MapPin, LocateFixed, Search } from 'lucide-react'
import { useLocationStore } from '@/store/locationStore'

export default function LocationModal() {
  const isOpen     = useLocationStore((s) => s.isOpen)
  const setAddress = useLocationStore((s) => s.setAddress)

  const [query, setQuery]       = useState('')
  const [detecting, setDetecting] = useState(false)
  const [shake, setShake]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) setQuery('')
  }, [isOpen])

  if (!isOpen) return null

  const handleDetect = () => {
    setDetecting(true)

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 900))
    const locate = new Promise<void>((resolve) => {
      if (!navigator.geolocation) { resolve(); return }
      navigator.geolocation.getCurrentPosition(() => resolve(), () => resolve(), { timeout: 8000 })
    })

    Promise.all([minDelay, locate]).then(() => {
      setDetecting(false)
      setAddress('Current Location')
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) setAddress(query.trim())
  }

  const nudge = () => {
    setShake(false)
    requestAnimationFrame(() => setShake(true))
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/45" onClick={nudge} />

      <div className="absolute top-24 left-4 sm:left-6 lg:left-8 w-[calc(100%-2rem)] max-w-lg animate-fade-in">
        <div
          onAnimationEnd={() => setShake(false)}
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${shake ? 'animate-shake' : ''}`}
        >
          <div className="px-8 pt-8 pb-7">
            <h2 className="font-inter font-black text-2xl tracking-tight">
              Welcome to{' '}
              <span className="text-primaryOrange">Jhat</span>
              <span className="text-deepTeal">pats</span>
            </h2>

            {detecting ? (
              <div className="flex items-center gap-3 mt-6 h-12">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primaryOrange animate-dot-blink" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primaryOrange animate-dot-blink" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primaryOrange animate-dot-blink" style={{ animationDelay: '300ms' }} />
                </span>
                <span className="font-jakarta text-textSecondary text-15">Detecting your location…</span>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4 mt-6">
                  <div className="w-11 h-11 rounded-full bg-orangeTint flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-primaryOrange" />
                  </div>
                  <p className="font-jakarta text-textSecondary text-15 leading-snug mt-1.5">
                    Please provide your delivery location to see products at nearby store
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={handleDetect}
                    className="h-12 px-5 bg-primaryOrange hover:bg-orangeDark text-white rounded-btn font-inter font-bold text-sm shadow-cta transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <LocateFixed size={16} />
                    Detect my location
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="h-px w-4 bg-border" />
                    <span className="font-jakarta text-xs text-muted">OR</span>
                    <span className="h-px w-4 bg-border" />
                  </div>

                  <form onSubmit={handleSearch} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 h-12 rounded-btn px-4 bg-white border border-border focus-within:border-primaryOrange focus-within:ring-2 focus-within:ring-primaryOrange/15 transition-all">
                      <Search size={16} className="text-muted shrink-0" />
                      <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="search delivery location"
                        className="flex-1 min-w-0 bg-transparent font-jakarta text-sm text-ink placeholder:text-muted outline-none border-none"
                      />
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
