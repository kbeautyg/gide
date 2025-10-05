/**
 * Hook для работы с аутентификацией
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store'
import { authApi, usersApi } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

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

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout: logoutStore } = useAuthStore()
  const navigate = useNavigate()

  // Логин
  const loginMutation = useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authApi.login(normalizePhone(phone), password),
    onSuccess: (response) => {
      const { access_token, user_id, role } = response.data
      setAuth({ id: user_id, phone: '', role }, access_token)
      
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
      const { access_token, user_id, role } = response.data
      setAuth({ id: user_id, phone: '', role }, access_token)
      navigate('/dashboard')
    },
  })

  // Получение профиля
  const { data: profileData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => usersApi.getMe(),
    enabled: isAuthenticated && !!token,
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
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}
