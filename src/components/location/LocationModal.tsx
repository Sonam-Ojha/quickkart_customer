import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Search, X, Clock, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { useLocationStore, SavedLocation } from '@/store/locationStore'

interface Props {
  open: boolean
  onClose: () => void
}

type GpsState = 'idle' | 'loading' | 'error'

export default function LocationModal({ open, onClose }: Props) {
  const { current, recents, setLocation } = useLocationStore()
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState<SavedLocation[]>([])
  const [searching, setSearching] = useState(false)
  const [gpsState, setGpsState] = useState<GpsState>('idle')
  const [gpsError, setGpsError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setGpsState('idle')
      setGpsError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Debounced search using Nominatim (free, no API key)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 3) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query + ' India',
          )}&format=json&addressdetails=1&limit=6&countrycodes=in`,
          { headers: { 'Accept-Language': 'en' } },
        )
        const data: any[] = await res.json()
        const locations: SavedLocation[] = data.map((item) => {
          const addr = item.address ?? {}
          const area = [
            addr.suburb || addr.neighbourhood || addr.road || addr.town,
            addr.city || addr.county,
            addr.state,
          ]
            .filter(Boolean)
            .join(', ')
          return {
            label: addr.suburb || addr.neighbourhood || addr.city || item.display_name.split(',')[0],
            area: area || item.display_name.split(',').slice(0, 3).join(', '),
            pincode: addr.postcode ?? '',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }
        })
        setResults(locations)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [query])

  const handleGps = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported in this browser')
      return
    }
    setGpsState('loading')
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } },
          )
          const data = await res.json()
          const addr = data.address ?? {}
          const area = [
            addr.suburb || addr.neighbourhood || addr.road,
            addr.city || addr.town || addr.county,
          ]
            .filter(Boolean)
            .join(', ')

          const loc: SavedLocation = {
            label: addr.suburb || addr.neighbourhood || 'Current Location',
            area: area || data.display_name.split(',').slice(0, 3).join(', '),
            pincode: addr.postcode ?? '',
            lat,
            lng,
          }
          setLocation(loc)
          setGpsState('idle')
          onClose()
        } catch {
          setGpsState('error')
          setGpsError('Could not fetch address. Try manual search.')
        }
      },
      (err) => {
        setGpsState('error')
        setGpsError(
          err.code === 1
            ? 'Location permission denied. Please allow in browser settings.'
            : 'Could not get location. Try manual search.',
        )
      },
      { timeout: 10000 },
    )
  }

  const handleSelect = (loc: SavedLocation) => {
    setLocation(loc)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orangeTint rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-primaryOrange" />
            </div>
            <div>
              <p className="font-inter font-bold text-ink text-sm leading-none">
                Change Delivery Location
              </p>
              {current && (
                <p className="font-jakarta text-xs text-muted mt-0.5">
                  Current: {current.area}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-inputFill flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* GPS Button */}
          <button
            onClick={handleGps}
            disabled={gpsState === 'loading'}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-primaryOrange/20 bg-orangeTint hover:bg-orange-100 transition-colors disabled:opacity-60 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primaryOrange flex items-center justify-center shrink-0">
              {gpsState === 'loading' ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <Navigation size={18} className="text-white" />
              )}
            </div>
            <div className="text-left flex-1">
              <p className="font-inter font-semibold text-ink text-sm">
                {gpsState === 'loading' ? 'Detecting location…' : 'Use my current location'}
              </p>
              <p className="font-jakarta text-xs text-muted">
                Auto-detect via GPS
              </p>
            </div>
            {gpsState !== 'loading' && (
              <ChevronRight size={16} className="text-muted group-hover:text-primaryOrange transition-colors" />
            )}
          </button>

          {gpsError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="font-jakarta text-xs text-red-600">{gpsError}</p>
            </div>
          )}

          {/* Search box */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search area, pincode or city…"
              className="w-full h-11 bg-inputFill border border-border rounded-btn pl-10 pr-10 font-jakarta text-sm text-ink placeholder:text-muted outline-none focus:border-primaryOrange focus:bg-white transition-all"
            />
            {searching && (
              <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted animate-spin" />
            )}
            {query && !searching && (
              <button
                onClick={() => { setQuery(''); setResults([]) }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                <X size={14} className="text-muted hover:text-ink" />
              </button>
            )}
          </div>

          {/* Search results */}
          {results.length > 0 && (
            <div className="space-y-0.5">
              <p className="font-inter font-semibold text-xs text-muted px-1 pb-1">
                SEARCH RESULTS
              </p>
              {results.map((loc, i) => (
                <LocationRow
                  key={i}
                  loc={loc}
                  icon={<MapPin size={15} className="text-primaryOrange" />}
                  onClick={() => handleSelect(loc)}
                />
              ))}
            </div>
          )}

          {/* Recent locations */}
          {query.trim().length === 0 && recents.length > 0 && (
            <div className="space-y-0.5">
              <p className="font-inter font-semibold text-xs text-muted px-1 pb-1">
                RECENT LOCATIONS
              </p>
              {recents.map((loc, i) => (
                <LocationRow
                  key={i}
                  loc={loc}
                  icon={<Clock size={15} className="text-muted" />}
                  onClick={() => handleSelect(loc)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {query.trim().length >= 3 && !searching && results.length === 0 && (
            <div className="py-8 text-center">
              <MapPin size={32} className="text-border mx-auto mb-2" />
              <p className="font-jakarta text-sm text-muted">
                No results for "{query}"
              </p>
              <p className="font-jakarta text-xs text-muted/70 mt-1">
                Try a different area name or pincode
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LocationRow({
  loc,
  icon,
  onClick,
}: {
  loc: SavedLocation
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-inputFill transition-colors text-left group"
    >
      <div className="w-8 h-8 rounded-lg bg-inputFill group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter font-semibold text-ink text-sm truncate">
          {loc.label}
        </p>
        <p className="font-jakarta text-xs text-muted truncate">
          {loc.area}{loc.pincode ? ` · ${loc.pincode}` : ''}
        </p>
      </div>
      <ChevronRight size={14} className="text-muted shrink-0 group-hover:text-primaryOrange transition-colors" />
    </button>
  )
}
