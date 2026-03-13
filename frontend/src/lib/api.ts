/**
 * API клиент для взаимодействия с backend
 */
import axios from 'axios'
import { useAuthStore } from '@/lib/store'

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
    // Берём токен из localStorage (основной) или из zustand persist (backup)
    let token = localStorage.getItem('access_token')
    if (!token) {
      try {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          token = parsed?.state?.token || null
          // Синхронизируем обратно в access_token
          if (token) {
            localStorage.setItem('access_token', token)
          }
        }
      } catch {}
    }
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
      // Очищаем ОБА хранилища токена (localStorage и zustand persist)
      localStorage.removeItem('access_token')
      localStorage.removeItem('auth-storage')
      
      // Также чистим zustand в памяти (без этого state не синхронизируется)
      try {
        useAuthStore.getState().logout()
      } catch {}
      
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
  guide_status?: string
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
  updateProfile: (data: { name?: string; email?: string; bio?: string }) =>
    api.put('/users/me', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/users/me/change-password', data),
  applyGuide: () => api.post('/users/apply-guide'),
}

// Админка
export const adminApi = {
  getGuideApplications: () => api.get<User[]>('/admin/guide-applications'),
  approveGuideApplication: (userId: string) => api.post(`/admin/guide-applications/${userId}/approve`),
  rejectGuideApplication: (userId: string) => api.post(`/admin/guide-applications/${userId}/reject`),
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
    is_public?: boolean
    limit?: number
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
  
  // Полное обновление всех полей тура (для админов)
  fullUpdate: (id: number, tour: Partial<{
    title: string
    description: string
    price: number
    duration: number
    location: string
    category: string
    photos: string[]
    start_date: string | null
    end_date: string | null
    what_to_expect: string
    organizational_details: string
    included: string[]
    not_included: string[]
    meeting_point: string
    languages: string[]
    max_group_size: number
    min_age: number
    difficulty_level: string
    landmarks: string[]
    tags: string[]
    themes: string[]
    formats: string[]
    long_description: string
    seo_title: string
    seo_description: string
    active: boolean
    is_public: boolean
  }>) => api.put(`/admin/tours/${id}/full-update`, tour),
  
  // Получить полную информацию о туре для редактирования
  getFullDetails: (id: number) => api.get(`/admin/tours/${id}`),
  
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
