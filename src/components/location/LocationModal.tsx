import { useState, useEffect, useRef } from 'react'
import {
  MapPin, Navigation, Search, X, Clock, ChevronRight,
  Loader2, AlertCircle, CheckCircle2, RotateCcw, Home, Briefcase,
} from 'lucide-react'
import { useLocationStore, SavedLocation } from '@/store/locationStore'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import AddressDetailsForm from './AddressDetailsForm'
import { useGeoLocation } from '@/hooks/useGeoLocation'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000'

// ── Search via backend proxy (Google Places → Nominatim fallback) ─────────────
interface Prediction {
  placeId: string; mainText: string; secondaryText: string
  _lat?: number; _lng?: number; _addr?: any  // set for Nominatim fallback results
}

// Backend proxy: /api/app/location/places uses Google Places API server-side
async function backendSearch(q: string): Promise<Prediction[]> {
  try {
    const res = await fetch(`${API_BASE}/api/app/location/places?q=${encodeURIComponent(q)}`,
      { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return []
    const data = await res.json()
    return (data.predictions || []) as Prediction[]
  } catch {
    return []
  }
}

// Backend proxy: /api/app/location/places/details returns lat/lng + address
async function backendPlaceDetails(placeId: string): Promise<{ lat: number; lng: number; area?: string; pincode?: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/app/location/places/details?place_id=${encodeURIComponent(placeId)}`,
      { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
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
  source: SavedLocation['source'] = 'gps',
): SavedLocation {
  if (!addr) {
    return {
      label: fallbackLabel || 'My Location',
      area:  fallbackLabel ? '' : `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      pincode: '', lat, lng, accuracy, source,
    }
  }
  return {
    label:           addr.locality || addr.city || fallbackLabel || 'My Location',
    area:            addr.area || addr.city || '',
    pincode:         addr.postalCode,
    lat, lng, accuracy,
    city:            addr.city,
    state:           addr.state,
    country:         addr.country,
    formattedAddress: addr.formattedAddress,
    source,
  }
}

