import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Users, Phone, Mail, CreditCard, CheckCircle, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function BookingsPage() {
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/')
      return response.data
    },
  })

  const bookings = bookingsData?.bookings || []
  const totalBookings = bookingsData?.total || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'awaiting_payment':
        return 'bg-orange-100 text-orange-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusName = (status: string) => {
    const names: Record<string, string> = {
      pending: 'В ожидании',
      confirmed: 'Подтверждено',
      cancelled: 'Отменено',
      completed: 'Завершено',
    }
    return names[status] || status
  }

  const getPaymentStatusName = (status: string) => {
    const names: Record<string, string> = {
      awaiting_payment: 'Ожидает оплаты',
      paid: 'Оплачено',
      refunded: 'Возврат',
    }
    return names[status] || status
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-tropical-ocean">Бронирования</h1>
        <p className="text-gray-600 mt-1">Управление заказами и бронированиями</p>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-t-4 border-t-tropical-ocean">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-tropical-ocean">
              <Calendar size={18} />
              Всего бронирований
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalBookings}</p>
            <p className="text-xs text-gray-500 mt-1">За всё время</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <CheckCircle size={18} />
              Оплачено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter((b: any) => b.payment_status === 'paid').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Подтверждённых</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
              <Clock size={18} />
              В ожидании
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {bookings.filter((b: any) => b.payment_status === 'awaiting_payment').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ожидают оплаты</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-600">
              <CreditCard size={18} />
              Общая сумма
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {formatRUB(bookings.reduce((sum: number, b: any) => sum + b.total_price, 0))}
            </p>
            <p className="text-xs text-gray-500 mt-1">За всё время</p>
          </CardContent>
        </Card>
      </div>

      {/* Список бронирований */}
      <Card>
        <CardHeader>
          <CardTitle>Список бронирований</CardTitle>
          <CardDescription>Все ваши заказы и их статусы</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tropical-ocean mx-auto mb-4"></div>
              <p>Загрузка бронирований...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>Бронирований пока нет</p>
              <p className="text-sm mt-2">После тестовой оплаты здесь появятся записи</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="border-2 rounded-lg p-4 hover:border-tropical-ocean transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{booking.tour_title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {getStatusName(booking.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                          {getPaymentStatusName(booking.payment_status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {booking.tour_location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(booking.date).toLocaleDateString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {booking.participants_count} чел.
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-tropical-ocean">
                        {formatRUB(booking.total_price)}
                      </p>
                      <p className="text-xs text-gray-500">ID: #{booking.id}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-semibold mb-2">Клиент:</p>
                        <div className="space-y-1 text-gray-700">
                          <p className="flex items-center gap-2">
                            <Users size={14} />
                            {booking.client_name}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone size={14} />
                            {booking.client_phone}
                          </p>
                          {booking.client_email && (
                            <p className="flex items-center gap-2">
                              <Mail size={14} />
                              {booking.client_email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold mb-2">Гид:</p>
                        <div className="space-y-1 text-gray-700">
                          <p>{booking.guide_name}</p>
                          <p className="text-xs text-gray-500">
                            Создано: {new Date(booking.created_at).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}