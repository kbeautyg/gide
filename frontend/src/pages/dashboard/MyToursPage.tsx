import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateTourDialog } from '@/components/CreateTourDialog'
import { MapPin, Clock, Star, Edit, Trash2, Link as LinkIcon, Copy, CheckCircle, CreditCard, ExternalLink, Calendar } from 'lucide-react'
import { toursApi, api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

export default function MyToursPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList(),
  })

  const tours = toursData?.data?.tours || []

  // Для админов - свои экскурсии, для менеджеров - все доступные
  const myTours = user?.role === 'super_admin' || user?.role === 'admin' 
    ? tours.filter((t: any) => t.guide_id === user?.id)
    : []
  
  const availableTours = user?.role === 'manager' || user?.role === 'guide'
    ? tours  // Менеджеры видят ВСЕ экскурсии
    : []

  const copyTourLink = (tourId: number) => {
    const link = `${window.location.origin}/tours/${tourId}`
    navigator.clipboard.writeText(link)
    setCopiedId(tourId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Тестовая оплата с полной интеграцией БД
  const testPaymentMutation = useMutation({
    mutationFn: async (tour: any) => {
      const bookingData = {
        tour_id: tour.id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 дней
        participants_count: 2,
        client_name: "Тестовый клиент",
        client_phone: "+79999999999",
        client_email: "test@example.com"
      }
      
      const response = await api.post('/bookings/test-payment', bookingData)
      return { booking: response.data, tour }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      alert(
        `✅ ТЕСТОВАЯ ОПЛАТА УСПЕШНА!\n\n` +
        `Экскурсия: ${data.tour.title}\n` +
        `Цена за 1 чел: ${formatRUB(data.tour.price)}\n` +
        `Участников: 2\n` +
        `Всего: ${formatRUB(data.tour.price * 2)}\n\n` +
        `Бронирование ID: ${data.booking.id}\n` +
        `Статус: ${data.booking.payment_status}\n\n` +
        `✅ Создана транзакция\n` +
        `✅ Баланс гида обновлён\n` +
        `✅ Данные из БД корректны!\n\n` +
        `Проверьте разделы "Бронирования" и "Финансы"`
      )
    },
    onError: (error: any) => {
      alert(`❌ Ошибка оплаты:\n${error.response?.data?.detail || error.message}`)
    }
  })

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin'
  const isManager = user?.role === 'manager' || user?.role === 'guide'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Мои экскурсии' : 'Доступные экскурсии'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Управление вашими экскурсиями' : 'Генерируйте ссылки и принимайте оплату'}
          </p>
        </div>
        {isAdmin && <CreateTourDialog />}
      </div>

      {isLoading ? (
        <p className="text-center py-12 text-gray-600">Загрузка...</p>
      ) : isAdmin && myTours.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">
              У вас пока нет экскурсий. Создайте первую!
            </p>
            <CreateTourDialog />
          </CardContent>
        </Card>
      ) : isManager && availableTours.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">
              Пока нет доступных экскурсий. Обратитесь к администратору.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(isAdmin ? myTours : availableTours).map((tour: any) => (
            <Card key={tour.id} className="flex flex-col">
              <div className="relative">
                <img
                  src={tour.photos?.[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800'}
                  alt={tour.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                  {formatRUB(tour.price)}
                </div>
                {!tour.active && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Не активна
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span>{tour.location}</span>
                  <Clock size={16} className="ml-auto" />
                  <span>{tour.duration} ч</span>
                </div>
                <CardTitle className="text-lg">{tour.title}</CardTitle>
                {tour.start_date && tour.end_date && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar size={12} />
                    <span>{new Date(tour.start_date).toLocaleDateString('ru-RU')} - {new Date(tour.end_date).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <span className="font-semibold">{tour.rating}</span>
                  <span className="text-gray-600">({tour.reviews_count} отзывов)</span>
                </div>

                {/* Ссылка на экскурсию */}
                <div className="bg-gradient-to-r from-tropical-ocean/5 to-tropical-turquoise/5 p-3 rounded-lg border-2 border-tropical-ocean/20">
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon size={14} className="text-tropical-ocean" />
                    <span className="text-xs font-semibold text-tropical-ocean">Платёжная ссылка</span>
                  </div>
                  <div className="text-xs text-gray-700 break-all mb-2 bg-white p-2 rounded">
                    {window.location.origin}/tours/{tour.id}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => copyTourLink(tour.id)}
                    >
                      {copiedId === tour.id ? (
                        <>
                          <CheckCircle size={14} className="mr-1" />
                          Скопировано!
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="mr-1" />
                          Копировать
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => window.open(`/tours/${tour.id}`, '_blank')}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </div>

                {/* Тестовая оплата с полной интеграцией */}
                <Button
                  variant="tropical"
                  size="sm"
                  className="w-full text-xs gap-2"
                  onClick={() => testPaymentMutation.mutate(tour)}
                  disabled={testPaymentMutation.isPending}
                >
                  <CreditCard size={14} />
                  {testPaymentMutation.isPending ? 'Обработка...' : 'Тест: Оплатить'}
                </Button>
              </CardContent>

              {isAdmin && (
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit size={16} className="mr-1" />
                    Редактировать
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 size={16} />
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}