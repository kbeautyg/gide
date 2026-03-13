import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, CreditCard, TrendingUp, ArrowUpRight, DollarSign, Plus, Calendar as CalendarIcon, FileText, Users } from 'lucide-react'
import { formatRUB } from '@/lib/utils'
import { api, toursApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Link } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { CreateTourDialog } from '@/components/CreateTourDialog'

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

  // График доходов
  const revenueData = revenueStats.length > 0 
    ? revenueStats.map((stat: any) => (stat.revenue || 0) * 0.03)
    : Array(14).fill(0)

  // Предстоящие экскурсии (ближайшие бронирования)
  const upcomingBookings = bookings
    .filter((b: any) => new Date(b.date) >= new Date())
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
              {user?.name?.[0] || user?.phone?.[0] || 'Г'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || 'Гид'}</h1>
              <p className="text-emerald-100 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                In Turex Pro • {user?.role === 'admin' ? 'Администратор' : 'Гид'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
             <div className="text-right">
                <p className="text-emerald-100 text-sm">Баланс (3%)</p>
                <p className="text-2xl font-bold">{formatRUB(monthlyIncome)}</p>
             </div>
             <Button
              className="bg-white text-emerald-600 hover:bg-emerald-50 w-full sm:w-auto gap-2 font-medium"
              onClick={() => toast.success('Заявка на вывод средств отправлена', 'Администратор обработает запрос в течение 24 часов')}>
              <ArrowUpRight size={18} />
              Вывести средства
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-100 hover:border-slate-200 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              Активные туры
              <MapPin size={16} className="text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeTours}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 hover:border-slate-200 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              Заказы (мес)
              <CreditCard size={16} className="text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{thisMonthBookings}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 hover:border-slate-200 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              Оборот
              <DollarSign size={16} className="text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatRUB(monthlyTurnover)}</div>
            <p className="text-xs text-slate-400 mt-1">Полная стоимость</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 hover:border-slate-200 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              Доход
              <TrendingUp size={16} className="text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatRUB(monthlyIncome)}</div>
            <p className="text-xs text-slate-400 mt-1">Ваша комиссия</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
           {/* Quick Actions */}
           <div className="grid sm:grid-cols-2 gap-4">
              <CreateTourDialog>
                <Button className="w-full h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white text-slate-700 border hover:bg-slate-50 hover:border-emerald-200 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={24} className="text-emerald-600" />
                    </div>
                    <span className="font-medium">Добавить экскурсию</span>
                </Button>
              </CreateTourDialog>
              <Link to="/dashboard/requests">
                <Button className="w-full h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white text-slate-700 border hover:bg-slate-50 hover:border-blue-200 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText size={24} className="text-blue-600" />
                    </div>
                    <span className="font-medium">Обработать заявки</span>
                </Button>
              </Link>
           </div>

           {/* Upcoming Tours */}
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon size={20} className="text-emerald-600" />
                    Ближайшие экскурсии
                </CardTitle>
            </CardHeader>
            <CardContent>
                {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingBookings.map((booking: any) => (
                            <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:border-emerald-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded border text-center">
                                        <span className="text-xs text-slate-500 font-medium uppercase">
                                            {new Date(booking.date).toLocaleDateString('ru-RU', { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-bold text-slate-900 leading-none">
                                            {new Date(booking.date).getDate()}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">{booking.tour_title || 'Экскурсия'}</h4>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {booking.participants_count} чел.
                                            </span>
                                            <span>•</span>
                                            <span>{booking.client_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-emerald-600">{formatRUB(booking.total_price)}</div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        booking.payment_status === 'paid' 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {booking.payment_status === 'paid' ? 'Оплачено' : 'Ожидает'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        <CalendarIcon size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Нет предстоящих экскурсий</p>
                    </div>
                )}
            </CardContent>
           </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            {/* Revenue Chart Mini */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Динамика дохода</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between h-32 gap-1 mt-2">
                        {revenueData.map((revenue: number, i: number) => {
                            const maxRevenue = Math.max(...revenueData, 1)
                            const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
                            
                            return (
                                <div
                                key={i}
                                className="flex-1 bg-emerald-100 hover:bg-emerald-200 rounded-t transition-colors relative group"
                                style={{ height: `${Math.max(heightPercent, 5)}%` }}
                                >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                    {formatRUB(revenue)}
                                </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
                <CardHeader>
                    <CardTitle className="text-lg">Pro Совет</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-300 text-sm mb-4">
                        Добавьте качественные фото в ваши экскурсии, чтобы повысить конверсию в заказы на 40%.
                    </p>
                    <Link to="/faq">
                    <Button variant="outline" className="w-full border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white">
                        Читать гайд
                    </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
