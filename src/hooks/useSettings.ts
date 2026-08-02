import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface WhyItem { icon: string; title: string; desc: string }

export interface SiteSettings {
  footer_tagline:          string
  support_phone:           string
  support_email:           string
  company_address:         string
  copyright_text:          string
  footer_badge:            string
  delivery_fee:            string
  free_delivery_threshold: string
  handling_charge:         string
  why_choose_us:           string   // JSON string → WhyItem[]
}

const DEFAULT_WHY: WhyItem[] = [
  { icon: '⚡', title: '10 Min Delivery',  desc: 'Get your order delivered to your doorstep in minutes from nearby dark stores.' },
  { icon: '🛡️', title: 'Best Prices',      desc: 'Best price destination with offers directly from the manufacturers.' },
  { icon: '🎁', title: 'Wide Assortment', desc: 'Choose from thousands of products across all categories.' },
]

const DEFAULTS: SiteSettings = {
  footer_tagline:          'Groceries, essentials & documents delivered in minutes.',
  support_phone:           '1800-XXX-XXXX (Toll Free)',
  support_email:           'help@jhatpats.in',
  company_address:         'Noida, Uttar Pradesh',
  copyright_text:          '© 2026 Jhatpats Technologies Pvt. Ltd. All rights reserved.',
  footer_badge:            '10-minute delivery · 30,000+ products',
  delivery_fee:            '30',
  free_delivery_threshold: '99',
  handling_charge:         '5',
  why_choose_us:           JSON.stringify(DEFAULT_WHY),
}

export function parseWhyItems(raw: string): WhyItem[] {
  try { return JSON.parse(raw) } catch { return DEFAULT_WHY }
}

export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await api.get<Partial<SiteSettings>>('/settings')
      return { ...DEFAULTS, ...data }
    },
    staleTime: 1000 * 60 * 10,
  })
}
