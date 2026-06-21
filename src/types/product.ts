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
