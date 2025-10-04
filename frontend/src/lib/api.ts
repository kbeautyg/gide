import axios from 'axios'
import { useAuthStore } from './store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor для добавления токена
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API методы
export const authAPI = {
  login: (phone: string, password: string) =>
    api.post('/api/auth/login', { phone, password }),
  
  register: (data: { phone: string; password: string; full_name: string }) =>
    api.post('/api/auth/register', data),
  
  me: () => api.get('/api/auth/me'),
}

export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id: string) => api.get(`/api/users/${id}`),
}
