import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  User, 
  Phone, 
  Mail,
  Clock,
  Users,
  Eye,
  MessageCircle,
  ExternalLink,
  Search,
  Filter,
  CreditCard,
  MapPin,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react'
import { api, toursApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatRUB } from '@/lib/utils'
import { toast } from '@/lib/toast'

export default function BookingsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTourId, setFilterTourId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const isClient = user?.role === 'client'
  const isManager = user?.role === 'manager' || user?.role === 'guide'
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  
  // Загрузка туров для фильтра (только для гидов)
  const { data: toursData } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList({ include_private: true }),
    enabled: !isClient
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
    queryFn: async () => {
        // Для клиента нужен другой эндпоинт или фильтрация на бэке, но пока фильтруем здесь если API общий
        // В реальном API должен быть /bookings/my для клиента
        const response = await api.get('/bookings/') 
        return response.data
    },
  })

  const allBookings = bookingsData?.bookings || []

  // Фильтрация
  let filteredBookings = allBookings
  
  // Если клиент - показываем только его бронирования (если API возвращает все)
  // Предлагаем, что API /bookings/ возвращает только свои для клиента, но на всякий случай:
  if (isClient) {
      filteredBookings = filteredBookings.filter((b: any) => b.client_id === user?.id || b.client_phone === user?.phone)
  }
  
  if (filterStatus !== 'all') {
    filteredBookings = filteredBookings.filter((b: any) => b.payment_status === filterStatus)
  }
  
  if (filterTourId !== 'all') {
    filteredBookings = filteredBookings.filter((b: any) => b.tour_id === parseInt(filterTourId))
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredBookings = filteredBookings.filter((b: any) => 
        b.client_name?.toLowerCase().includes(query) ||
        b.tour_title?.toLowerCase().includes(query) ||
        b.id.toString().includes(query)
    )
  }

  // Сортировка по дате (сначала новые)
  filteredBookings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Подсчёт статистики
  const totalTurnover = filteredBookings
    .filter((b: any) => b.payment_status === 'paid')
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
  
  const totalIncome = totalTurnover * 0.03

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Оплачено', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Ожидает', icon: Clock },
      awaiting_payment: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Ожидает оплаты', icon: Clock },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Отменено', icon: XCircle },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Возврат', icon: XCircle },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isClient ? 'Мои поездки' : 'Заказы'}
          </h1>
          <p className="text-sm text-gray-600">
            {isClient 
                ? 'История ваших путешествий и предстоящие туры' 
                : 'Управление бронированиями и платежами'}
          </p>
        </div>

        {/* Статистика (скрыта для клиента) */}
        {!isClient && (
            <div className="flex gap-4 bg-white p-2 rounded-lg border shadow-sm">
                <div className="px-4 border-r">
                    <div className="text-xs text-gray-500">Оборот</div>
                    <div className="text-lg font-bold text-gray-900">{formatRUB(totalTurnover)}</div>
          </div>
                <div className="px-4">
                    <div className="text-xs text-gray-500">Доход (3%)</div>
                    <div className="text-lg font-bold text-emerald-600">{formatRUB(totalIncome)}</div>
          </div>
        </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
                placeholder={isClient ? "Поиск по названию тура..." : "Поиск по клиенту, туру или ID..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
            />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
             <div className="flex bg-gray-100 p-1 rounded-lg">
          {[
            { value: 'all', label: 'Все' },
            { value: 'paid', label: 'Оплачено' },
                    { value: 'awaiting_payment', label: 'В ожидании' },
                    { value: 'cancelled', label: 'Отмена' },
                ].map(tab => (
            <button
                        key={tab.value}
                        onClick={() => setFilterStatus(tab.value)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                            filterStatus === tab.value
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
                        {tab.label}
            </button>
          ))}
        </div>

             {!isClient && tours.length > 0 && (
            <select
              value={filterTourId}
              onChange={(e) => setFilterTourId(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                    <option value="all">Все экскурсии</option>
              {tours.map(tour => (
                        <option key={tour.id} value={tour.id}>{tour.title}</option>
              ))}
            </select>
             )}
          </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка данных...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Ничего не найдено</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
                {filterStatus === 'all' 
                    ? (isClient ? "Вы еще не бронировали экскурсии." : "Заказов пока нет.") 
                    : "Нет заказов с выбранными параметрами."}
            </p>
            {isClient && (
                <Button className="mt-4" onClick={() => navigate('/tours')}>
                    Найти экскурсию
                </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                            <th className="px-6 py-3 font-medium text-gray-500">ID</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Экскурсия</th>
                            {!isClient && <th className="px-6 py-3 font-medium text-gray-500">Клиент</th>}
                            <th className="px-6 py-3 font-medium text-gray-500">Дата</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Сумма</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Статус</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">Действия</th>
                  </tr>
                </thead>
                    <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking: any) => (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-500">#{booking.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{booking.tour_title}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={10} />
                                        {booking.tour?.location || 'Таиланд'}
                        </div>
                      </td>
                                {!isClient && (
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{booking.client_name}</div>
                                        <div className="text-xs text-gray-500">{booking.client_phone}</div>
                      </td>
                                )}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span>{new Date(booking.date).toLocaleDateString('ru')}</span>
                        </div>
                                    <div className="text-xs text-gray-500 pl-6 mt-0.5">
                          {booking.time || '10:00'}
                        </div>
                      </td>
                                <td className="px-6 py-4 font-medium">
                          {formatRUB(booking.total_price)}
                      </td>
                                <td className="px-6 py-4">
                        {getStatusBadge(booking.payment_status)}
                      </td>
                                <td className="px-6 py-4 text-right">
                          <Button
                                        variant="ghost" 
                                        size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                                        Детали
                          </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

            {/* Mobile Card View */}
            <div className="md:hidden grid gap-4">
                {filteredBookings.map((booking: any) => (
                    <Card key={booking.id} onClick={() => setSelectedBooking(booking)} className="cursor-pointer hover:border-blue-300 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-medium text-gray-900">{booking.tour_title}</h3>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(booking.date).toLocaleDateString('ru')} в {booking.time || '10:00'}
                                    </div>
                                </div>
                                {getStatusBadge(booking.payment_status)}
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t">
                                <div className="text-sm font-semibold text-gray-900">
                                    {formatRUB(booking.total_price)}
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 text-xs">
                                    Подробнее
                                </Button>
            </div>
          </CardContent>
        </Card>
                ))}
            </div>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Заказ #{selectedBooking?.id}</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
                {/* Status Banner */}
                <div className={`p-4 rounded-lg flex items-center justify-between ${
                    selectedBooking.payment_status === 'paid' ? 'bg-green-50 text-green-800' : 
                    selectedBooking.payment_status === 'cancelled' || selectedBooking.payment_status === 'refunded' ? 'bg-red-50 text-red-800' :
                    'bg-yellow-50 text-yellow-800'
                }`}>
                    <div className="flex items-center gap-2">
                        {selectedBooking.payment_status === 'paid' ? <CheckCircle size={20} /> : 
                         selectedBooking.payment_status === 'cancelled' || selectedBooking.payment_status === 'refunded' ? <XCircle size={20} /> : 
                         <Clock size={20} />}
                        <span className="font-medium">
                            {selectedBooking.payment_status === 'paid' ? 'Заказ оплачен' : 
                             selectedBooking.payment_status === 'cancelled' ? 'Заказ отменен' :
                             selectedBooking.payment_status === 'refunded' ? 'Возврат средств' :
                             'Ожидает оплаты'}
                        </span>
                    </div>
                    <span className="font-bold text-lg">{formatRUB(selectedBooking.total_price)}</span>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                            <div className="text-sm text-gray-500 mb-1">Экскурсия</div>
                            <div className="font-medium">{selectedBooking.tour_title}</div>
                    </div>
                    <div>
                            <div className="text-sm text-gray-500 mb-1">Дата и время</div>
                            <div className="font-medium">
                                {new Date(selectedBooking.date).toLocaleDateString('ru')}
                                <span className="text-gray-400 mx-1">|</span>
                                {selectedBooking.time || '10:00'}
                  </div>
                </div>
              </div>

                    {!isClient && (
                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <User size={16} className="text-gray-500" />
                                Данные клиента
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                                    <div className="text-gray-500">Имя</div>
                                    <div>{selectedBooking.client_name}</div>
                  </div>
                                <div>
                                    <div className="text-gray-500">Телефон</div>
                                    <div className="font-mono">{selectedBooking.client_phone}</div>
                </div>
                                {selectedBooking.client_email && (
                                    <div className="col-span-2">
                                        <div className="text-gray-500">Email</div>
                                        <div>{selectedBooking.client_email}</div>
                    </div>
                                )}
                  </div>
                </div>
                    )}

                    {isClient && selectedBooking.payment_status === 'paid' && (
                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">Ваучер и билеты</h4>
                            <Button 
                              variant="outline" 
                              className="w-full gap-2"
                              onClick={() => toast.info('Ваучер будет доступен скоро', 'Функция генерации PDF-ваучеров в разработке')}
                            >
                                <Download size={16} />
                                Скачать ваучер (PDF)
                            </Button>
                </div>
                    )}
              </div>

                <div className="flex gap-3 pt-2">
                    {/* Кнопки действий зависят от роли */}
                    {!isClient ? (
                        <>
                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                                window.open(`https://wa.me/${selectedBooking.client_phone.replace(/\D/g, '')}`, '_blank')
                            }}>
                  <MessageCircle size={16} className="mr-2" />
                                WhatsApp
                </Button>
                            <Button variant="outline" onClick={() => setSelectedBooking(null)}>Закрыть</Button>
                        </>
                    ) : (
                        <>
                            {(selectedBooking.payment_status === 'pending' || selectedBooking.payment_status === 'awaiting_payment') && (
                                <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                    <p className="text-sm font-medium text-yellow-800">Ожидает оплаты</p>
                                    <p className="text-xs text-yellow-600 mt-1">Гид свяжется с вами для уточнения способа оплаты</p>
                                </div>
                            )}
                            <Button variant="outline" className="flex-1" onClick={() => setSelectedBooking(null)}>Закрыть</Button>
                        </>
                    )}
              </div>
        </div>
      )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
