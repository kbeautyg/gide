import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPhone } from '@/lib/utils'
import { LogOut, User } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FastChange 3.0</h1>
            <p className="text-sm text-gray-600">Обмен валюты и экскурсии</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                Добро пожаловать!
              </CardTitle>
              <CardDescription>
                Вы успешно вошли в систему FastChange 3.0
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Имя:</span>
                  <span className="font-semibold">{user?.full_name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Телефон:</span>
                  <span className="font-semibold">{formatPhone(user?.phone || '')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Роль:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user?.role === 'admin' && 'Администратор'}
                    {user?.role === 'manager' && 'Менеджер'}
                    {user?.role === 'client' && 'Клиент'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Транзакций</CardDescription>
                <CardTitle className="text-4xl">0</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Оборот</CardDescription>
                <CardTitle className="text-4xl">0 ₽</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Комиссия</CardDescription>
                <CardTitle className="text-4xl">0 ₽</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Coming Soon */}
          <Card>
            <CardHeader>
              <CardTitle>🚀 В разработке</CardTitle>
              <CardDescription>
                Следующие функции будут добавлены в ближайшее время
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Создание платежных ссылок</li>
                <li>✅ Статистика по транзакциям</li>
                <li>✅ Маркетплейс экскурсий</li>
                <li>✅ Система бронирования</li>
                <li>✅ Интеграция с Supabase</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
