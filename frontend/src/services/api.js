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

// ── Named helper methods ───────────────────────────────────────

export const dailyTasksApi = {
  getAll: (params) => api.get('/daily-tasks', { params }),
  create: (data) => api.post('/daily-tasks', data),
  update: (id, data) => api.put(`/daily-tasks/${id}`, data),
  remove: (id) => api.delete(`/daily-tasks/${id}`),
}

export const namazApi = {
  getLog: (params) => api.get('/namaz/log', { params }),
  saveEntry: (data) => api.post('/namaz/log', data),
  bulkImportLog: (entries) => api.post('/namaz/log/bulk', { entries }),
  getStats: () => api.get('/namaz/stats'),
  getQuran: () => api.get('/namaz/quran'),
  saveQuran: (surahId, status) => api.post('/namaz/quran', { surahId, status }),
  bulkImportQuran: (statuses) => api.post('/namaz/quran/bulk', { statuses }),
}
