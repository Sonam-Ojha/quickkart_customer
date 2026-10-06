import axios from 'axios'
import { useLocationStore } from '@/store/locationStore'

// In dev (npm run dev): default to localhost:4000 so no .env file is needed.
// In production build: default to the live API.
const DEFAULT_API = import.meta.env.DEV ? 'http://localhost:4000' : 'https://api.jhatpats.com'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API}/api/app`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qk_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Catalogue requests carry the customer's location so the backend can pick
// the store whose radius covers it (and hide products switched off there).
const LOCATION_SCOPED = /^\/(products|categories)(\/|\?|$)/

api.interceptors.request.use((config) => {
  const loc = useLocationStore.getState().current
  if (config.method === 'get' && LOCATION_SCOPED.test(config.url ?? '') && loc?.lat != null && loc?.lng != null) {
    config.params = { ...config.params, lat: loc.lat, lng: loc.lng }
  }
  return config
})

export default api
