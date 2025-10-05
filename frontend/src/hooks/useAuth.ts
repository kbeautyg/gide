/**
 * Hook для работы с аутентификацией
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store'
import { authApi, usersApi } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout: logoutStore } = useAuthStore()
  const navigate = useNavigate()

  // Логин
  const loginMutation = useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authApi.login(phone, password),
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
    }) => authApi.register(phone, email, password, name),
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
  }
}
