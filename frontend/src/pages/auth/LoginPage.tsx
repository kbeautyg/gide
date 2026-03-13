import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { User, MapPin, ArrowLeft } from 'lucide-react'

type LoginView = 'selection' | 'login'
type LoginIntent = 'client' | 'guide'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role') as LoginIntent | null
  
  // Если пришли с ?role=client или ?role=guide — сразу показываем форму входа
  const [view, setView] = useState<LoginView>(roleFromUrl ? 'login' : 'selection')
  const [intent, setIntent] = useState<LoginIntent>(roleFromUrl || 'client')
  
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  
  // Используем useAuth с preventRedirect, так как мы сами управляем навигацией
  const { loginAsync, isLoggingIn, loginError } = useAuth({ preventRedirect: true })
  const navigate = useNavigate()

  const handleSelection = (selectedIntent: LoginIntent) => {
    setIntent(selectedIntent)
    setView('login')
  }

  const handleBack = () => {
    setView('selection')
    setPhone('')
    setPassword('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await loginAsync({ phone, password })
      const { role, guide_status } = response.data
      
      if (intent === 'client') {
        // Логика для клиента: просто входим
        navigate('/dashboard')
      } else {
        // Логика для гида
        if (role === 'manager' || role === 'admin' || role === 'super_admin') {
          // Уже гид/админ - пускаем
          navigate('/dashboard/manager')
        } else {
          // Роль client, проверяем статус заявки
          if (guide_status === 'pending') {
            navigate('/dashboard?guide_status=pending')
          } else if (guide_status === 'approved') {
             navigate('/dashboard/manager')
          } else if (guide_status === 'rejected') {
            navigate('/dashboard?guide_status=rejected')
          } else {
            // guide_status === 'none'
            navigate('/become-guide') 
          }
        }
      }
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      {view === 'selection' ? (
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <Link to="/" className="text-4xl font-bold text-[#FF385C] mb-4 inline-block">
              In Turex Pro
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Добро пожаловать</h1>
            <p className="text-gray-600 mt-2">Выберите, как вы хотите войти в систему</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Карточка Клиента */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelection('client')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelection('client') } }}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-gray-200 cursor-pointer transition-all flex flex-col items-center text-center hover:border-tropical-ocean/50 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User size={40} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Я Турист</h3>
              <p className="text-gray-500 mb-6">
                Хочу найти интересные экскурсии, забронировать тур и получить яркие впечатления
              </p>
              <Button variant="outline" className="w-full mt-auto group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200">
                Войти как турист
              </Button>
            </div>

            {/* Карточка Гида */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelection('guide')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelection('guide') } }}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-gray-200 cursor-pointer transition-all flex flex-col items-center text-center hover:border-tropical-ocean/50 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
            >
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin size={40} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Я Гид</h3>
              <p className="text-gray-500 mb-6">
                Хочу создавать авторские туры, находить клиентов и зарабатывать на любимом деле
              </p>
              <Button variant="outline" className="w-full mt-auto group-hover:bg-orange-50 group-hover:text-orange-700 group-hover:border-orange-200">
                Войти как гид
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center relative">
            <button
              onClick={handleBack}
              aria-label="Назад к выбору роли"
              className="absolute left-6 top-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <Link to="/" className="text-2xl font-bold text-[#FF385C] mb-2 inline-block">
              In Turex Pro
            </Link>
            <CardTitle>
              {intent === 'client' ? 'Вход для туриста' : 'Вход для гида'}
            </CardTitle>
            <CardDescription>
              Введите номер телефона и пароль
            </CardDescription>
          </CardHeader>
          
          {/* Tabs: Login / Register Switch */}
          <div className="px-6 mb-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                className="flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all bg-white text-gray-900 shadow-sm"
              >
                Вход
              </button>
              <button
                onClick={() => navigate(`/register?role=${intent}`)}
                className="flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all text-gray-500 hover:text-gray-900"
              >
                Регистрация
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {loginError && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                  <strong>Ошибка входа:</strong> Неверный телефон или пароль
                </div>
              )}
              <div>
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="79991234567"
                  autoComplete="tel"
                  className="mt-1"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit"
                variant="tropical" 
                className="w-full" 
                size="lg"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Вход...' : 'Войти'}
              </Button>
            </CardContent>
          </form>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-sm text-center text-gray-500">
              <Link to="/" className="hover:text-gray-900 transition-colors">
                ← На главную
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
