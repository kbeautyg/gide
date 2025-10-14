import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Calendar, 
  User, 
  Phone, 
  Mail,
  Clock,
  Users,
  Eye,
  MessageCircle,
  ExternalLink
} from 'lucide-react'
import { api, toursApi } from '@/lib/api'

export default function BookingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTourId, setFilterTourId] = useState<string>('all')
  
  // Загрузка туров для фильтра
  const { data: toursData } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList({ include_private: true }),
  })
  
  const tours = toursData?.data?.tours || []
  
  // Применяем фильтр из URL
  useEffect(() => {
    const tourId = searchParams.get('tour_id')
    if (tourId) {
      setFilterTourId(tourId)
    }
  }, [searchParams])
  
  // Загрузка бронирований
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings/').then(res => res.data),
  })

  const bookings = bookingsData?.bookings || []

  // Фильтрация
  let filteredBookings = bookings
  
  if (filterStatus !== 'all') {
    filteredBookings = filteredBookings.filter((b: any) => b.payment_status === filterStatus)
  }
  
  if (filterTourId !== 'all') {
    filteredBookings = filteredBookings.filter((b: any) => b.tour_id === parseInt(filterTourId))
  }

  // Подсчёт оборота и дохода
  const totalTurnover = filteredBookings
    .filter((b: any) => b.payment_status === 'paid')
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
  
  const totalIncome = totalTurnover * 0.03

  const formatRUB = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Оплачено' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Ожидает' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Отменено' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Возврат' },
    }
    const badge = badges[status as keyof typeof badges] || badges.pending
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
          <p className="text-gray-600">Транзакции клиентов и детальная информация</p>
        </div>

        {/* Статистика */}
        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-600">Оборот</div>
            <div className="text-2xl font-bold text-blue-600">{formatRUB(totalTurnover)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Ваш доход (3%)</div>
            <div className="text-2xl font-bold text-airbnb-rausch">{formatRUB(totalIncome)}</div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="space-y-3">
        {/* Фильтр по статусу */}
        <div className="flex gap-3 flex-wrap">
          {[
            { value: 'all', label: 'Все' },
            { value: 'paid', label: 'Оплачено' },
            { value: 'pending', label: 'Ожидает' },
            { value: 'cancelled', label: 'Отменено' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === filter.value
                  ? 'bg-airbnb-rausch text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-900'
              }`}
            >
              {filter.label}
              <span className="ml-2 text-xs opacity-75">
                ({filter.value === 'all' ? bookings.length : bookings.filter((b: any) => b.payment_status === filter.value).length})
              </span>
            </button>
          ))}
        </div>

        {/* Фильтр по турам */}
        {tours.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Фильтр по туру:</label>
            <select
              value={filterTourId}
              onChange={(e) => setFilterTourId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-airbnb-rausch focus:border-airbnb-rausch"
            >
              <option value="all">Все туры ({bookings.length})</option>
              {tours.map(tour => (
                <option key={tour.id} value={tour.id}>
                  {tour.title} ({bookings.filter((b: any) => b.tour_id === tour.id).length})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Таблица */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">Загрузка...</div>
          </CardContent>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {filterStatus === 'all' ? 'Пока нет заказов' : 'Нет заказов с таким статусом'}
            </p>
            <p className="text-sm text-gray-500">
              Заказы появятся после того как клиенты забронируют ваши экскурсии
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Экскурсия</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата и время</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Участники</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Оборот</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ваш доход</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">#{booking.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 max-w-xs truncate">
                            {booking.tour_title}
                          </div>
                          <button
                            onClick={() => navigate(`/dashboard/my-tours#tour-${booking.tour_id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Посмотреть тур"
                          >
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.client_name}</div>
                          <div className="text-xs text-gray-500">{booking.client_phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.date).toLocaleDateString('ru')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.time || '10:00'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {booking.participants_count} чел.
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-blue-600">
                          {formatRUB(booking.total_price)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-airbnb-rausch">
                          {formatRUB(booking.total_price * 0.03)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(booking.payment_status)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/calendar`)}
                            title="Посмотреть в календаре"
                          >
                            <Calendar size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye size={14} className="mr-1" />
                            Детали
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно с деталями */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Детали заказа #{selectedBooking?.id}</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Экскурсия */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Экскурсия</h3>
                <p className="text-lg">{selectedBooking.tour_title}</p>
              </div>

              {/* Клиент */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Информация о клиенте</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Имя</div>
                      <div className="text-sm font-medium">{selectedBooking.client_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Телефон</div>
                      <div className="text-sm font-medium">{selectedBooking.client_phone}</div>
                    </div>
                  </div>
                  {selectedBooking.client_email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-sm font-medium">{selectedBooking.client_email}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Участники</div>
                      <div className="text-sm font-medium">{selectedBooking.participants_count} человек</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Дата и время */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Дата экскурсии</div>
                    <div className="text-sm font-medium">{new Date(selectedBooking.date).toLocaleDateString('ru', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Время</div>
                    <div className="text-sm font-medium">{selectedBooking.time || '10:00'}</div>
                    </div>
                  </div>
                </div>
                
              {/* Финансы */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">Финансы</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Оборот (полная стоимость):</span>
                  <span className="text-lg font-bold text-blue-600">{formatRUB(selectedBooking.total_price)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                  <span className="text-gray-700">Ваш доход (3%):</span>
                  <span className="text-xl font-bold text-airbnb-rausch">{formatRUB(selectedBooking.total_price * 0.03)}</span>
                </div>
              </div>

              {/* Статус */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Статус оплаты</h3>
                {getStatusBadge(selectedBooking.payment_status)}
              </div>

              {/* Действия */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const phone = selectedBooking.client_phone.replace(/\D/g, '')
                    window.open(`https://wa.me/${phone}`, '_blank')
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Написать в WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1"
                >
                  Закрыть
                </Button>
              </div>
        </div>
      )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
