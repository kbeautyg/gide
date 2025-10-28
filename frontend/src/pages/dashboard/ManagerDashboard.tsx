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

  // Оборот за месяц (полная стоимость) - используется в карточке
  const monthlyTurnover = bookings
    .filter((b: any) => {
      const bookingDate = new Date(b.created_at)
      const now = new Date()
      return bookingDate.getMonth() === now.getMonth() && 
             bookingDate.getFullYear() === now.getFullYear() &&
             b.payment_status === 'paid'
    })
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

  // График доходов - 3% комиссия гида от выручки
  const revenueData = revenueStats.length > 0 
    ? revenueStats.map((stat: any) => (stat.revenue || 0) * 0.03)
    : Array(14).fill(0)

  // Последние заказы (последние 3)
  const recentBookings = bookings.slice(0, 3)

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="bg-airbnb-rausch rounded-xl p-4 sm:p-6 text-white shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0">
              {user?.name?.[0] || user?.phone?.[0] || 'Г'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{user?.name || 'Гид'}</p>
              <p className="text-xs sm:text-sm text-white/90 truncate">
                {user?.role === 'admin' ? 'Администратор' : 'Гид'} • ThaiGuide Pro
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto sm:text-right space-y-2 sm:space-y-3 min-w-0">
            <p className="text-white/90 text-xs sm:text-sm truncate">Доход за месяц (3% комиссия)</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{formatRUB(monthlyIncome)}</p>
            <Button
              className="gap-2 bg-white text-tropical-ocean hover:bg-white/90 w-full sm:w-auto text-sm sm:text-base"
              onClick={() => alert('Заявка на вывод средств отправлена менеджеру.')}>
              <ArrowUpRight size={16} className="sm:w-[18px] sm:h-[18px]" />
              Вывести средства
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="border-green-200 hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-between gap-1">
              <span className="truncate">Активных экскурсий</span>
              <MapPin size={20} className="text-green-600 flex-shrink-0 sm:w-6 sm:h-6" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 break-words">{activeTours}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-between gap-1">
              <span className="truncate">Заказов за месяц</span>
              <CreditCard size={20} className="text-blue-600 flex-shrink-0 sm:w-6 sm:h-6" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 break-words">{thisMonthBookings}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-300 hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-between gap-1">
              <span className="truncate">Оборот сделок</span>
              <DollarSign size={20} className="text-blue-500 flex-shrink-0 sm:w-6 sm:h-6" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-500 break-words leading-tight">{formatRUB(monthlyTurnover)}</p>
            <p className="text-xs text-gray-500 mt-1">Полная стоимость</p>
          </CardContent>
        </Card>

        <Card className="border-airbnb-rausch/30 hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-between gap-1">
              <span className="truncate">Ваш доход (3%)</span>
              <TrendingUp size={20} className="text-airbnb-rausch flex-shrink-0 sm:w-6 sm:h-6" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-6">
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-airbnb-rausch break-words leading-tight">{formatRUB(monthlyIncome)}</p>
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
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors overflow-hidden">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tropical-ocean/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={18} className="text-tropical-ocean sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate text-sm sm:text-base">{booking.client_name || 'Клиент'}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.client_phone}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="font-bold text-tropical-ocean text-sm sm:text-base break-words">{formatRUB(booking.total_price)}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} className="flex-shrink-0" />
                      <span className="truncate">{booking.payment_status === 'paid' ? 'Оплачено' : 'В ожидании'}</span>
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