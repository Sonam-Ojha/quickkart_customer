import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

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
}

const DEFAULTS: SiteSettings = {
  footer_tagline:          'Groceries, essentials & documents delivered in minutes.',
  support_phone:           '1800-XXX-XXXX (Toll Free)',
  support_email:           'help@quickkart.in',
  company_address:         'Noida, Uttar Pradesh',
  copyright_text:          '© 2026 QuickKart Technologies Pvt. Ltd. All rights reserved.',
  footer_badge:            '10-minute delivery · 30,000+ products',
  delivery_fee:            '30',
  free_delivery_threshold: '99',
  handling_charge:         '5',
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
