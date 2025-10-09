import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, CreditCard, TrendingUp, Users, CheckCircle, ArrowUpRight, DollarSign } from 'lucide-react'
import { formatRUB } from '@/lib/utils'
import { api, toursApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function ManagerDashboard() {
  const { user } = useAuthStore()

  // Загрузка моих экскурсий
  const { data: toursData } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList({ include_private: true }),
  })

  // Загрузка бронирований
  const { data: bookingsData } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/')
      return response.data
    },
  })

  // Загрузка статистики доходов (для графика)
  const { data: revenueStatsData } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: async () => {
      const response = await api.get('/bookings/revenue-stats?days=14')
      return response.data
    },
  })

  const tours = toursData?.data?.tours || []
  const bookings = bookingsData?.bookings || []
  const revenueStats = revenueStatsData || []
  
  // Статистика
  const activeTours = tours.filter((t: any) => t.active !== false).length
  const thisMonthBookings = bookings.filter((b: any) => {
    const bookingDate = new Date(b.created_at)
    const now = new Date()
    return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear()
  }).length

  // Доход за месяц (3% комиссия гида от стоимости)
  const monthlyIncome = bookings
    .filter((b: any) => {
      const bookingDate = new Date(b.created_at)
      const now = new Date()
      return bookingDate.getMonth() === now.getMonth() && 
             bookingDate.getFullYear() === now.getFullYear() &&
             b.payment_status === 'paid'
    })
    .reduce((sum: number, b: any) => sum + ((b.total_price || 0) * 0.03), 0)  // 3% комиссия

  // Оборот за месяц (полная стоимость)
  const monthlyTurnover = bookings
    .filter((b: any) => {
      const bookingDate = new Date(b.created_at)
      const now = new Date()
      return bookingDate.getMonth() === now.getMonth() && 
             bookingDate.getFullYear() === now.getFullYear() &&
             b.payment_status === 'paid'
    })
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

  // Средний чек
  const averageCheck = thisMonthBookings > 0 ? monthlyTurnover / thisMonthBookings : 0

  // График доходов - 3% комиссия гида от выручки
  const revenueData = revenueStats.length > 0 
    ? revenueStats.map((stat: any) => (stat.revenue || 0) * 0.03)
    : Array(14).fill(0)

  // Последние заказы (последние 3)
  const recentBookings = bookings.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-airbnb-rausch rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0] || user?.phone?.[0] || 'Г'}
            </div>
            <div>
              <p className="text-2xl font-bold">{user?.name || 'Гид'}</p>
              <p className="text-white/90">
                {user?.role === 'admin' ? 'Администратор' : 'Гид'} • ThaiGuide Pro
              </p>
            </div>
          </div>
          <div className="text-right space-y-3">
            <p className="text-white/90 text-sm mb-1">Доход за месяц (3% комиссия)</p>
            <p className="text-3xl font-bold">{formatRUB(monthlyIncome)}</p>
            <Button
              className="gap-2 bg-white text-tropical-ocean hover:bg-white/90"
              onClick={() => alert('Заявка на вывод средств отправлена менеджеру.')}>
              <ArrowUpRight size={18} />
              Вывести средства
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <Card className="border-blue-300 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Оборот сделок</span>
              <DollarSign size={32} className="text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-500">{formatRUB(monthlyIncome / 0.03)}</p>
            <p className="text-xs text-gray-500 mt-1">Полная стоимость</p>
          </CardContent>
        </Card>

        <Card className="border-airbnb-rausch/30 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Ваш доход (3%)</span>
              <TrendingUp size={32} className="text-airbnb-rausch" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-airbnb-rausch">{formatRUB(monthlyIncome)}</p>
            <p className="text-xs text-gray-500 mt-1">Комиссия от оборота</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>График доходов (3% комиссия)</CardTitle>
          <CardDescription>За последние 30 дней • Ваш доход от бронирований</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 gap-2">
            {revenueData.map((revenue: number, i: number) => {
              const maxRevenue = Math.max(...revenueData, 1)
              const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
              
              return (
                <div
                  key={i}
                  className="flex-1 bg-airbnb-rausch rounded-t-lg relative group cursor-pointer"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {formatRUB(revenue)}
                  </div>
                </div>
              )
            })}
          </div>
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