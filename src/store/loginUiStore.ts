import { create } from 'zustand'

interface LoginUiState {
  isOpen: boolean
  /** Where to go after a successful login (stays on the current page when null). */
  redirect: string | null
  open: (redirect?: string) => void
  close: () => void
}

/** Controls the login modal (opens over the current page instead of /login). */
export const useLoginUi = create<LoginUiState>((set) => ({
  isOpen: false,
  redirect: null,
  open: (redirect) => set({ isOpen: true, redirect: redirect ?? null }),
  close: () => set({ isOpen: false, redirect: null }),
}))
