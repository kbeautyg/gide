import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, ArrowRight, User, Star, Search, Heart, Sparkles, Trophy, MessageCircle } from 'lucide-react'
import { formatRUB, getImageUrl } from '@/lib/utils'
import { api, toursApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Link } from 'react-router-dom'
import { useFavorites } from '@/lib/favorites'

// Вычисление процента заполненности профиля
function getProfileCompletion(user: any): number {
  if (!user) return 0
  const fields = [
    !!user.name,
    !!user.phone,
    !!user.email,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

export default function ClientDashboard() {
  const { user } = useAuthStore()
  const { favorites } = useFavorites() // Get favorites count
  const profileCompletion = getProfileCompletion(user)

  // Загрузка моих бронирований
  const { data: bookingsData } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/') 
      return response.data
    },
  })

  // Рекомендации (берем публичные туры)
  const { data: recommendedData } = useQuery({
    queryKey: ['tours', 'recommended'],
    queryFn: () => toursApi.getList({ limit: 4, is_public: true } as any),
  })

  // Фильтруем бронирования на клиенте (временное решение)
  const bookings = bookingsData?.bookings?.filter((b: any) =>
    b.client_id === user?.id || b.client_phone === user?.phone
  ) || []

  // Статус-ориентированная фильтрация (не по дате!)
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending')
  const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed')
  const completedBookings = bookings.filter((b: any) => b.status === 'completed')
  // Активные = pending + confirmed (для списка «Ближайшие поездки»)
  const activeBookings = bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed')

  // Получаем туры из ответа (AxiosResponse или данные напрямую)
  const recommendedTours = recommendedData?.data?.tours || []

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Status Banners for Guide Application */}
      {user?.guide_status === 'pending' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Ваша заявка на получение статуса гида находится на рассмотрении. Ожидайте решения администратора.
              </p>
            </div>
          </div>
        </div>
      )}

      {user?.guide_status === 'rejected' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <User className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Ваша заявка на получение статуса гида была отклонена. Свяжитесь с поддержкой для уточнения деталей.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm border-2 border-white/30">
              {user?.name?.[0] || user?.phone?.[0] || 'T'}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Привет, {user?.name || 'Путешественник'}!</h1>
              <p className="text-blue-100 text-lg">
                Куда отправимся сегодня?
              </p>
            </div>
          </div>
          <Link to="/tours">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 gap-2 font-semibold shadow-md border-0 h-12 px-6">
              <Search size={20} />
              Найти приключение
            </Button>
          </Link>
        </div>
      </div>

      {/* Баннер «Ждём ответа гида» для pending бронирований */}
      {pendingBookings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-orange-900">
              Ждём ответа гида по {pendingBookings.length === 1 ? 'вашему бронированию' : `${pendingBookings.length} бронированиям`}
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              Перейдите во вкладку «Сообщения», чтобы связаться с гидом
            </p>
          </div>
          <Link to="/dashboard/messages">
            <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100 gap-1.5 flex-shrink-0">
              <MessageCircle size={14} />
              Сообщения
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-orange-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ожидание
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingBookings.length}</div>
            <p className="text-xs text-gray-400">поездок</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Подтверждено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{confirmedBookings.length}</div>
            <p className="text-xs text-gray-400">поездок</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Завершено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedBookings.length}</div>
            <p className="text-xs text-gray-400">поездок</p>
          </CardContent>
        </Card>

        <Link to="/dashboard/favorites" className="block">
            <Card className="bg-white border-pink-100 shadow-sm hover:shadow-md transition-all h-full cursor-pointer group">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-pink-600 transition-colors">
                Избранное
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-pink-500">{favorites.length}</div>
                <p className="text-xs text-gray-400">туров</p>
            </CardContent>
            </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Bookings & Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <Clock size={24} className="text-blue-600" />
                    Ближайшие поездки
                </h2>
                {activeBookings.length > 0 && (
                    <Link to="/dashboard/bookings" className="text-sm text-blue-600 font-medium hover:underline">
                        Все поездки
                    </Link>
                )}
            </div>
            
            {activeBookings.length > 0 ? (
                <div className="space-y-4">
                {activeBookings.map((booking: any) => (
                    <Link to={`/tours/${booking.tour_id}`} key={booking.id} className="block group">
                    <Card className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-48 h-32 sm:h-auto bg-gray-200 shrink-0 relative">
                             {/* Placeholder if no image, ideally booking.tour.photos[0] */}
                            {booking.tour_photo ? (
                            <img 
                                src={getImageUrl(booking.tour_photo)} 
                                alt={booking.tour_title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <MapPin size={32} className="text-blue-400" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold">
                                {new Date(booking.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{booking.tour_title || 'Экскурсия'}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-orange-100 text-orange-700'
                                }`}>
                                    {booking.status === 'confirmed' ? 'Подтверждено' :
                                     booking.status === 'completed' ? 'Завершено' :
                                     booking.status === 'cancelled' ? 'Отменено' :
                                     'Ожидание'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-2 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {booking.time || '10:00'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {booking.participants_count} чел.
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t pt-3">
                            <div className="font-bold text-blue-600">{formatRUB(booking.total_price)}</div>
                            <Button variant="outline" size="sm" className="h-8">Подробнее</Button>
                        </div>
                        </div>
                    </div>
                    </Card>
                    </Link>
                ))}
                </div>
            ) : (
                <Card className="bg-gray-50 border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">У вас пока нет запланированных поездок</h3>
                    <p className="text-gray-500 mt-1 mb-6 max-w-sm">
                    Самое время выбрать новое приключение! У нас сотни интересных маршрутов.
                    </p>
                    <Link to="/tours">
                    <Button className="bg-airbnb-rausch hover:bg-airbnb-rausch/90">
                        Найти экскурсию
                    </Button>
                    </Link>
                </CardContent>
                </Card>
            )}
          </section>

          {/* Recommended Section */}
          <section>
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <Sparkles size={20} className="text-yellow-500" />
                 Рекомендуем вам
             </h2>
             {recommendedTours.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {recommendedTours.map((tour: any) => (
                       <Link key={tour.id} to={`/tours/${tour.id}`} className="group block h-full">
                          <Card className="overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                              <div className="relative h-48 w-full">
                                  {tour.photos?.[0] ? (
                                  <img 
                                      src={getImageUrl(tour.photos[0])} 
                                      alt={tour.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                      <MapPin size={32} className="text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                      {formatRUB(tour.price)}
                                  </div>
                              </div>
                              <CardContent className="p-4 flex flex-col flex-1">
                                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                      {tour.title}
                                  </h3>
                                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-auto">
                                      <MapPin size={14} className="flex-shrink-0" />
                                      <span className="truncate">{tour.location}</span>
                                  </div>
                              </CardContent>
                          </Card>
                       </Link>
                   ))}
               </div>
             ) : (
               <div className="text-center py-10 bg-gray-50 rounded-lg">
                 <p className="text-gray-500">Загрузка рекомендаций...</p>
               </div>
             )}
          </section>

        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ваш профиль</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-gray-600" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-medium truncate">{user?.name || 'Пользователь'}</div>
                  <div className="text-sm text-gray-500 truncate">{user?.phone}</div>
                </div>
              </div>
              <div className="pt-2">
                 <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Заполненность профиля</span>
                    <span className={`font-medium ${profileCompletion === 100 ? 'text-green-600' : 'text-orange-500'}`}>{profileCompletion}%</span>
                 </div>
                 <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${profileCompletion === 100 ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${profileCompletion}%` }}></div>
                 </div>
              </div>
              <Link to="/dashboard/settings" className="block">
                <Button variant="outline" className="w-full">Редактировать профиль</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
