import { api } from '.'
import type { CartItem, Order } from '@/types/product'

export async function placeOrder(items: CartItem[], addressId: string, couponCode?: string): Promise<Order> {
  return (await api.post('/api/app/orders', { items, addressId, couponCode })).data
}

export async function getOrders(): Promise<Order[]> {
  return (await api.get('/api/app/orders')).data
}

export async function getOrder(id: string): Promise<Order> {
  return (await api.get(`/api/app/orders/${id}`)).data
}
