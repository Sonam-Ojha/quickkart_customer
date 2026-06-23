import { create } from 'zustand'

interface CartUiState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

/** Controls the slide-in cart drawer (open over the current page). */
export const useCartUi = create<CartUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))
