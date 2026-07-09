import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Category {
  id: number
  name: string
  parentId: number | null
  icon: string | null
  sortOrder: number
  image_url: string | null
  is_active: boolean
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn:  async () => {
      const { data } = await api.get<Category[]>('/categories')
      return data
    },
    staleTime: 1000 * 60 * 10, // cache for 10 min — categories don't change often
  })
}
