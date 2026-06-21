import { useState } from 'react'
import SearchBar from '@/components/ui/SearchBar'
import type { Product } from '@/types/product'

const railCategories = [
  { id: 'all',  label: 'All' },
  { id: 'veg',  label: 'Fresh Vegetables' },
  { id: 'fruit',label: 'Fresh Fruits' },
  { id: 'exotic',label:'Exotics' },
  { id: 'herb', label: 'Coriander & Others' },
  { id: 'flower',label:'Flowers & Leaves' },
  { id: 'season',label:'Seasonal' },
]

const freshProducts: (Product & { hindi: string; hasPack?: boolean })[] = [
  { id: 'f1',  name: 'Tomato',        hindi: 'Tamatar',  weight: '500g',  price: 29,  originalPrice: 39,  img: 'https://picsum.photos/seed/tomato/200/200',   badge: 'fresh', category: 'veg'    },
  { id: 'f2',  name: 'Onion',         hindi: 'Pyaaz',    weight: '1 kg',  price: 39,  originalPrice: 55,  img: 'https://picsum.photos/seed/onion/200/200',    badge: 'fresh', category: 'veg'    },
  { id: 'f3',  name: 'Potato',        hindi: 'Aloo',     weight: '1 kg',  price: 34,  originalPrice: 45,  img: 'https://picsum.photos/seed/potato/200/200',   badge: 'fresh', category: 'veg'    },
  { id: 'f4',  name: 'Spinach',       hindi: 'Palak',    weight: '250g',  price: 19,  originalPrice: 25,  img: 'https://picsum.photos/seed/spinach/200/200',  badge: 'fresh', category: 'veg',   hasPack: true },
  { id: 'f5',  name: 'Capsicum',      hindi: 'Shimla Mirch', weight: '250g', price: 29, originalPrice: 35, img: 'https://picsum.photos/seed/capsicum/200/200', badge: 'fresh', category: 'veg' },
  { id: 'f6',  name: 'Cucumber',      hindi: 'Kheera',   weight: '500g',  price: 25,  originalPrice: 32,  img: 'https://picsum.photos/seed/cucumber/200/200', badge: 'fresh', category: 'veg'    },
  { id: 'f7',  name: 'Banana',        hindi: 'Kela',     weight: '6 pcs', price: 49,  originalPrice: 65,  img: 'https://picsum.photos/seed/banana/200/200',   badge: 'fresh', category: 'fruit'  },
  { id: 'f8',  name: 'Apple Shimla',  hindi: 'Seb',      weight: '4 pcs', price: 99,  originalPrice: 130, img: 'https://picsum.photos/seed/apple1/200/200',   badge: 'fresh', category: 'fruit', hasPack: true },
  { id: 'f9',  name: 'Mango Alphonso',hindi: 'Aam',      weight: '1 kg',  price: 149, originalPrice: 199, img: 'https://picsum.photos/seed/mango/200/200',    badge: 'fresh', category: 'fruit'  },
  { id: 'f10', name: 'Papaya',        hindi: 'Papita',   weight: '1 kg',  price: 55,  originalPrice: 70,  img: 'https://picsum.photos/seed/papaya/200/200',   badge: 'fresh', category: 'fruit'  },
  { id: 'f11', name: 'Dragon Fruit',  hindi: 'Dragon Fruit', weight: '1 pc', price: 129, originalPrice: 160, img: 'https://picsum.photos/seed/dragon/200/200', badge: 'fresh', category: 'exotic' },
  { id: 'f12', name: 'Avocado',       hindi: 'Avocado',  weight: '2 pcs', price: 149, originalPrice: 180, img: 'https://picsum.photos/seed/avocado/200/200',  badge: 'fresh', category: 'exotic'  },
  { id: 'f13', name: 'Coriander',     hindi: 'Dhaniya',  weight: '50g',   price: 10,  originalPrice: 15,  img: 'https://picsum.photos/seed/coriander/200/200',badge: 'fresh', category: 'herb'   },
  { id: 'f14', name: 'Mint',          hindi: 'Pudina',   weight: '50g',   price: 10,  originalPrice: 15,  img: 'https://picsum.photos/seed/mint/200/200',     badge: 'fresh', category: 'herb'   },
  { id: 'f15', name: 'Rose Bouquet',  hindi: 'Gulab',    weight: '10 pcs',price: 99,  originalPrice: 130, img: 'https://picsum.photos/seed/rose/200/200',     badge: 'fresh', category: 'flower' },
  { id: 'f16', name: 'Marigold',      hindi: 'Genda',    weight: '200g',  price: 39,  originalPrice: 50,  img: 'https://picsum.photos/seed/marigold/200/200', badge: 'fresh', category: 'flower' },
]

