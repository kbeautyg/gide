import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateTourDialog } from '@/components/CreateTourDialog'
import { MapPin, Calendar, Wallet, TrendingUp } from 'lucide-react'
import { api, toursApi } from '@/lib/api'

export default function ManagerDashboard() {
  // Загрузка профиля для баланса
  const { data: profileData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await api.get('/users/me')
      return response.data
    },
  })

  // Загрузка экскурсий менеджера
  const { data: toursData } = useQuery({
    queryKey: ['tours', 'my'],
    queryFn: () => toursApi.getList(),
  })

  // Загрузка бронирований (нужен API эндпоинт)
  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: async () => {
      // TODO: создать эндпоинт /bookings/my
      return []
    },
  })

  const myToursCount = toursData?.data?.tours?.length || 0
  const bookingsCount = Array.isArray(bookingsData) ? bookingsData.length : 0
  const balance = profileData?.balance_rub || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Дашборд Менеджера</h1>
          <p className="text-gray-600 mt-1">Управление экскурсиями и бронированиями</p>
        </div>
        <CreateTourDialog />
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
              <MapPin size={18} />
              Мои экскурсии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{myToursCount}</p>
            <p className="text-xs text-gray-500 mt-1">Активных экскурсий</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
              <Calendar size={18} />
              Бронирования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bookingsCount}</p>
            <p className="text-xs text-gray-500 mt-1">Активных броней</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <Wallet size={18} />
              Баланс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{balance.toFixed(0)} ₽</p>
            <p className="text-xs text-gray-500 mt-1">Доступно для вывода</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
              <TrendingUp size={18} />
              Доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0 ₽</p>
            <p className="text-xs text-gray-500 mt-1">За последний месяц</p>
          </CardContent>
        </Card>
      </div>

      {/* Последние бронирования */}
      <Card>
        <CardHeader>
          <CardTitle>Последние бронирования</CardTitle>
          <CardDescription>Новые заказы на ваши экскурсии</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsCount > 0 ? (
            <div className="space-y-3">
              {/* TODO: отобразить список бронирований */}
              <p className="text-sm text-gray-500">Бронирования загружаются...</p>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Пока нет бронирований. Создайте экскурсию чтобы начать принимать заказы!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Быстрые действия */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-orange-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-orange-600">Мои экскурсии</CardTitle>
            <CardDescription>Управление вашими экскурсиями</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Просмотрите, редактируйте и управляйте всеми вашими экскурсиями
            </p>
            <a href="/dashboard/my-tours" className="text-orange-600 hover:underline font-medium">
              Перейти к экскурсиям →
            </a>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-blue-600">Бронирования</CardTitle>
            <CardDescription>Управление заказами</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Просмотрите все бронирования и управляйте заказами
            </p>
            <a href="/dashboard/bookings" className="text-blue-600 hover:underline font-medium">
              Перейти к бронированиям →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
