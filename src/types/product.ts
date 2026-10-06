export interface Product {
  id: string
  name: string
  weight: string
  price: number
  originalPrice: number
  img: string
  badge?: 'bestseller' | 'deal' | 'fresh' | 'new'
  category?: string
  subcategory?: string
  /** Sold at a store that covers the customer's location (false when no
   *  location is set yet or no store delivers there). */
  available?: boolean
  /** False only when the store tracks this product's stock and it has run out. */
  inStock?: boolean
}

export interface Category {
  id: string
  name: string
  img: string
  slug: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  img: string
  ctaText?: string
  ctaLink?: string
  bgColor?: string
}

export interface CartItem extends Product {
  qty: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  createdAt: string
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered'
}
