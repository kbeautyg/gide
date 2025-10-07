import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, CreditCard, TrendingUp, Users, CheckCircle } from 'lucide-react'
import { formatRUB } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function ManagerDashboard() {
  const { user } = useAuthStore()

  // Загрузка статистики гида
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['guide-stats'],
    queryFn: async () => {
      const response = await api.get('/guide-stats/dashboard')
      return response.data
    },
  })

  const stats = statsData || {}
  
  // Статистика
  const activeTours = stats.active_tours || 0
  const thisMonthBookings = stats.monthly_bookings || 0
  const monthlyIncome = stats.monthly_income || 0

  // График доходов (реальные данные за последние 30 дней)
  const revenueChartData = stats.revenue_chart || []
  const maxRevenue = revenueChartData.length > 0 
    ? Math.max(...revenueChartData.map((d: any) => d.income), 1)
    : 1
  
  // Последние заказы
  const recentBookings = stats.recent_bookings || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-tropical-ocean to-tropical-turquoise rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0] || user?.phone?.[0] || 'Г'}
            </div>
            <div>
              <p className="text-2xl font-bold">{user?.name || 'Гид'}</p>
              <p className="text-white/90">Гид • ThaiGuide Pro</p>
            </div>
          </div>
          <div>
            <p className="text-white/90 text-sm mb-1">Доход за месяц</p>
            <p className="text-3xl font-bold">{formatRUB(monthlyIncome)}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Активных экскурсий</span>
              <MapPin size={32} className="text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{activeTours}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Заказов за месяц</span>
              <CreditCard size={32} className="text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{thisMonthBookings}</p>
          </CardContent>
        </Card>

        <Card className="border-tropical-ocean hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Доход</span>
              <TrendingUp size={32} className="text-tropical-ocean" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-tropical-ocean">{formatRUB(monthlyIncome)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>График доходов</CardTitle>
          <CardDescription>За последние 30 дней</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tropical-ocean"></div>
            </div>
          ) : revenueChartData.length > 0 ? (
            <div className="flex items-end justify-between h-48 gap-1">
              {revenueChartData.slice(-30).map((day: any, i: number) => {
                const height = (day.income / maxRevenue) * 100
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-tropical-ocean to-tropical-turquoise rounded-t-lg relative group cursor-pointer"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {formatRUB(day.income)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <div className="text-center">
                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                <p>Нет данных о доходах</p>
                <p className="text-sm">Создайте экскурсии и начните принимать оплаты</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Последние заказы</span>
            <span className="text-sm font-normal text-green-600 flex items-center gap-1">
              <CheckCircle size={16} />
              Все оплачены
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-tropical-ocean/10 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-tropical-ocean" />
                    </div>
                    <div>
                      <p className="font-semibold">{booking.client_name || 'Клиент'}</p>
                      <p className="text-sm text-gray-600">{booking.client_phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-tropical-ocean">{formatRUB(booking.total_price)}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} />
                      {booking.payment_status === 'paid' ? 'Оплачено' : 'В ожидании'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard size={48} className="mx-auto mb-3 opacity-50" />
              <p>Пока нет заказов</p>
              <p className="text-sm mt-2">Создайте экскурсии и начните принимать бронирования</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}