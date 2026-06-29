import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  name: string
  phone: string
  email?: string
  walletBalance: number
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        localStorage.setItem('qk_token', token)
        set({ user, token })
      },

      logout: () => {
        localStorage.removeItem('qk_token')
        set({ user: null, token: null })
      },

      isAuthenticated: () => !!get().token,
    }),
    { name: 'qk-customer-auth' },
  ),
)