export default function FreshPage() {
  const [activeCat, setActiveCat] = useState('all')

  const shown = activeCat === 'all'
    ? freshProducts
    : freshProducts.filter((p) => p.category === activeCat)

  return (
    <div className="flex flex-col min-h-full">
      {/* Teal gradient header */}
      <div className="bg-gradient-to-br from-tealDark via-deepTeal to-tealDark text-white px-4 pt-10 pb-5 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-inter font-extrabold text-2xl">Fresh today</h1>
            <p className="font-jakarta text-xs opacity-70 mt-0.5">
              Hand-picked produce, delivered in 10 minutes
            </p>
          </div>
          <span className="text-4xl">🥬</span>
        </div>
        <div className="mt-3">
          <SearchBar placeholder='Search fresh produce...' />
        </div>
      </div>

      {/* 2-pane layout */}
      <div className="flex flex-1">
        {/* Left category rail */}
        <nav className="w-[76px] bg-white border-r border-border shrink-0 sticky top-0 self-start">
          {railCategories.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveCat(id)}
              className={`w-full px-2 py-3 text-left text-[10px] font-jakarta leading-tight border-b border-border transition-colors ${
                activeCat === id
                  ? 'bg-tealTint text-deepTeal font-semibold border-l-2 border-l-deepTeal'
                  : 'text-textSecondary'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right product grid */}
        <div className="flex-1 p-3 bg-appBackground">
          <div className="grid grid-cols-2 gap-2.5">
            {shown.map((p) => (
              <FreshProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FreshProductCard({ product }: { product: typeof freshProducts[0] }) {
  const items     = useCartStore((s) => s.items)
  const add       = useCartStore((s) => s.add)
  const increment = useCartStore((s) => s.increment)
  const decrement = useCartStore((s) => s.decrement)

  const qty  = items[product.id]?.qty ?? 0
  const disc = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <div className="bg-cardSurface rounded-card border border-border p-2.5 flex flex-col">
      {/* Image */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-inputFill mb-2">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        <span className="absolute top-1 left-1 bg-deepTeal text-white text-[9px] font-inter font-bold px-1.5 py-0.5 rounded-full">
          8 mins
        </span>
      </div>

      {/* Name with Hindi */}
      <p className="font-jakarta text-[11px] text-ink line-clamp-1 font-semibold">{product.name}</p>
      <p className="font-jakarta text-[10px] text-muted">({product.hindi})</p>
      <p className="font-jakarta text-[10px] text-muted mt-0.5">{product.weight}</p>

      {/* Price */}
      <div className="flex items-center gap-1 mt-1 mb-2">
        <span className="font-inter font-bold text-sm text-ink">₹{product.price}</span>
        {disc > 0 && (
          <span className="font-inter text-[9px] text-success font-semibold">{disc}% off</span>
        )}
      </div>

      {/* ADD / stepper */}
      {qty === 0 ? (
        <button
          onClick={() => add(product)}
          className="w-full h-8 bg-primaryOrange text-white rounded-btn text-xs font-inter font-bold"
        >
          ADD
        </button>
      ) : (
        <div className="flex items-center justify-between bg-primaryOrange rounded-btn h-8 px-1.5">
          <button onClick={() => decrement(product.id)} className="w-6 h-6 flex items-center justify-center text-white font-bold">−</button>
          <span className="font-inter font-bold text-white text-sm">{qty}</span>
          <button onClick={() => increment(product.id)} className="w-6 h-6 flex items-center justify-center text-white font-bold">+</button>
        </div>
      )}
    </div>
  )
}

import { useCartStore } from '@/store/cartStore'
