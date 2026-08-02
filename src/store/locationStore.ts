import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedLocation {
  label: string        // e.g. "Home", "Work", or area name
  area: string         // e.g. "Sector 18, Noida"
  pincode: string      // e.g. "201301"
  lat?: number
  lng?: number
}

interface LocationState {
  current: SavedLocation | null
  recents: SavedLocation[]
  setLocation: (loc: SavedLocation) => void
  clearLocation: () => void
}

const DEFAULT_LOCATION: SavedLocation = {
  label: 'Home',
  area: 'Sector 18, Noida',
  pincode: '201301',
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      current: null,
      recents: [],

      setLocation: (loc) => {
        const existing = get().recents.filter(
          (r) => r.area !== loc.area || r.pincode !== loc.pincode,
        )
        set({
          current: loc,
          recents: [loc, ...existing].slice(0, 5),
        })
      },

      clearLocation: () => set({ current: null }),
    }),
    { name: 'qk-location' },
  ),
)

// Returns current location or default fallback
export const getLocation = (state: LocationState) =>
  state.current ?? DEFAULT_LOCATION
