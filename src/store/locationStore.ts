import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// GPS coordinates are the source of truth for delivery location.
// The formatted address is derived and may not be perfectly accurate.
export interface SavedLocation {
  // ── Display (used by Navbar, backward-compatible) ──────────────────────────
  label: string        // Short display name e.g. "IIT Delhi" or "Home"
  area: string         // Medium display e.g. "Hauz Khas, New Delhi"
  pincode: string      // Postal code e.g. "110016"

  // ── Coordinates (source of truth) ─────────────────────────────────────────
  lat?: number
  lng?: number
  accuracy?: number    // GPS accuracy in metres at time of capture

  // ── Full address details ───────────────────────────────────────────────────
  city?: string
  state?: string
  country?: string
  formattedAddress?: string

  // ── Meta ──────────────────────────────────────────────────────────────────
  capturedAt?: number  // Date.now() when user confirmed
  source?: 'gps' | 'search' | 'map'
}

interface LocationState {
  current: SavedLocation | null
  recents: SavedLocation[]
  setLocation: (loc: SavedLocation) => void
  clearLocation: () => void
}

const DEFAULT_LOCATION: SavedLocation = {
  label:   'Select location',
  area:    'Tap to set your delivery area',
  pincode: '',
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      current: null,
      recents: [],

      setLocation: (loc) => {
        const withMeta: SavedLocation = { ...loc, capturedAt: loc.capturedAt ?? Date.now() }
        const existing = get().recents.filter(
          (r) =>
            // Deduplicate: same pincode+area or same coords (within ~50m)
            !(r.area === loc.area && r.pincode === loc.pincode) &&
            !(r.lat && loc.lat && Math.abs(r.lat - loc.lat) < 0.0005 &&
              Math.abs((r.lng ?? 0) - (loc.lng ?? 0)) < 0.0005),
        )
        set({
          current: withMeta,
          recents: [withMeta, ...existing].slice(0, 5),
        })
      },

      clearLocation: () => set({ current: null }),
    }),
    { name: 'qk-location', version: 2 },
  ),
)

// Returns current location label/area for display, falls back to prompt text
export const getLocation = (state: LocationState) =>
  state.current ?? DEFAULT_LOCATION
