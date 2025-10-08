import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatRUB } from '@/lib/utils'

export default function FinancesPage() {
  const { user } = useAuthStore()

  // Загрузка бронирований (транзакций)
  const { data: bookingsData } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/')
      return response.data
    },
  })

  const bookings = bookingsData?.bookings || []

  // Сортируем по дате (новые первые)
  const sortedBookings = [...bookings].sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Статистика
  const totalRevenue = bookings
    .filter((b: any) => b.payment_status === 'paid')
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

  const pendingRevenue = bookings
    .filter((b: any) => b.payment_status === 'awaiting_payment')
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Финансы</h1>
          <p className="text-gray-600 mt-1">Управление балансами и транзакциями</p>
        </div>
        <Button className="gap-2" variant="tropical">
          <ArrowUpRight size={20} />
          Вывести средства
        </Button>
      </div>

      {/* Балансы */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Баланс RUB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatRUB(user?.balance_rub || 0)}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              Доступно для вывода
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Баланс USD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${(user?.balance_usd || 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">В иностранной валюте</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Баланс THB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ฿{(user?.balance_thb || 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Тайские баты</p>
          </CardContent>
        </Card>
      </div>

      {/* Статистика */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="text-green-600" size={24} />
              Получено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{formatRUB(totalRevenue)}</p>
            <p className="text-sm text-gray-600 mt-1">{bookings.filter((b: any) => b.payment_status === 'paid').length} оплаченных бронирований</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="text-orange-600" size={24} />
              В ожидании
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-600">{formatRUB(pendingRevenue)}</p>
            <p className="text-sm text-gray-600 mt-1">{bookings.filter((b: any) => b.payment_status === 'awaiting_payment').length} ожидают оплаты</p>
          </CardContent>
        </Card>
      </div>

      {/* Транзакции */}
      <Card>
        <CardHeader>
          <CardTitle>История транзакций</CardTitle>
          <CardDescription>Все ваши финансовые операции</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedBookings.length > 0 ? (
            <div className="space-y-3">
              {sortedBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      booking.payment_status === 'paid' 
                        ? 'bg-green-100' 
                        : booking.payment_status === 'awaiting_payment'
                        ? 'bg-orange-100'
                        : 'bg-red-100'
                    }`}>
                      {booking.payment_status === 'paid' ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : booking.payment_status === 'awaiting_payment' ? (
                        <Clock className="text-orange-600" size={24} />
                      ) : (
                        <ArrowUpRight className="text-red-600" size={24} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{booking.client_name}</p>
                      <p className="text-sm text-gray-600">{booking.client_phone}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString('ru-RU')} в {new Date(booking.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      booking.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      +{formatRUB(booking.total_price)}
                    </p>
                    <p className="text-xs text-gray-500">{booking.participants_count} чел.</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                      booking.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.payment_status === 'awaiting_payment'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.payment_status === 'paid' ? 'Оплачено' : 
                       booking.payment_status === 'awaiting_payment' ? 'Ожидание' : 
                       'Возврат'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Wallet size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Транзакций пока нет</p>
              <p className="text-sm">
                Создайте экскурсии и начните принимать оплаты. Все транзакции будут отображаться здесь.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Курсы валют */}
      <Card>
        <CardHeader>
          <CardTitle>Курсы валют</CardTitle>
          <CardDescription>Текущие курсы обмена (обновляются ежедневно)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border-2 rounded-lg p-4 hover:border-tropical-ocean transition-colors">
              <div className="text-sm text-gray-500 mb-1">USD → RUB</div>
              <div className="text-3xl font-bold text-blue-600">91.50</div>
              <div className="text-xs text-green-600 mt-1">↑ +0.5%</div>
            </div>
            <div className="border-2 rounded-lg p-4 hover:border-tropical-ocean transition-colors">
              <div className="text-sm text-gray-500 mb-1">THB → RUB</div>
              <div className="text-3xl font-bold text-purple-600">2.70</div>
              <div className="text-xs text-red-600 mt-1">↓ -0.3%</div>
            </div>
            <div className="border-2 rounded-lg p-4 hover:border-tropical-ocean transition-colors">
              <div className="text-sm text-gray-500 mb-1">EUR → RUB</div>
              <div className="text-3xl font-bold text-green-600">99.50</div>
              <div className="text-xs text-green-600 mt-1">↑ +1.2%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}