import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Product } from '@/types/product'

interface ProductsParams {
  tag?:           'deal' | 'bestseller' | 'new'
  category_name?: string
  category_id?:   number
  q?:             string
  limit?:         number
  offset?:        number
}

interface ProductsResponse {
  products: Product[]
  total:    number
}

export function useProducts(params: ProductsParams = {}) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get<ProductsResponse>('/products', { params })
      return data
    },
    staleTime: 1000 * 60 * 2,
  })
}
