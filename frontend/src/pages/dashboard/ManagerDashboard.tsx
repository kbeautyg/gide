import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, CreditCard, TrendingUp, Users, CheckCircle, ArrowUpRight } from 'lucide-react'
import { formatRUB } from '@/lib/utils'
import { api, toursApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function ManagerDashboard() {
  const { user } = useAuthStore()

  // Загрузка моих экскурсий
  const { data: toursData } = useQuery({
    queryKey: ['tours', 'mine'],
    queryFn: () => toursApi.getMine(),
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

  // Доход за месяц (реальный из бронирований)
  const monthlyIncome = bookings
    .filter((b: any) => {
      const bookingDate = new Date(b.created_at)
      const now = new Date()
      return bookingDate.getMonth() === now.getMonth() && 
             bookingDate.getFullYear() === now.getFullYear() &&
             b.payment_status === 'paid'
    })
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

  // График доходов - реальные данные из API или нули
  const revenueData = revenueStats.length > 0 
    ? revenueStats.map((stat: any) => stat.revenue)
    : Array(14).fill(0)

  // Последние заказы (последние 3)
  const recentBookings = bookings.slice(0, 3)

  return (
    <div className="space-y-4 md:space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-tropical-ocean to-tropical-turquoise rounded-xl p-4 md:p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0">
              {user?.name?.[0] || user?.phone?.[0] || 'Г'}
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{user?.name || 'Гид'}</p>
              <p className="text-white/90 text-sm md:text-base">Гид • ThaiGuide Pro</p>
            </div>
          </div>
          <div className="text-left md:text-right space-y-2 md:space-y-3">
            <p className="text-white/90 text-xs md:text-sm">Доход за месяц</p>
            <p className="text-2xl md:text-3xl font-bold">{formatRUB(monthlyIncome)}</p>
            <Button
              className="gap-2 bg-white text-tropical-ocean hover:bg-white/90 w-full md:w-auto"
              onClick={() => alert('Заявка на вывод средств отправлена менеджеру.')}>
              <ArrowUpRight size={18} />
              Вывести средства
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Активных экскурсий</span>
              <MapPin size={24} className="text-green-600 md:w-8 md:h-8" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl md:text-4xl font-bold text-green-600">{activeTours}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Заказов за месяц</span>
              <CreditCard size={24} className="text-blue-600 md:w-8 md:h-8" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl md:text-4xl font-bold text-blue-600">{thisMonthBookings}</p>
          </CardContent>
        </Card>

        <Card className="border-tropical-ocean hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Доход</span>
              <TrendingUp size={24} className="text-tropical-ocean md:w-8 md:h-8" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl md:text-4xl font-bold text-tropical-ocean">{formatRUB(monthlyIncome)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl">График доходов</CardTitle>
          <CardDescription className="text-xs md:text-sm">За последние 14 дней</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 md:h-48 gap-1 md:gap-2">
            {revenueData.map((revenue: number, i: number) => {
              const maxRevenue = Math.max(...revenueData, 1)
              const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
              
              return (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-tropical-ocean to-tropical-turquoise rounded-t-lg relative group cursor-pointer min-w-[4px]"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                >
                  <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] md:text-xs px-1 md:px-2 py-0.5 md:py-1 rounded whitespace-nowrap z-10">
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
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-base md:text-lg">
            <span>Последние заказы</span>
            <span className="text-xs md:text-sm font-normal text-green-600 flex items-center gap-1">
              <CheckCircle size={14} />
              Все оплачены
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {recentBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-tropical-ocean/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={18} className="text-tropical-ocean md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm md:text-base truncate">{booking.client_name || 'Клиент'}</p>
                      <p className="text-xs md:text-sm text-gray-600">{booking.client_phone}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-tropical-ocean text-sm md:text-base">{formatRUB(booking.total_price)}</p>
                    <p className="text-[10px] md:text-xs text-green-600 flex items-center gap-1 justify-end">
                      <CheckCircle size={10} className="md:w-3 md:h-3" />
                      {booking.payment_status === 'paid' ? 'Оплачено' : 'В ожидании'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8 text-gray-500">
              <CreditCard size={40} className="mx-auto mb-2 md:mb-3 opacity-50 md:w-12 md:h-12" />
              <p className="text-sm md:text-base">Пока нет заказов</p>
              <p className="text-xs md:text-sm mt-1 md:mt-2">Создайте экскурсии и начните принимать бронирования</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}