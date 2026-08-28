import { useState, useEffect, useRef } from 'react'
import {
  MapPin, Navigation, Search, X, Clock, ChevronRight,
  Loader2, AlertCircle, CheckCircle2, Wifi, RotateCcw,
} from 'lucide-react'
import { useLocationStore, SavedLocation } from '@/store/locationStore'
import { useGeoLocation, GPS_ACCURACY_GOOD_M } from '@/hooks/useGeoLocation'

const API_BASE = import.meta.env.VITE_API_BASE_URL as string
const GKEY     = import.meta.env.VITE_GOOGLE_MAPS_KEY as string

// ── Google Maps / Places loader ───────────────────────────────────────────────
let _mapsReady: Promise<void> | null = null
function ensureMaps(): Promise<void> {
  if ((window as any).google?.maps?.places) return Promise.resolve()
  if (_mapsReady) return _mapsReady
  _mapsReady = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GKEY}&libraries=places&language=en&region=IN`
    s.async = true
    s.onload  = () => resolve()
    s.onerror = () => { _mapsReady = null; reject() }
    document.head.appendChild(s)
  })
  return _mapsReady
}

// ── Google Places autocomplete ────────────────────────────────────────────────
interface Prediction { placeId: string; mainText: string; secondaryText: string }

async function googleSearch(q: string): Promise<Prediction[]> {
  await ensureMaps()
  const g = (window as any).google
  return new Promise((resolve) => {
    new g.maps.places.AutocompleteService().getPlacePredictions(
      { input: q, componentRestrictions: { country: 'in' }, types: ['geocode', 'establishment'] },
      (preds: any[] | null, status: string) => {
        if (status !== 'OK' || !preds) return resolve([])
        resolve(preds.map((p: any) => ({
          placeId:       p.place_id,
          mainText:      p.structured_formatting?.main_text ?? p.description?.split(',')[0] ?? '',
          secondaryText: p.structured_formatting?.secondary_text ?? '',
        })))
      },
    )
  })
}

async function googlePlaceCoords(placeId: string): Promise<{ lat: number; lng: number } | null> {
  await ensureMaps()
  const g = (window as any).google
  return new Promise((resolve) => {
    new g.maps.places.PlacesService(document.createElement('div')).getDetails(
      { placeId, fields: ['geometry'] },
      (place: any, status: string) => {
        if (status !== 'OK' || !place?.geometry?.location) return resolve(null)
        resolve({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
      },
    )
  })
}

// ── Backend reverse geocode (free, Nominatim proxy) ───────────────────────────
interface AddrResult {
  locality: string; area: string; city: string
  state: string; postalCode: string; country: string; formattedAddress: string
}

async function reverseGeocode(lat: number, lng: number): Promise<AddrResult | null> {
  try {
    const res = await fetch(`${API_BASE}/api/app/location/reverse?lat=${lat}&lng=${lng}`,
      { signal: AbortSignal.timeout(10000) })
    return res.ok ? (await res.json()) as AddrResult : null
  } catch { return null }
}

function toSavedLocation(
  addr: AddrResult | null,
  lat: number, lng: number,
  accuracy?: number,
  fallbackLabel?: string,
): SavedLocation {
  if (!addr) {
    return { label: fallbackLabel || 'My Location', area: '', pincode: '', lat, lng, accuracy, source: 'gps' }
  }
  return {
    label:           addr.locality || addr.city || 'My Location',
    area:            addr.area || addr.city || '',
    pincode:         addr.postalCode,
    lat, lng, accuracy,
    city:            addr.city,
    state:           addr.state,
    country:         addr.country,
    formattedAddress: addr.formattedAddress,
    source:          'gps',
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props { open: boolean; onClose: () => void }

export default function LocationModal({ open, onClose }: Props) {
  const { current, recents, setLocation } = useLocationStore()
  const { status: gpsStatus, request: requestGps, reset: resetGps } = useGeoLocation()

  const [query,        setQuery]       = useState('')
  const [predictions,  setPredictions] = useState<Prediction[]>([])
  const [searching,    setSearching]   = useState(false)
  // When GPS/search gives coords, show a confirmation card before saving
  const [pending,      setPending]     = useState<SavedLocation | null>(null)
  const [pendingLoading, setPendingLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const debRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery(''); setPredictions([]); setPending(null); setPendingLoading(false)
      resetGps()
      ensureMaps().catch(() => {})
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, resetGps])

  // GPS success → reverse geocode → show confirmation card
  useEffect(() => {
    if (gpsStatus.kind !== 'success') return
    const { coords } = gpsStatus
    setPendingLoading(true)
    setPending({ label: 'Detecting…', area: '', pincode: '', lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy, source: 'gps' })
    reverseGeocode(coords.lat, coords.lng).then((addr) => {
      setPending(toSavedLocation(addr, coords.lat, coords.lng, coords.accuracy))
      setPendingLoading(false)
    })
  }, [gpsStatus])

  // Debounced Google Places search
  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current)
    if (query.trim().length < 3) { setPredictions([]); return }
    debRef.current = setTimeout(async () => {
      setSearching(true)
      setPredictions(await googleSearch(query))
      setSearching(false)
    }, 400)
  }, [query])

  // Search result tapped → get coords → reverse geocode → show card
  const handlePredictionSelect = async (pred: Prediction) => {
    setSearching(true); setPredictions([])
    const coords = await googlePlaceCoords(pred.placeId)
    if (!coords) { setSearching(false); return }
    setPending({ label: pred.mainText, area: pred.secondaryText, pincode: '', lat: coords.lat, lng: coords.lng, source: 'search' })
    setPendingLoading(true); setSearching(false)
    reverseGeocode(coords.lat, coords.lng).then((addr) => {
      setPending(toSavedLocation(addr, coords.lat, coords.lng, undefined, pred.mainText))
      setPendingLoading(false)
    })
  }

  const handleConfirm = () => {
    if (!pending) return
    setLocation({ ...pending, capturedAt: Date.now() })
    onClose()
  }

  const handleRecentSelect = (loc: SavedLocation) => {
    setLocation({ ...loc, capturedAt: Date.now() })
    onClose()
  }

  if (!open) return null

  const showConfirmCard = !!pending || gpsStatus.kind === 'requesting' || gpsStatus.kind === 'improving'

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-10 sm:pt-16 px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
           style={{ maxHeight: 'calc(100vh - 5rem)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border shrink-0">
          <div className="w-8 h-8 bg-orangeTint rounded-lg flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-primaryOrange" />
          </div>
          <div className="flex-1">
            <p className="font-inter font-bold text-ink text-sm leading-none">Set delivery location</p>
            {current?.area && (
              <p className="font-jakarta text-xs text-muted mt-0.5 truncate max-w-[260px]">{current.area}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-inputFill flex items-center justify-center transition-colors">
            <X size={16} className="text-muted" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">

          {/* ── Confirmation card (GPS or search result) ── */}
          {showConfirmCard && (
            <div className="rounded-xl border-2 border-primaryOrange/30 bg-orangeTint overflow-hidden">
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="w-9 h-9 bg-primaryOrange rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  {pendingLoading || gpsStatus.kind === 'requesting' || gpsStatus.kind === 'improving'
                    ? <Loader2 size={18} className="text-white animate-spin" />
                    : <MapPin size={18} className="text-white" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  {gpsStatus.kind === 'requesting' && (
                    <>
                      <p className="font-inter font-semibold text-ink text-sm">Detecting location…</p>
                      <p className="font-jakarta text-xs text-muted">Waiting for GPS signal</p>
                    </>
                  )}
                  {gpsStatus.kind === 'improving' && (
                    <>
                      <p className="font-inter font-semibold text-ink text-sm">Getting precise location…</p>
                      <p className="font-jakarta text-xs text-muted">Accuracy: ~{gpsStatus.accuracy}m — improving…</p>
                    </>
                  )}
                  {gpsStatus.kind === 'success' && pending && (
                    <>
                      <p className="font-inter font-bold text-ink text-sm truncate">
                        {pendingLoading ? 'Getting address…' : pending.label}
                      </p>
                      {!pendingLoading && pending.area && (
                        <p className="font-jakarta text-xs text-muted mt-0.5 line-clamp-2">{pending.area}</p>
                      )}
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {pending.pincode && (
                          <span className="text-xs font-jakarta text-muted bg-white px-1.5 py-0.5 rounded">
                            PIN {pending.pincode}
                          </span>
                        )}
                        {pending.accuracy !== undefined && (
                          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-jakarta ${
                            pending.accuracy <= GPS_ACCURACY_GOOD_M ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            <Wifi size={9} />~{pending.accuracy}m
                          </span>
                        )}
                      </div>
                    </>
                  )}
                  {pending && !pendingLoading && gpsStatus.kind !== 'requesting' && gpsStatus.kind !== 'improving' && pending.source === 'search' && (
                    <>
                      <p className="font-inter font-bold text-ink text-sm truncate">{pending.label}</p>
                      {pending.area && <p className="font-jakarta text-xs text-muted mt-0.5 line-clamp-2">{pending.area}</p>}
                      {pending.pincode && (
                        <span className="text-xs font-jakarta text-muted">PIN {pending.pincode}</span>
                      )}
                    </>
                  )}
                </div>
                {/* Change button */}
                {pending && !pendingLoading && (
                  <button
                    onClick={() => { setPending(null); resetGps() }}
                    className="shrink-0 text-primaryOrange hover:text-orange-700 transition-colors"
                    title="Change"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>

              {/* Confirm button */}
              {pending && !pendingLoading && (
                <button
                  onClick={handleConfirm}
                  className="w-full h-11 bg-primaryOrange hover:bg-orange-600 text-white font-inter font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={16} />
                  Confirm this location
                </button>
              )}
            </div>
          )}

          {/* ── GPS button ── */}
          {!showConfirmCard && (
            <button
              onClick={requestGps}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-primaryOrange/20 bg-orangeTint hover:bg-orange-100 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primaryOrange flex items-center justify-center shrink-0">
                <Navigation size={18} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-inter font-semibold text-ink text-sm">Use my current location</p>
                <p className="font-jakarta text-xs text-muted">Auto-detect via GPS</p>
              </div>
              <ChevronRight size={16} className="text-muted group-hover:text-primaryOrange transition-colors" />
            </button>
          )}

          {/* GPS error */}
          {gpsStatus.kind === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-jakarta text-xs text-red-700 leading-relaxed">{gpsStatus.message}</p>
                <button onClick={requestGps} className="font-inter font-semibold text-xs text-primaryOrange mt-1 hover:underline">
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* ── Search box ── */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search area, street, pincode…"
              className="w-full h-11 bg-inputFill border border-border rounded-btn pl-10 pr-10 font-jakarta text-sm text-ink placeholder:text-muted outline-none focus:border-primaryOrange focus:bg-white transition-all"
            />
            {searching
              ? <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted animate-spin" />
              : query && (
                  <button onClick={() => { setQuery(''); setPredictions([]) }} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-muted hover:text-ink" />
                  </button>
                )
            }
          </div>

          {/* Search predictions */}
          {predictions.length > 0 && (
            <div className="space-y-0.5">
              <p className="font-inter font-semibold text-xs text-muted px-1 pb-1">SUGGESTIONS</p>
              {predictions.map((pred) => (
                <button key={pred.placeId} onClick={() => handlePredictionSelect(pred)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-inputFill transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-inputFill group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
                    <MapPin size={15} className="text-primaryOrange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-semibold text-ink text-sm truncate">{pred.mainText}</p>
                    <p className="font-jakarta text-xs text-muted truncate">{pred.secondaryText}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted shrink-0 group-hover:text-primaryOrange transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.trim().length >= 3 && !searching && predictions.length === 0 && (
            <div className="py-6 text-center">
              <MapPin size={28} className="text-border mx-auto mb-2" />
              <p className="font-jakarta text-sm text-muted">No results for "{query}"</p>
              <p className="font-jakarta text-xs text-muted/70 mt-1">Try a different area, city, or pincode</p>
            </div>
          )}

          {/* Recents */}
          {query.trim().length === 0 && recents.length > 0 && !showConfirmCard && (
            <div className="space-y-0.5">
              <p className="font-inter font-semibold text-xs text-muted px-1 pb-1">RECENT</p>
              {recents.map((loc, i) => (
                <button key={i} onClick={() => handleRecentSelect(loc)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-inputFill transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-inputFill group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
                    <Clock size={15} className="text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-semibold text-ink text-sm truncate">{loc.label}</p>
                    <p className="font-jakarta text-xs text-muted truncate">
                      {loc.area}{loc.pincode ? ` · ${loc.pincode}` : ''}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-muted shrink-0 group-hover:text-primaryOrange transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
