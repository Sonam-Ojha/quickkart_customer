import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Product } from '@/types/product'

export interface Category {
  id: number
  name: string
  parentId: number | null
  icon: string | null
  sortOrder: number
  imageUrl: string | null
  is_active: boolean
}

export interface CategoryDetail {
  category:      Category
  subcategories: Category[]
  products:      Product[]
  total:         number
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn:  async () => {
      const { data } = await api.get<Category[]>('/categories')
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

// Fetches a category + its subcategories + all products (root+subs)
export function useCategoryDetail(id: number | null) {
  return useQuery<CategoryDetail>({
    queryKey: ['category-detail', id],
    queryFn:  async () => {
      const { data } = await api.get<CategoryDetail>(`/categories/${id}/all-products?limit=80`)
      return data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

// Fetches products for a specific subcategory
export function useSubCategoryProducts(subId: number | null) {
  return useQuery<{ products: Product[]; total: number }>({
    queryKey: ['subcategory-products', subId],
    queryFn:  async () => {
      const { data } = await api.get(`/categories/${subId}/products?limit=80`)
      return data
    },
    enabled: !!subId,
    staleTime: 1000 * 60 * 2,
  })
}
