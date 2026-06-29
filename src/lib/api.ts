import axios from 'axios'

const api = axios.create({
  baseURL: '/api/app',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qk_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
