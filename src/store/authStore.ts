import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  name: string
  phone?: string
  mobile?: string
  email?: string
  walletBalance: number
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  evictIfExpired: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      // Token is persisted via Zustand's persist middleware under 'qk-customer-auth'.
      // No separate localStorage.setItem needed.
      setAuth: (user, token) => {
        set({ user, token })
      },

      logout: () => {
        set({ user: null, token: null })
        import('@/store/cartStore').then(({ useCartStore }) => useCartStore.getState().clear()).catch(() => {})
      },

      // Pure read — does NOT call set(). Expiry eviction is done by evictIfExpired
      // which is called from StorefrontSync on mount, not during render.
      isAuthenticated: () => {
        const token = get().token
        if (!token) return false
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.exp && Date.now() / 1000 > payload.exp) return false
        } catch {}
        return true
      },

      // Call this from an effect (StorefrontSync) to clear an expired token safely.
      evictIfExpired: () => {
        const token = get().token
        if (!token) return
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.exp && Date.now() / 1000 > payload.exp) {
            get().logout()
          }
        } catch {
          get().logout()
        }
      },
    }),
    {
      name: 'qk-customer-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
