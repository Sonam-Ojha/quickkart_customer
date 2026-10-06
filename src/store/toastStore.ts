import { create } from 'zustand'

// One transient message at a time, shown by <Toast /> in the app shell.
interface ToastState {
  message: string | null
  show: (message: string) => void
  hide: () => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  show: (message) => {
    clearTimeout(timer)
    set({ message })
    timer = setTimeout(() => set({ message: null }), 3000)
  },
  hide: () => set({ message: null }),
}))

export const showToast = (message: string) => useToastStore.getState().show(message)
