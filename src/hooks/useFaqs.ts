import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Faq {
  id: number
  question: string
  answer: string
  sortOrder: number
}

export function useFaqs(page: string) {
  return useQuery<Faq[]>({
    queryKey: ['faqs', page],
    queryFn:  async () => {
      const { data } = await api.get<Faq[]>('/faqs', { params: { page } })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}
