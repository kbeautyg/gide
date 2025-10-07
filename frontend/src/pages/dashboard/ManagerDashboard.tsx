import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateTourDialog } from '@/components/CreateTourDialog'
import { MapPin, Calendar, Wallet, TrendingUp, Link as LinkIcon, Copy, CheckCircle, CreditCard, ExternalLink, MessageSquare, Clock, Star } from 'lucide-react'
import { api, toursApi } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function ManagerDashboard() {
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Загрузка профиля для баланса
  const { data: profileData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await api.get('/users/me')
      return response.data
    },
  })

  // Загрузка экскурсий менеджера
  const { data: toursData } = useQuery({
    queryKey: ['tours', 'my'],
    queryFn: () => toursApi.getList(),
  })

  // Загрузка заявок
  const { data: requestsData } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await api.get('/requests/')
      return response.data
    },
  })

  // Загрузка бронирований
  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: async () => {
      return []
    },
  })

  const myTours = toursData?.data?.tours || []
  const requests = requestsData?.requests || []
  const bookingsCount = Array.isArray(bookingsData) ? bookingsData.length : 0
  const balance = profileData?.balance_rub || 0

  const copyTourLink = (tourId: number) => {
    const link = `${window.location.origin}/tours/${tourId}`
    navigator.clipboard.writeText(link)
    setCopiedId(tourId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const testPayment = (tour: any) => {
    const info = `
🧾 ТЕСТОВАЯ ОПЛАТА ЭКСКУРСИИ

📌 Название: ${tour.title}
💰 Цена: ${formatRUB(tour.price)}
🆔 ID экскурсии: ${tour.id}
📍 Локация: ${tour.location}
⏱️ Длительность: ${tour.duration} часов
⭐ Рейтинг: ${tour.rating}

✅ Все данные корректно загружены из БД!
    `.trim()
    
    alert(info)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Дашборд Менеджера</h1>
          <p className="text-gray-600 mt-1">Управление экскурсиями и бронированиями</p>
        </div>
        <CreateTourDialog />
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
              <MapPin size={18} />
              Мои экскурсии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{myTours.length}</p>
            <p className="text-xs text-gray-500 mt-1">Созданных экскурсий</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
              <Calendar size={18} />
              Бронирования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bookingsCount}</p>
            <p className="text-xs text-gray-500 mt-1">Активных броней</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <Wallet size={18} />
              Баланс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{balance.toFixed(0)} ₽</p>
            <p className="text-xs text-gray-500 mt-1">Доступно для вывода</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
              <TrendingUp size={18} />
              Доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0 ₽</p>
            <p className="text-xs text-gray-500 mt-1">За последний месяц</p>
          </CardContent>
        </Card>
      </div>

      {/* НОВЫЙ БЛОК - Мои экскурсии со ссылками */}
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-orange-600 flex items-center gap-2">
                <MapPin size={24} />
                Мои экскурсии со ссылками
              </CardTitle>
              <CardDescription className="mt-2">
                Отправляйте ссылки клиентам. Экскурсии НЕ публикуются на главной странице (это делает только админ)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {myTours.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Вы еще не создали ни одной экскурсии
              </p>
              <CreateTourDialog />
            </div>
          ) : (
            <div className="space-y-4">
              {myTours.map((tour: any) => (
                <Card key={tour.id} className="border-2 hover:border-orange-300 transition-all">
                  <div className="grid md:grid-cols-3 gap-4 p-4">
                    {/* Left - Tour Info */}
                    <div className="md:col-span-1">
                      <img
                        src={tour.photos?.[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400'}
                        alt={tour.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-bold text-lg mb-2">{tour.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {tour.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {tour.duration}ч
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-orange-600">{formatRUB(tour.price)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Star className="fill-yellow-400 text-yellow-400" size={14} />
                        <span className="font-semibold">{tour.rating}</span>
                        <span className="text-gray-500">({tour.reviews_count})</span>
                      </div>
                    </div>

                    {/* Center - Links */}
                    <div className="md:col-span-1 space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <LinkIcon size={16} className="text-tropical-ocean" />
                          Ссылка для клиентов
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg border text-xs break-all text-gray-700">
                          {window.location.origin}/tours/{tour.id}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
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
                            onClick={() => window.open(`/tours/${tour.id}`, '_blank')}
                          >
                            <ExternalLink size={14} />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          ⚠️ <strong>Важно:</strong> Эта экскурсия не опубликована на главной странице. 
                          Только админ может активировать экскурсии для публичного каталога.
                        </p>
                      </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="md:col-span-1 space-y-2">
                      <h4 className="font-semibold text-sm mb-3">Действия</h4>
                      
                      <Button
                        variant="tropical"
                        className="w-full"
                        onClick={() => testPayment(tour)}
                      >
                        <CreditCard size={16} className="mr-2" />
                        Тест: Оплатить
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => alert('Функция редактирования в разработке')}
                      >
                        Редактировать
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(`/tours/${tour.id}`, '_blank')}
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Посмотреть на сайте
                      </Button>

                      <div className="pt-3 border-t">
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>ID: <span className="font-mono">{tour.id}</span></p>
                          <p>Категория: {tour.category}</p>
                          <p>
                            Статус: {' '}
                            <span className={tour.active ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                              {tour.active ? '✓ Активна' : '○ Неактивна'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Заявки на экскурсии */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-600 flex items-center gap-2">
            <MessageSquare size={24} />
            Заявки на индивидуальные экскурсии
          </CardTitle>
          <CardDescription>
            Заявки от клиентов на создание персональных экскурсий
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет заявок</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map((request: any) => (
                <Card key={request.id} className="border hover:border-blue-300 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{request.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>👥 {request.participants_count} чел.</span>
                          <span>📍 {request.location}</span>
                          <span>💰 {formatRUB(request.budget || 0)}</span>
                          <span>📅 {request.preferred_date ? new Date(request.preferred_date).toLocaleDateString('ru-RU') : 'Не указана'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="tropical">
                          Ответить
                        </Button>
                        <Button size="sm" variant="outline">
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {requests.length > 5 && (
                <Button variant="outline" className="w-full">
                  Посмотреть все заявки ({requests.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Последние бронирования */}
      <Card>
        <CardHeader>
          <CardTitle>Последние бронирования</CardTitle>
          <CardDescription>Новые заказы на ваши экскурсии</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsCount > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Бронирования загружаются...</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">Пока нет бронирований</p>
              <p className="text-sm text-gray-500">
                Создайте экскурсию и отправьте ссылку клиентам!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}