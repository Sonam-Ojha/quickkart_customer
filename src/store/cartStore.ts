import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types/product'

interface CartState {
  items: Record<string, CartItem>
  add: (product: Product) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  removeLine: (id: string) => void
  clear: () => void
  count: () => number
  subtotal: () => number
  mrpTotal: () => number
  savings: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      add: (product) =>
        set((state) => ({
          items: {
            ...state.items,
            [product.id]: state.items[product.id]
              ? { ...state.items[product.id], qty: state.items[product.id].qty + 1 }
              : { ...product, qty: 1 },
          },
        })),

      increment: (id) =>
        set((state) => ({
          items: state.items[id]
            ? { ...state.items, [id]: { ...state.items[id], qty: state.items[id].qty + 1 } }
            : state.items,
        })),

      decrement: (id) =>
        set((state) => {
          if (!state.items[id]) return state
          const qty = state.items[id].qty - 1
          if (qty <= 0) {
            const next = { ...state.items }
            delete next[id]
            return { items: next }
          }
          return { items: { ...state.items, [id]: { ...state.items[id], qty } } }
        }),

      removeLine: (id) =>
        set((state) => {
          const next = { ...state.items }
          delete next[id]
          return { items: next }
        }),

      clear: () => set({ items: {} }),

      count: () => Object.values(get().items).reduce((acc, i) => acc + i.qty, 0),

      subtotal: () =>
        Object.values(get().items).reduce((acc, i) => acc + i.price * i.qty, 0),

      mrpTotal: () =>
        Object.values(get().items).reduce((acc, i) => acc + i.originalPrice * i.qty, 0),

      savings: () => get().mrpTotal() - get().subtotal(),
    }),
    { name: 'qk-cart' },
  ),
)
