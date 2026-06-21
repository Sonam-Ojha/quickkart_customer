import type { Category } from '@/types/product'

export const homeCategories: Category[] = [
  { id: 'c1', name: 'Fresh',       img: '🥦', slug: 'fresh'      },
  { id: 'c2', name: 'Dairy',       img: '🥛', slug: 'dairy'      },
  { id: 'c3', name: 'Snacks',      img: '🍟', slug: 'snacks'     },
  { id: 'c4', name: 'Bakery',      img: '🍞', slug: 'bakery'     },
  { id: 'c5', name: 'Beauty',      img: '💄', slug: 'beauty'     },
  { id: 'c6', name: 'Beverages',   img: '🧃', slug: 'beverages'  },
  { id: 'c7', name: 'Baby',        img: '🍼', slug: 'baby'       },
  { id: 'c8', name: 'Staples',     img: '🌾', slug: 'staples'    },
]

export const deptTabs = ['All', 'Fresh', 'Dairy', 'Snacks', 'Bakery', 'Beauty', 'Beverages', 'Baby']
