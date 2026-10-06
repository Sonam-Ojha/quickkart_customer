import { create } from 'zustand'
import api from '@/lib/api'
import { useAuthStore } from './authStore'

export interface ActiveOrder { id: number; status: string }

const FINISHED = new Set(['delivered', 'cancelled'])
const POLL_MS = 15_000

// The customer's latest order while it's still on its way — read from the
// server, so it survives reloads and new tabs. Only the latest order counts:
// once it's delivered or cancelled the strip disappears, even if an older order
// is still stuck in an open status.
interface ActiveOrderState {
  order: ActiveOrder | null
  refresh: () => Promise<void>
}

let poll: ReturnType<typeof setInterval> | undefined

export const useActiveOrderStore = create<ActiveOrderState>()((set) => ({
  order: null,
  refresh: async () => {
    if (!useAuthStore.getState().token) { stop(); set({ order: null }); return }
    try {
      const { data } = await api.get<ActiveOrder[]>('/orders') // newest first
      const latest = Array.isArray(data) ? data[0] : undefined
      const active = latest && !FINISHED.has(latest.status) ? { id: latest.id, status: latest.status } : null
      set({ order: active })
      if (active && !poll) poll = setInterval(() => useActiveOrderStore.getState().refresh(), POLL_MS)
      if (!active) stop()
    } catch {
      // Network blip — keep showing the last known status.
    }
  },
}))

function stop() {
  clearInterval(poll)
  poll = undefined
}
