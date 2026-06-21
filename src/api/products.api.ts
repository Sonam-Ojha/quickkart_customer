import type { Product, Banner, Category } from '@/types/product'

// Swap mock returns for api calls when backend is ready

export async function getHomeFeed(): Promise<{ banners: Banner[]; categories: Category[]; featured: Product[] }> {
  // return (await api.get('/api/app/home')).data
  return { banners: [], categories: [], featured: [] }
}

export async function getCategories(): Promise<Category[]> {
  // return (await api.get('/api/app/categories')).data
  return []
}

export async function getCategoryProducts(categoryId: string): Promise<Product[]> {
  // return (await api.get(`/api/app/categories/${categoryId}/products`)).data
  void categoryId
  return []
}

export async function search(query: string): Promise<Product[]> {
  // return (await api.get('/api/app/products/search', { params: { q: query } })).data
  void query
  return []
}

export async function getProduct(id: string): Promise<Product | null> {
  // return (await api.get(`/api/app/products/${id}`)).data
  void id
  return null
}
