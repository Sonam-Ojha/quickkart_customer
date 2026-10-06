import { create } from 'zustand'
import api from '@/lib/api'
import { useLocationStore } from './locationStore'

// Whether a store delivers to the customer's saved location.
//   null  → no location yet, or not checked yet (treat as "unknown", don't block)
//   true  → a store's radius covers it
//   false → no store delivers there ("Currently unavailable")
interface StorefrontState {
  serviceable: boolean | null
  check: () => Promise<void>
}

export const useStorefrontStore = create<StorefrontState>()((set) => ({
  serviceable: null,
  check: async () => {
    const loc = useLocationStore.getState().current
    if (loc?.lat == null || loc?.lng == null) { set({ serviceable: null }); return }
    try {
      const { data } = await api.get<{ serviceable: boolean }>('/location/serviceability', {
        params: { lat: loc.lat, lng: loc.lng },
      })
      set({ serviceable: data.serviceable === true })
    } catch {
      // Network error — don't block the customer.
      set({ serviceable: null })
    }
  },
}))

/** True when a location is set and no store delivers to it. */
export const useIsUnavailable = () => useStorefrontStore((s) => s.serviceable === false)
