import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types/product'
import { useStorefrontStore } from './storefrontStore'
import { showToast } from './toastStore'

/** True when the product's tracked stock at the customer's store has run out. */
export const isOutOfStock = (p: Product) => p.available === true && p.inStock === false

// Blocks adding (with a message) when no store delivers to the saved location.
// With no location yet adding is allowed — the address is checked at checkout.
function canAddHere(): boolean {
  if (useStorefrontStore.getState().serviceable !== false) return true
  showToast('Currently unavailable at your location. Change your location to order.')
  return false
}

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

      add: (product) => {
        if (!canAddHere()) return
        if (isOutOfStock(product)) { showToast('This item is out of stock right now.'); return }
        set((state) => ({
          items: {
            ...state.items,
            [product.id]: state.items[product.id]
              ? { ...state.items[product.id], qty: state.items[product.id].qty + 1 }
              : { ...product, qty: 1 },
          },
        }))
      },

      increment: (id) => {
        if (!canAddHere()) return
        set((state) => ({
          items: state.items[id]
            ? { ...state.items, [id]: { ...state.items[id], qty: state.items[id].qty + 1 } }
            : state.items,
        }))
      },

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