// Address saved on the account — shared by the website and the app
interface AccountAddress {
  id: number; label: string; line1: string; line2?: string | null
  city: string; pincode: string; lat?: number | string | null; lng?: number | string | null
  isDefault?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props { open: boolean; onClose: () => void }

export default function LocationModal({ open, onClose }: Props) {
  const { current, recents, setLocation } = useLocationStore()
  const token = useAuthStore((s) => s.token)
  // Logged-in users see the addresses saved on their account (from web or app)
  const [saved, setSaved] = useState<AccountAddress[]>([])
  useEffect(() => {
    if (!open || !token) { setSaved([]); return }
    api.get<AccountAddress[]>('/addresses')
      .then(({ data }) => setSaved(Array.isArray(data) ? data : []))
      .catch(() => setSaved([]))
  }, [open, token])
  const { status: gpsStatus, request: requestGps, reset: resetGps } = useGeoLocation()

  const [query,        setQuery]       = useState('')
  const [predictions,  setPredictions] = useState<Prediction[]>([])
  const [searching,    setSearching]   = useState(false)
  // When GPS/search gives coords, show a confirmation card before saving
  const [pending,      setPending]     = useState<SavedLocation | null>(null)
  const [pendingLoading, setPendingLoading] = useState(false)
  // Step 2: the confirmed spot, awaiting name / phone / house / landmark
  const [details,      setDetails]     = useState<SavedLocation | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const debRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery(''); setPredictions([]); setPending(null); setPendingLoading(false); setDetails(null)
      resetGps()
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, resetGps])

  // GPS success → reverse geocode via backend (uses Google internally) → show confirmation card
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

  // Debounced search: Google Places first, fallback to backend Nominatim
  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current)
    if (query.trim().length < 3) { setPredictions([]); return }
    debRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        // Try backend Google Places proxy first
        let results = await backendSearch(query)
        if (results.length === 0) {
          // Fallback: Nominatim search
          const res = await fetch(`${API_BASE}/api/app/location/search?q=${encodeURIComponent(query)}`,
            { signal: AbortSignal.timeout(8000) })
          if (res.ok) {
            const data = await res.json()
            const seen = new Set<string>()
            results = (data.results || [])
              .filter((r: any) => {
                const key = r.displayName || `${r.lat},${r.lng}`
                if (seen.has(key)) return false
                seen.add(key)
                return true
              })
              .map((r: any, i: number) => {
                const parts = String(r.displayName || '')
                  .split(',')
                  .map((p: string) => p.trim())
                  .filter((p: string) => p && p !== 'India' && !/^\d+$/.test(p))
                return {
                  placeId: `nominatim-${i}-${r.lat}-${r.lng}`,
                  mainText: parts[0] || r.area?.split(',')[0] || r.city || query,
                  secondaryText: parts.slice(1, 4).join(', ') || r.area || '',
                  _lat: r.lat,
                  _lng: r.lng,
                  _addr: r,
                }
              })
          }
        }
        setPredictions(results)
      } catch (e) {
        console.error('[Search] error:', e)
        setPredictions([])
      }
      setSearching(false)
    }, 400)
  }, [query])

  // Search result tapped → get coords → reverse geocode → show card
  const handlePredictionSelect = async (pred: Prediction) => {
    setSearching(true); setPredictions([])

    // Nominatim fallback results already have coords embedded
    if (pred.placeId.startsWith('nominatim-') && pred._lat !== undefined && pred._lng !== undefined) {
      const { _lat: lat, _lng: lng, _addr: addr } = pred
      setPending(toSavedLocation(addr, lat, lng, undefined, pred.mainText))
      setSearching(false)
      return
    }

    // Backend proxy: fetch coords + address via /places/details
    const details = await backendPlaceDetails(pred.placeId)
    if (!details) { setSearching(false); return }
    setPending({
      label:   pred.mainText,
      area:    details.area || pred.secondaryText,
      pincode: details.pincode || '',
      lat:     details.lat,
      lng:     details.lng,
      source:  'search',
    })
    setSearching(false)
  }

  // Confirmed spot → ask for the full address in the same modal.
  const handleConfirm = () => {
    if (!pending) return
    setDetails(pending)
  }

  const handleDetailsSaved = (loc: SavedLocation) => {
    setLocation({ ...loc, capturedAt: Date.now() })
    onClose()
  }

  const handleRecentSelect = (loc: SavedLocation) => {
    setLocation({ ...loc, capturedAt: Date.now() })
    onClose()
  }

  const handleSavedSelect = (a: AccountAddress) => {
    const lat = a.lat != null ? Number(a.lat) : undefined
    const lng = a.lng != null ? Number(a.lng) : undefined
    setLocation({
      label:   a.label || 'Home',
      area:    [a.line1, a.city].filter(Boolean).join(', '),
      pincode: a.pincode || '',
      city:    a.city,
      lat:     Number.isFinite(lat) ? lat : undefined,
      lng:     Number.isFinite(lng) ? lng : undefined,
      formattedAddress: [a.line1, a.line2].filter(Boolean).join(', '),
      capturedAt: Date.now(),
    })
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
            <p className="font-inter font-bold text-ink text-sm leading-none">
              {details ? 'Enter address details' : 'Set delivery location'}
            </p>
            {details ? (
              <button onClick={() => setDetails(null)} className="font-jakarta text-xs text-primaryOrange hover:underline mt-0.5">
                ← Change location
              </button>
            ) : current?.area && (
              <p className="font-jakarta text-xs text-muted mt-0.5 truncate max-w-[260px]">{current.area}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-inputFill flex items-center justify-center transition-colors">
            <X size={16} className="text-muted" />
          </button>
        </div>

        {details ? (
          <div className="p-4 overflow-y-auto flex-1">
            <AddressDetailsForm location={details} onSaved={handleDetailsSaved} />
          </div>
        ) : (<>
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
                      <p className="font-jakarta text-xs text-muted">Please wait…</p>
                    </>
                  )}
                  {pending && gpsStatus.kind !== 'requesting' && gpsStatus.kind !== 'improving' && (
                    <>
                      <p className="font-inter font-bold text-ink text-sm truncate">
                        {pendingLoading ? 'Getting address…' : pending.label}
                      </p>
                      {!pendingLoading && pending.area && (
                        <p className="font-jakarta text-xs text-muted mt-0.5 line-clamp-2">{pending.area}</p>
                      )}
                      {!pendingLoading && pending.pincode && (
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-jakarta text-muted bg-white px-1.5 py-0.5 rounded">
                            PIN {pending.pincode}
                          </span>
                        </div>
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
              <p className="font-jakarta text-xs text-muted/70 mt-1">Try a different area or pincode</p>
            </div>
          )}

          {/* Saved addresses on the account */}
          {query.trim().length === 0 && saved.length > 0 && !showConfirmCard && (
            <div className="space-y-0.5 mb-3">
              <p className="font-inter font-semibold text-xs text-muted px-1 pb-1">SAVED ADDRESSES</p>
              {saved.map(a => {
                const Icon = /work|office/i.test(a.label) ? Briefcase : /home/i.test(a.label) ? Home : MapPin
                return (
                  <button key={a.id} onClick={() => handleSavedSelect(a)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-inputFill transition-colors text-left group">
                    <div className="w-8 h-8 rounded-lg bg-orangeTint flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-primaryOrange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter font-semibold text-ink text-sm truncate">{a.label || 'Home'}</p>
                      <p className="font-jakarta text-xs text-muted truncate">
                        {[a.line1, a.line2, a.city].filter(Boolean).join(', ')}{a.pincode ? ` · ${a.pincode}` : ''}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-muted shrink-0 group-hover:text-primaryOrange transition-colors" />
                  </button>
                )
              })}
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
        </>)}
      </div>
    </div>
  )
}
