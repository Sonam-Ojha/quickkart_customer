import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Banner } from '@/types/product'

export interface PromoBanner extends Banner {
  emoji:   string
  bgType:  string
  ctaLink: string | undefined
}

export function useBanners(section?: 'hero' | 'promo') {
  return useQuery<(Banner & PromoBanner)[]>({
    queryKey: ['banners', section ?? 'all'],
    queryFn: async () => {
      const params = section ? { section } : {}
      const { data } = await api.get<(Banner & PromoBanner)[]>('/banners', { params })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}
