import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Order } from '@/types/product'

interface OrderState {
  orders: Order[]
  recordOrder: (items: CartItem[], total: number) => void
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      recordOrder: (items, total) => {
        const newOrder: Order = {
          id: `ORD-${Date.now()}`,
          items,
          total,
          createdAt: new Date().toISOString(),
          status: 'placed',
        }
        set({ orders: [newOrder, ...get().orders] })
      },
    }),
    { name: 'qk-orders' },
  ),
)
