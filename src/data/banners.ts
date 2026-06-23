import type { Banner } from '@/types/product'

const IMG = '?w=1400&q=80&auto=format&fit=crop'

export const banners: Banner[] = [
  {
    id: 'b1',
    title: 'Stock up on daily essentials',
    subtitle: 'Farm-fresh fruits, veggies, eggs & more — delivered in 10 minutes',
    img: `https://images.unsplash.com/photo-1542838132-92c53300491e${IMG}`,
    ctaText: 'Shop Now',
    bgColor: '#15803D',
  },
  {
    id: 'b2',
    title: 'Fresh fruits, hand-picked daily',
    subtitle: 'Juicy seasonal fruits straight from the farm',
    img: `https://images.unsplash.com/photo-1610832958506-aa56368176cf${IMG}`,
    ctaText: 'Order Now',
    bgColor: '#C2410C',
  },
  {
    id: 'b3',
    title: 'Dairy, fresh every morning',
    subtitle: 'Milk, paneer, curd & butter — always fresh',
    img: `https://images.unsplash.com/photo-1550583724-b2692b85b150${IMG}`,
    ctaText: 'Shop Dairy',
    bgColor: '#0F766E',
  },
  {
    id: 'b4',
    title: 'Munchies & cold drinks',
    subtitle: 'Chips, namkeen & beverages — party ready in minutes',
    img: `https://images.unsplash.com/photo-1578916171728-46686eac8d58${IMG}`,
    ctaText: 'Explore',
    bgColor: '#7C3AED',
  },
]
