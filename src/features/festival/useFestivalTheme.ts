import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useLocationStore } from '@/store/locationStore'
import type { Product } from '@/types/product'

/** Festival look set in Admin → Festival Themes (Diwali, Holi…). null = normal design. */
export interface FestivalTheme {
  id: number
  name: string
  version: number
  endsAt: string | null
  headerColor: string
  headerTextColor: 'light' | 'dark'
  headerImage: string | null
  decorationImage: string | null
  animationUrl: string | null
  animationMode: 'header' | 'once'
  accentColor: string
  greeting: string | null
  searchPlaceholder: string | null
  pageTint?: string | null
  pageImage?: string | null
  section: {
    enabled: boolean
    title: string | null
    subtitle: string | null
    bgColor: string
    bgImage: string | null
    bannerImage?: string | null
    tiles?: { label: string; image: string; query: string | null }[]
    products?: Product[]
  }
}

export function useFestivalTheme(): FestivalTheme | null {
  const loc = useLocationStore((s) => s.current)
  const { data } = useQuery({
    // location in the key → refetch when the customer changes area
    queryKey: ['festival-theme', loc?.lat ?? null, loc?.lng ?? null],
    queryFn: async () => (await api.get<{ theme: FestivalTheme | null }>('/theme')).data.theme,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
    retry: 1,
  })
  if (!data) return null
  if (data.endsAt && new Date(data.endsAt) <= new Date()) return null
  return data
}

/** Loads a Lottie JSON from a URL (null while loading / on error). */
export function useLottie(url: string | null | undefined) {
  const [json, setJson] = useState<object | null>(null)
  useEffect(() => {
    if (!url) { setJson(null); return }
    let alive = true
    fetch(url).then(r => r.json()).then(j => { if (alive) setJson(j) }).catch(() => { if (alive) setJson(null) })
    return () => { alive = false }
  }, [url])
  return json
}
