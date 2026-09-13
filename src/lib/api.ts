import axios from 'axios'

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

export default api
