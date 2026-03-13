/**
 * Hook для работы с аутентификацией
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store'
import { authApi, usersApi } from '@/lib/api'
import { useNavigate, useLocation } from 'react-router-dom'

// Нормализация номера телефона
function normalizePhone(phone: string): string {
  // Убираем все нецифровые символы
  const digits = phone.replace(/\D/g, '')
  
  // Если начинается с 8, заменяем на 7
  if (digits.startsWith('8')) {
    return '+7' + digits.slice(1)
  }
  
  // Если начинается с 7, добавляем +
  if (digits.startsWith('7')) {
    return '+' + digits
  }
  
  // Если 10 цифр без кода страны, добавляем +7
  if (digits.length === 10) {
    return '+7' + digits
  }
  
  // Иначе добавляем + если его нет
  return phone.startsWith('+') ? phone : '+' + digits
}

export function useAuth(options?: { preventRedirect?: boolean }) {
  const { user, token, isAuthenticated, setAuth, logout: logoutStore } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Профиль НЕ грузим на страницах логина/регистрации — там он не нужен и мешает
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  // Логин
  const loginMutation = useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authApi.login(normalizePhone(phone), password),
    onSuccess: (response) => {
      const { access_token, user_id, role, guide_status } = response.data
      setAuth({ id: user_id, phone: '', role, guide_status }, access_token)
      
      if (options?.preventRedirect) {
        return
      }

      // Редирект в зависимости от роли
      if (role === 'super_admin') {
        navigate('/dashboard/superadmin')
      } else if (role === 'admin') {
        navigate('/dashboard/admin')
      } else if (role === 'manager' || role === 'guide') {
        navigate('/dashboard/manager')
      } else {
        navigate('/dashboard')
      }
    },
  })

  // Регистрация
  const registerMutation = useMutation({
    mutationFn: ({ phone, email, password, name }: {
      phone: string
      email: string | null
      password: string
      name: string | null
    }) => authApi.register(normalizePhone(phone), email, password, name),
    onSuccess: (response) => {
      const { access_token, user_id, role, guide_status } = response.data
      setAuth({ id: user_id, phone: '', role, guide_status }, access_token)
      // Навигация теперь управляется вызывающим кодом через registerAsync().then()
    },
  })

  // Получение профиля — НЕ грузим на auth-страницах, retry: false
  const { data: profileData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      try {
        const response = await usersApi.getMe()
        // Обновляем store с актуальными данными пользователя
        if (response?.data && token) {
          setAuth(response.data, token)
        }
        return response
      } catch (error: any) {
        // Если 401 — чистим состояние (interceptor чистит localStorage, мы чистим zustand)
        if (error?.response?.status === 401) {
          logoutStore()
        }
        return null
      }
    },
    enabled: isAuthenticated && !!token && !isAuthPage,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  // Выход
  const logout = () => {
    logoutStore()
    navigate('/login')
  }

  return {
    user: profileData?.data || user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}
