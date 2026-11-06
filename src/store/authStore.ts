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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setAuth: (user, token) => {
        localStorage.setItem('qk_token', token)
        set({ user, token })
      },

      logout: () => {
        localStorage.removeItem('qk_token')
        set({ user: null, token: null })
      },

      isAuthenticated: () => {
        const token = get().token
        if (!token) return false
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.exp && Date.now() / 1000 > payload.exp) {
            // Token expired — clear it silently
            localStorage.removeItem('qk_token')
            set({ user: null, token: null })
            return false
          }
        } catch {}
        return true
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
