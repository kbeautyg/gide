/**
 * API клиент для взаимодействия с backend
 */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gide-production.up.railway.app/api/v1'

// Создаем axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Добавляем interceptor для JWT токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Добавляем interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Разлогиниваем пользователя при 401
      localStorage.removeItem('access_token')
      
      // Редиректим на логин только если пользователь на защищенной странице
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/dashboard')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// === ТИПЫ ===
import type { Tour } from '@/types/tour'

export type { Tour }

export interface TourListResponse {
  tours: Tour[]
  total: number
  page: number
  page_size: number
}

export interface Booking {
  id: number
  tour_id: number
  tour_title: string
  client_name: string
  client_phone: string
  date: string
  participants_count: number
  total_price: number
  status: string
  payment_status: string
  created_at: string
}

export interface User {
  id: string
  phone: string
  email?: string
  name?: string
  role: string
  balance_rub: number
  balance_usd: number
  balance_thb: number
}

// === API ФУНКЦИИ ===

// Аутентификация
export const authApi = {
  login: (phone: string, password: string) =>
    api.post('/auth/login', { phone, password }),
  
  register: (phone: string, email: string | null, password: string, name: string | null) =>
    api.post('/auth/register', { phone, email, password, name }),
  
  logout: () => api.post('/auth/logout'),
}

// Пользователи
export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
}

// Экскурсии
export const toursApi = {
  getList: (params?: {
    location?: string
    category?: string
    min_price?: number
    max_price?: number
    page?: number
    page_size?: number
    include_private?: boolean
  }) => api.get<TourListResponse>('/tours/', { params }),
  
  getById: (id: number | string) => api.get<Tour>(`/tours/${id}`),
  
  create: (tour: {
    title: string
    description: string
    price: number
    duration: number
    location: string
    category: string
    photos?: string[]
    start_date?: string | null
    end_date?: string | null
  }) => api.post<Tour>('/tours/', tour),
  
  update: (id: number, tour: {
    title: string
    description: string
    price: number
    duration: number
    location: string
    category: string
    photos?: string[]
    start_date?: string | null
    end_date?: string | null
  }) => api.put<Tour>(`/tours/${id}`, tour),
  
  updateDates: (id: number, dates: {
    start_date: string
    end_date: string
  }) => api.put(`/tours/${id}/dates`, dates),
  
  delete: (id: number) => api.delete(`/tours/${id}`),
}

// Бронирования
export const bookingsApi = {
  create: (booking: {
    tour_id: number
    date: string
    participants_count: number
    client_name: string
    client_phone: string
    client_email?: string
    telegram_username?: string
  }) => api.post<Booking>('/bookings/', booking),
  
  getById: (id: number | string) => api.get<Booking>(`/bookings/${id}`),
}

export default api
