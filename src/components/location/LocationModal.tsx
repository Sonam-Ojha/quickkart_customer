import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import {
  MapPin, Navigation, Search, X, Clock, ChevronRight,
  Loader2, AlertCircle, ArrowLeft, CheckCircle2,
} from 'lucide-react'
import { useLocationStore, SavedLocation } from '@/store/locationStore'

// Fix leaflet default icon broken by webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Props {
  open: boolean
  onClose: () => void
}

// ── Nominatim helpers ─────────────────────────────────────────────────────────

const NOM_HEADERS = { 'Accept-Language': 'en', 'User-Agent': 'JhatpatsWeb/1.0' }

async function nominatimSearch(query: string): Promise<SavedLocation[]> {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' India')}` +
    `&format=json&addressdetails=1&limit=6&countrycodes=in`
  const res  = await fetch(url, { headers: NOM_HEADERS })
  const data: any[] = await res.json()
  return data.map((item) => {
    const addr = item.address ?? {}
    const area = [
      addr.suburb || addr.neighbourhood || addr.road || addr.town,
      addr.city   || addr.county,
      addr.state,
    ].filter(Boolean).join(', ')
    return {
      label:   addr.suburb || addr.neighbourhood || addr.city || item.display_name.split(',')[0],
      area:    area || item.display_name.split(',').slice(0, 3).join(', '),
      pincode: addr.postcode ?? '',
      lat:     parseFloat(item.lat),
      lng:     parseFloat(item.lon),
    }
  })
}

async function nominatimReverse(lat: number, lng: number): Promise<SavedLocation | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
    const res  = await fetch(url, { headers: NOM_HEADERS })
    const data = await res.json()
    const addr = data.address ?? {}
    const area = [
      addr.suburb || addr.neighbourhood || addr.road,
      addr.city   || addr.town || addr.county,
    ].filter(Boolean).join(', ')
    return {
      label:   addr.suburb || addr.neighbourhood || addr.road || 'My Location',
      area:    area || data.display_name?.split(',').slice(0, 3).join(', ') || '',
      pincode: addr.postcode ?? '',
      lat,
      lng,
    }
  } catch {
    return null
  }
}

// ── Map sub-components ────────────────────────────────────────────────────────

function MapCenterSetter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.setView(center, 16) }, [center, map])
  return null
}

function MapMoveListener({ onMoveEnd }: { onMoveEnd: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter()
      onMoveEnd(c.lat, c.lng)
    },
  })
  return null
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function LocationModal({ open, onClose }: Props) {
  const { current, recents, setLocation } = useLocationStore()

  // view: 'search' = search/recent list  |  'map' = draggable map
  const [view,        setView]        = useState<'search' | 'map'>('search')
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState<SavedLocation[]>([])
  const [searching,   setSearching]   = useState(false)
  const [gpsState,    setGpsState]    = useState<'idle' | 'loading' | 'error'>('idle')
  const [gpsError,    setGpsError]    = useState('')
  const [mapCenter,   setMapCenter]   = useState<[number, number]>([28.6139, 77.209]) // Delhi default
  const [mapAddr,     setMapAddr]     = useState<SavedLocation | null>(null)
  const [addrLoading, setAddrLoading] = useState(false)

  const inputRef    = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const revDebRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setView('search')
      setQuery('')
      setResults([])
      setGpsState('idle')
      setGpsError('')
      setMapAddr(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 3) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try { setResults(await nominatimSearch(query)) }
      catch { setResults([]) }
      finally { setSearching(false) }
    }, 400)
  }, [query])

  // Go to map at given coords
  const openMap = useCallback(async (lat: number, lng: number, preAddr?: SavedLocation) => {
    setMapCenter([lat, lng])
    setView('map')
    if (preAddr) {
      setMapAddr(preAddr)
    } else {
      setAddrLoading(true)
      const addr = await nominatimReverse(lat, lng)
      setMapAddr(addr)
      setAddrLoading(false)
    }
  }, [])

  // Map pan ended → reverse geocode (debounced 600ms)
  const handleMapMoveEnd = useCallback((lat: number, lng: number) => {
    setMapCenter([lat, lng])
    if (revDebRef.current) clearTimeout(revDebRef.current)
    setAddrLoading(true)
    revDebRef.current = setTimeout(async () => {
      const addr = await nominatimReverse(lat, lng)
      setMapAddr(addr)
      setAddrLoading(false)
    }, 600)
  }, [])

  // GPS
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
        setGpsState('idle')
        await openMap(lat, lng)
      },
      (err) => {
        setGpsState('error')
        setGpsError(
          err.code === 1
            ? 'Location permission denied. Allow in browser settings.'
            : 'Could not get GPS. Try manual search.',
        )
      },
      { timeout: 10000 },
    )
  }

  // Search result tapped
  const handleSelect = async (loc: SavedLocation) => {
    if (loc.lat && loc.lng) {
      await openMap(loc.lat, loc.lng, loc)
    } else {
      setLocation(loc)
      onClose()
    }
  }

  // Confirm location from map
  const handleConfirm = () => {
    if (!mapAddr) return
    setLocation(mapAddr)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-10 sm:pt-16 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
           style={{ maxHeight: 'calc(100vh - 5rem)' }}>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border shrink-0">
          {view === 'map' && (
            <button
              onClick={() => setView('search')}
              className="w-8 h-8 rounded-full hover:bg-inputFill flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowLeft size={16} className="text-ink" />
            </button>
          )}
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 bg-orangeTint rounded-lg flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-primaryOrange" />
            </div>
            <div>
              <p className="font-inter font-bold text-ink text-sm leading-none">
                {view === 'map' ? 'Confirm your location' : 'Set delivery location'}
              </p>
              {view === 'search' && current && (
                <p className="font-jakarta text-xs text-muted mt-0.5">Current: {current.area}</p>
              )}
              {view === 'map' && (
                <p className="font-jakarta text-xs text-muted mt-0.5">Pan map to pin exact spot</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-inputFill flex items-center justify-center transition-colors shrink-0"
          >
            <X size={16} className="text-muted" />
          </button>
        </div>

        {/* ── SEARCH VIEW ── */}
        {view === 'search' && (
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {/* GPS button */}
            <button
              onClick={handleGps}
              disabled={gpsState === 'loading'}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-primaryOrange/20 bg-orangeTint hover:bg-orange-100 transition-colors disabled:opacity-60 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primaryOrange flex items-center justify-center shrink-0">
                {gpsState === 'loading'
                  ? <Loader2 size={18} className="text-white animate-spin" />
                  : <Navigation size={18} className="text-white" />
                }
              </div>
              <div className="text-left flex-1">
                <p className="font-inter font-semibold text-ink text-sm">
                  {gpsState === 'loading' ? 'Detecting location…' : 'Use my current location'}
                </p>
                <p className="font-jakarta text-xs text-muted">Auto-detect via GPS</p>
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
              {searching
                ? <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted animate-spin" />
                : query && (
                    <button onClick={() => { setQuery(''); setResults([]) }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <X size={14} className="text-muted hover:text-ink" />
                    </button>
                  )
              }
            </div>

            {/* Search results */}
            {results.length > 0 && (
              <div className="space-y-0.5">
                <p className="font-inter font-semibold text-xs text-muted px-1 pb-1">SEARCH RESULTS</p>
                {results.map((loc, i) => (
                  <LocationRow key={i} loc={loc}
                    icon={<MapPin size={15} className="text-primaryOrange" />}
                    onClick={() => handleSelect(loc)} />
                ))}
              </div>
            )}

            {/* Recents */}
            {query.trim().length === 0 && recents.length > 0 && (
              <div className="space-y-0.5">
                <p className="font-inter font-semibold text-xs text-muted px-1 pb-1">RECENT LOCATIONS</p>
                {recents.map((loc, i) => (
                  <LocationRow key={i} loc={loc}
                    icon={<Clock size={15} className="text-muted" />}
                    onClick={() => handleSelect(loc)} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {query.trim().length >= 3 && !searching && results.length === 0 && (
              <div className="py-8 text-center">
                <MapPin size={32} className="text-border mx-auto mb-2" />
                <p className="font-jakarta text-sm text-muted">No results for "{query}"</p>
                <p className="font-jakarta text-xs text-muted/70 mt-1">Try a different area name or pincode</p>
              </div>
            )}
          </div>
        )}

        {/* ── MAP VIEW ── */}
        {view === 'map' && (
          <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
            {/* Map container */}
            <div className="relative flex-1" style={{ minHeight: 300 }}>
              <MapContainer
                center={mapCenter}
                zoom={16}
                style={{ height: '100%', width: '100%', minHeight: 300 }}
                zoomControl={true}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <MapCenterSetter center={mapCenter} />
                <MapMoveListener onMoveEnd={handleMapMoveEnd} />
              </MapContainer>

              {/* Center pin overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-[1000]">
                <div className="relative -translate-y-1/2">
                  {/* Pin shadow */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-black/20 rounded-full blur-[2px]" />
                  {/* Pin icon */}
                  <div className="w-10 h-10 bg-primaryOrange rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin size={20} className="text-white" />
                  </div>
                  {/* Pin stem */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-primaryOrange" />
                </div>
              </div>

              {/* Attribution */}
              <div className="absolute bottom-1 right-1 z-[1000] text-[9px] text-gray-500 bg-white/80 px-1 rounded">
                © OpenStreetMap
              </div>
            </div>

            {/* Address bar + confirm */}
            <div className="p-4 border-t border-border bg-white shrink-0">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-orangeTint rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={16} className="text-primaryOrange" />
                </div>
                <div className="flex-1 min-w-0">
                  {addrLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="text-muted animate-spin" />
                      <span className="font-jakarta text-sm text-muted">Fetching address…</span>
                    </div>
                  ) : mapAddr ? (
                    <>
                      <p className="font-inter font-bold text-ink text-sm leading-snug truncate">{mapAddr.label}</p>
                      <p className="font-jakarta text-xs text-muted mt-0.5 line-clamp-2">{mapAddr.area}</p>
                      {mapAddr.pincode && (
                        <p className="font-jakarta text-xs text-muted mt-0.5">PIN: {mapAddr.pincode}</p>
                      )}
                    </>
                  ) : (
                    <p className="font-jakarta text-sm text-muted">Pan the map to your location</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!mapAddr || addrLoading}
                className="w-full h-11 bg-primaryOrange hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-btn font-inter font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 size={16} />
                Confirm Location
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LocationRow({
  loc, icon, onClick,
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
        <p className="font-inter font-semibold text-ink text-sm truncate">{loc.label}</p>
        <p className="font-jakarta text-xs text-muted truncate">
          {loc.area}{loc.pincode ? ` · ${loc.pincode}` : ''}
        </p>
      </div>
      <ChevronRight size={14} className="text-muted shrink-0 group-hover:text-primaryOrange transition-colors" />
    </button>
  )
}
