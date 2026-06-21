import type { Banner } from '@/types/product'

export const banners: Banner[] = [
  {
    id: 'b1',
    title: 'Fresh Vegetables',
    subtitle: 'Farm to door in 10 minutes',
    img: 'https://picsum.photos/seed/grocery1/600/240',
    ctaText: 'Shop Now',
    bgColor: '#FFEDD5',
  },
  {
    id: 'b2',
    title: 'Dairy Essentials',
    subtitle: 'Milk, Paneer & more — always fresh',
    img: 'https://picsum.photos/seed/dairy1/600/240',
    ctaText: 'Order Now',
    bgColor: '#CCFBF1',
  },
  {
    id: 'b3',
    title: 'Snacks & Drinks',
    subtitle: 'Party time? We deliver fast!',
    img: 'https://picsum.photos/seed/snacks1/600/240',
    ctaText: 'Explore',
    bgColor: '#FEF3C7',
  },
]
