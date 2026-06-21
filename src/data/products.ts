import type { Product } from '@/types/product'

export const products: Product[] = [
  // Fresh
  { id: 'p1',  name: 'Fresho Tomato',         weight: '500g',  price: 29,  originalPrice: 39,  img: 'https://picsum.photos/seed/tomato/200/200',   badge: 'fresh',      category: 'Fresh' },
  { id: 'p2',  name: 'Fresho Onion',           weight: '1 kg',  price: 39,  originalPrice: 55,  img: 'https://picsum.photos/seed/onion/200/200',    badge: 'fresh',      category: 'Fresh' },
  { id: 'p3',  name: 'Fresho Potato',          weight: '1 kg',  price: 34,  originalPrice: 45,  img: 'https://picsum.photos/seed/potato/200/200',   badge: 'fresh',      category: 'Fresh' },
  { id: 'p4',  name: 'Fresho Banana',          weight: '6 pcs', price: 49,  originalPrice: 65,  img: 'https://picsum.photos/seed/banana/200/200',   badge: 'fresh',      category: 'Fresh' },
  { id: 'p5',  name: 'Fresho Apple Shimla',    weight: '4 pcs', price: 99,  originalPrice: 130, img: 'https://picsum.photos/seed/apple1/200/200',   badge: 'fresh',      category: 'Fresh' },
  { id: 'p6',  name: 'Fresho Mango Alphonso',  weight: '1 kg',  price: 149, originalPrice: 199, img: 'https://picsum.photos/seed/mango/200/200',    badge: 'fresh',      category: 'Fresh' },
  // Dairy
  { id: 'p7',  name: 'Amul Taza Milk',         weight: '500 ml', price: 30,  originalPrice: 30, img: 'https://picsum.photos/seed/milk1/200/200',    badge: 'bestseller', category: 'Dairy' },
  { id: 'p8',  name: 'Amul Butter',            weight: '100g',  price: 55,  originalPrice: 58,  img: 'https://picsum.photos/seed/butter/200/200',   badge: 'bestseller', category: 'Dairy' },
  { id: 'p9',  name: 'Britannia Paneer',       weight: '200g',  price: 89,  originalPrice: 95,  img: 'https://picsum.photos/seed/paneer/200/200',                        category: 'Dairy' },
  { id: 'p10', name: 'Mother Dairy Curd',      weight: '400g',  price: 45,  originalPrice: 48,  img: 'https://picsum.photos/seed/curd/200/200',     badge: 'bestseller', category: 'Dairy' },
  { id: 'p11', name: 'Amul Gold Milk',         weight: '1 L',   price: 66,  originalPrice: 66,  img: 'https://picsum.photos/seed/milk2/200/200',                         category: 'Dairy' },
  // Snacks
  { id: 'p12', name: "Lay's Classic Salted",   weight: '73g',   price: 20,  originalPrice: 20,  img: 'https://picsum.photos/seed/lays/200/200',     badge: 'deal',       category: 'Snacks' },
  { id: 'p13', name: 'Kurkure Masala Munch',   weight: '90g',   price: 20,  originalPrice: 20,  img: 'https://picsum.photos/seed/kurkure/200/200',                       category: 'Snacks' },
  { id: 'p14', name: 'Bingo Mad Angles',        weight: '65g',   price: 20,  originalPrice: 20,  img: 'https://picsum.photos/seed/bingo/200/200',    badge: 'deal',       category: 'Snacks' },
  { id: 'p15', name: 'Haldiram Aloo Bhujia',   weight: '200g',  price: 70,  originalPrice: 80,  img: 'https://picsum.photos/seed/bhujia/200/200',   badge: 'bestseller', category: 'Snacks' },
  { id: 'p16', name: 'Oreo Chocolate Cream',   weight: '120g',  price: 35,  originalPrice: 40,  img: 'https://picsum.photos/seed/oreo/200/200',                          category: 'Snacks' },
  // Beverages
  { id: 'p17', name: 'Coca-Cola',              weight: '750 ml', price: 40, originalPrice: 40,  img: 'https://picsum.photos/seed/cola/200/200',     badge: 'deal',       category: 'Beverages' },
  { id: 'p18', name: 'Tropicana Orange',       weight: '1 L',   price: 99,  originalPrice: 120, img: 'https://picsum.photos/seed/juice/200/200',    badge: 'deal',       category: 'Beverages' },
  { id: 'p19', name: 'Red Bull Energy',        weight: '250 ml', price: 115, originalPrice: 125, img: 'https://picsum.photos/seed/redbull/200/200',                      category: 'Beverages' },
  { id: 'p20', name: 'Tata Tea Gold',          weight: '250g',  price: 120, originalPrice: 130, img: 'https://picsum.photos/seed/tea/200/200',      badge: 'bestseller', category: 'Beverages' },
  // Bakery
  { id: 'p21', name: 'Britannia Bread',        weight: '400g',  price: 40,  originalPrice: 45,  img: 'https://picsum.photos/seed/bread/200/200',    badge: 'bestseller', category: 'Bakery' },
  { id: 'p22', name: 'Parle-G Biscuit',        weight: '200g',  price: 20,  originalPrice: 20,  img: 'https://picsum.photos/seed/parleg/200/200',   badge: 'bestseller', category: 'Bakery' },
  { id: 'p23', name: 'Britannia Good Day',     weight: '150g',  price: 30,  originalPrice: 35,  img: 'https://picsum.photos/seed/goodday/200/200',                       category: 'Bakery' },
  // Staples
  { id: 'p24', name: 'India Gate Basmati',     weight: '5 kg',  price: 499, originalPrice: 599, img: 'https://picsum.photos/seed/rice/200/200',     badge: 'deal',       category: 'Staples' },
  { id: 'p25', name: 'Aashirvaad Atta',        weight: '5 kg',  price: 265, originalPrice: 290, img: 'https://picsum.photos/seed/atta/200/200',     badge: 'bestseller', category: 'Staples' },
  { id: 'p26', name: 'Fortune Sunflower Oil',  weight: '1 L',   price: 135, originalPrice: 155, img: 'https://picsum.photos/seed/oil/200/200',      badge: 'deal',       category: 'Staples' },
  { id: 'p27', name: 'Tata Salt Lite',         weight: '1 kg',  price: 24,  originalPrice: 26,  img: 'https://picsum.photos/seed/salt/200/200',                          category: 'Staples' },
  { id: 'p28', name: 'MDH Chana Masala',       weight: '100g',  price: 45,  originalPrice: 50,  img: 'https://picsum.photos/seed/masala/200/200',   badge: 'bestseller', category: 'Staples' },
  // Beauty
  { id: 'p29', name: 'Dove Moisturising Body', weight: '100g',  price: 65,  originalPrice: 75,  img: 'https://picsum.photos/seed/dove/200/200',     badge: 'deal',       category: 'Beauty' },
  { id: 'p30', name: 'Head & Shoulders',       weight: '340 ml', price: 199, originalPrice: 240, img: 'https://picsum.photos/seed/shampoo/200/200', badge: 'deal',       category: 'Beauty' },
]

export const dealOfTheDay = products.filter((p) => p.badge === 'deal')
export const bestSellers  = products.filter((p) => p.badge === 'bestseller')
export const freshDeals   = products.filter((p) => p.category === 'Fresh')
