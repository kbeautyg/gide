import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Calendar, Wallet, TrendingUp } from 'lucide-react'
import { formatRUB } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

interface UnifiedDashboardProps {
  roleColor: string
  roleTitle: string
}

export default function UnifiedDashboard({ roleColor, roleTitle }: UnifiedDashboardProps) {
  const { user } = useAuthStore()

  // Мои экскурсии
  const { data: toursData } = useQuery({
    queryKey: ['my-tours'],
    queryFn: async () => {
      const response = await api.get('/tours/my')
      return response.data
    },
  })

  // Мои бронирования
  const { data: bookingsData } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings')
      return response.data
    },
  })

  const tours = toursData?.tours || []
  const activeTours = tours.filter((t: any) => t.active).length
  const bookings = bookingsData?.bookings || []
  const activeBookings = bookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'PENDING').length

  // Подсчёт дохода за последний месяц
  const lastMonthIncome = bookings
    .filter((b: any) => {
      const bookingDate = new Date(b.created_at)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return bookingDate >= monthAgo && b.payment_status === 'PAID'
    })
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${roleColor}`}>{roleTitle}</h1>
        <p className="text-gray-600 mt-1">Добро пожаловать, {user?.name || user?.phone}!</p>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className={`border-t-4 ${roleColor.replace('text-', 'border-t-')}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin size={18} className={roleColor} />
              Мои экскурсии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tours.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {activeTours} активных
            </p>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${roleColor.replace('text-', 'border-t-')}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar size={18} className={roleColor} />
              Бронирования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookings.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {activeBookings} активных
            </p>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${roleColor.replace('text-', 'border-t-')}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet size={18} className={roleColor} />
              Баланс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatRUB(user?.balance_rub || 0)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Доступно для вывода
            </p>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${roleColor.replace('text-', 'border-t-')}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={18} className={roleColor} />
              Доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatRUB(lastMonthIncome)}</div>
            <p className="text-xs text-gray-600 mt-1">
              За последний месяц
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Последние экскурсии */}
      <Card>
        <CardHeader>
          <CardTitle>Мои экскурсии</CardTitle>
          <CardDescription>Последние созданные экскурсии</CardDescription>
        </CardHeader>
        <CardContent>
          {tours.length > 0 ? (
            <div className="space-y-3">
              {tours.slice(0, 5).map((tour: any) => (
                <div key={tour.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold">{tour.title}</p>
                    <p className="text-sm text-gray-600">{tour.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatRUB(tour.price)}</p>
                    <p className="text-xs text-gray-500">{tour.duration}ч</p>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tour.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tour.active ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin size={48} className="mx-auto mb-3 opacity-30" />
              <p>У вас пока нет экскурсий</p>
              <p className="text-sm mt-1">Создайте свою первую экскурсию в разделе "Мои экскурсии"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Последние бронирования */}
      <Card>
        <CardHeader>
          <CardTitle>Последние бронирования</CardTitle>
          <CardDescription>Актуальные заказы на ваши экскурсии</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{booking.client_name}</p>
                    <p className="text-sm text-gray-600">{booking.client_phone}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {new Date(booking.date).toLocaleDateString('ru-RU')}
                    </p>
                    <p className="text-xs text-gray-500">{booking.participants_count} чел.</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold">{formatRUB(booking.total_price)}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status === 'CONFIRMED' ? 'Подтверждено' :
                       booking.status === 'PENDING' ? 'Ожидание' :
                       booking.status === 'CANCELLED' ? 'Отменено' :
                       booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-3 opacity-30" />
              <p>Бронирований пока нет</p>
              <p className="text-sm mt-1">Когда кто-то забронирует вашу экскурсию, информация появится здесь</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
