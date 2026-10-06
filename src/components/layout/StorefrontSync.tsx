import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocationStore } from '@/store/locationStore'
import { useStorefrontStore } from '@/store/storefrontStore'

// Catalogue queries whose results depend on the customer's location.
const LOCATION_QUERIES = new Set([
  'products', 'product', 'categories', 'category-detail', 'subcategory-products', 'search',
])

/** Re-checks serviceability and refetches the catalogue whenever the saved
 *  location moves (a different store — or none — may now cover it). */
export default function StorefrontSync() {
  const queryClient = useQueryClient()
  const check = useStorefrontStore((s) => s.check)
  const lat = useLocationStore((s) => s.current?.lat)
  const lng = useLocationStore((s) => s.current?.lng)
  const first = useRef(true)

  useEffect(() => {
    check()
    if (first.current) { first.current = false; return }
    queryClient.invalidateQueries({
      predicate: (q) => LOCATION_QUERIES.has(String(q.queryKey[0])),
    })
  }, [lat, lng, check, queryClient])

  return null
}
