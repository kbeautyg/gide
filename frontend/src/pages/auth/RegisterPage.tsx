import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/lib/toast'

type RegisterRole = 'client' | 'guide'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role') as RegisterRole | null
  const role: RegisterRole = roleFromUrl === 'guide' ? 'guide' : 'client'
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })
  const { registerAsync, isRegistering } = useAuth()
  const navigate = useNavigate()
  const [registerError, setRegisterError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')
    
    if (formData.password !== formData.passwordConfirm) {
      setRegisterError('Пароли не совпадают')
      return
    }
    
    if (formData.password.length < 6) {
      setRegisterError('Пароль должен быть минимум 6 символов')
      return
    }
    
    try {
      await registerAsync({
        phone: formData.phone,
        email: formData.email || null,
        password: formData.password,
        name: formData.name || null,
      })
      
      // Если регистрировался как гид, перенаправляем на страницу подачи заявки
      if (role === 'guide') {
        navigate('/become-guide')
      } else {
        navigate('/dashboard')
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail || ''
      if (detail.includes('уже существует') || detail.includes('already exists') || error?.response?.status === 400) {
        setRegisterError('Этот номер телефона уже зарегистрирован. Попробуйте войти.')
      } else {
        setRegisterError(detail || 'Ошибка регистрации. Попробуйте ещё раз.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="text-3xl font-bold text-[#FF385C] mb-2 inline-block">
            In Turex Pro
          </Link>
          <CardTitle>
            {role === 'guide' ? 'Регистрация гида' : 'Регистрация'}
          </CardTitle>
          <CardDescription>
            {role === 'guide' 
              ? 'Создайте аккаунт, чтобы начать работать как гид' 
              : 'Создайте аккаунт, чтобы продолжить'}
          </CardDescription>
        </CardHeader>

        {/* Tabs: Login / Register Switch */}
        <div className="px-6 mb-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => navigate(`/login?role=${role}`)}
                className="flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all text-gray-500 hover:text-gray-900"
              >
                Вход
              </button>
              <button
                className="flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all bg-white text-gray-900 shadow-sm"
              >
                Регистрация {role === 'guide' && '(Гид)'}
              </button>
            </div>
          </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {registerError && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                <strong>Ошибка:</strong> {registerError}
              </div>
            )}
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ваше имя"
                autoComplete="name"
                className="mt-1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 999-99-99"
                autoComplete="tel"
                className="mt-1"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email (необязательно)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                className="mt-1"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
                className="mt-1"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password-confirm">Подтвердите пароль</Label>
              <Input
                id="password-confirm"
                type="password"
                placeholder="Повторите пароль"
                autoComplete="new-password"
                className="mt-1"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                required
              />
            </div>
            <Button 
              type="submit"
              variant="tropical" 
              className="w-full" 
              size="lg"
              disabled={isRegistering}
            >
              {isRegistering ? 'Регистрация...' : role === 'guide' ? 'Продолжить как Гид' : 'Зарегистрироваться'}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center">
            <Link to="/" className="text-gray-600 hover:text-[#FF385C]">
              ← Вернуться на главную
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
