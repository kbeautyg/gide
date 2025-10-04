import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/store'
import { authAPI } from '@/lib/api'

const loginSchema = z.object({
  phone: z.string().min(11, 'Введите корректный номер телефона'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await authAPI.login(data.phone, data.password)
      const { user, access_token } = response.data
      
      setAuth(user, access_token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">FastChange 3.0</CardTitle>
          <CardDescription>
            Вход в систему обмена валюты
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Телефон</label>
              <Input
                {...register('phone')}
                type="tel"
                placeholder="+79991234567"
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input
                {...register('password')}
                type="password"
                placeholder="Введите пароль"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Тестовый доступ:</p>
            <p>Админ: +79177445182 / password123</p>
            <p>Менеджер: +79111111111 / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
