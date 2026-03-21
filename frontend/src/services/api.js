import axios from 'axios'

const isBrowser = typeof window !== 'undefined'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  ((isBrowser && window.location.hostname === 'localhost')
    ? '/api'
    : 'https://ai-life-portal-backnd.vercel.app/api')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isAuthScreenRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password')
    const token = localStorage.getItem('token')

    if (error.response?.status === 401 && token && !isAuthScreenRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
