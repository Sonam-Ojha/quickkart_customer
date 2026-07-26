import { create } from 'zustand'

interface LocationState {
  isOpen: boolean
  address: string
  subLabel: string
  open: () => void
  close: () => void
  setAddress: (address: string, subLabel?: string) => void
}

/** Controls the delivery-location modal (open by default on first load). */
export const useLocationStore = create<LocationState>((set) => ({
  isOpen: true,
  address: 'Sector 18, Noida',
  subLabel: 'UP 201301',
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setAddress: (address, subLabel = '') => set({ address, subLabel, isOpen: false }),
}))
