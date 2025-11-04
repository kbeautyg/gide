import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  MapPin, Clock, Star, Users, DollarSign,
  Heart, Share2, CheckCircle, XCircle, Image as ImageIcon,
  Shield, Calendar as CalendarIcon, Gift, Sparkles,
  AlertCircle, Info, Navigation, Globe, ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toursApi, bookingsApi, api } from '@/lib/api'
import type { Tour } from '@/types/tour'
import { formatRUB } from '@/lib/utils'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { TourCard } from '@/components/TourCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { buildExperienceUrl, buildDestinationUrl } from '@/lib/routing'

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [isFavorite, setIsFavorite] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: '',
    participants: 1,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    telegram: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)

  // Загрузка экскурсии
  const { data: tourData, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => toursApi.getById(id!),
    enabled: !!id,
  })

  const tour = tourData?.data as Tour | undefined
  
  // Загрузка отзывов
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/reviews/${id}`).then(res => res.data),
    enabled: !!id,
  })

  // Загрузка похожих туров
  const { data: relatedToursData } = useQuery({
    queryKey: ['related-tours', tour?.category, tour?.location, id],
    queryFn: async () => {
      if (!tour) return { tours: [] }
      const response = await toursApi.getList({
        page: 1,
        page_size: 4,
        category: tour.category,
      })
      // Исключаем текущий тур
      const filtered = response.data.tours?.filter((t: Tour) => t.id !== tour.id) || []
      return { tours: filtered.slice(0, 3) }
    },
    enabled: !!tour,
  })

  const reviews = reviewsData || []
  const relatedTours = relatedToursData?.tours || []

  // Создание бронирования
  const bookingMutation = useMutation({
    mutationFn: () => bookingsApi.create({
      tour_id: Number(id),
      date: bookingData.date,
      participants_count: bookingData.participants,
      client_name: bookingData.clientName,
      client_phone: bookingData.clientPhone,
      client_email: bookingData.clientEmail || undefined,
      telegram_username: bookingData.telegram || undefined,
    }),
    onSuccess: () => {
      setShowSuccess(true)
      setBookingData({
        date: '',
        participants: 1,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        telegram: '',
      })
      setTimeout(() => setShowSuccess(false), 5000)
    },
  })

  const handleBooking = () => {
    if (!bookingData.date || !bookingData.clientName || !bookingData.clientPhone) {
      return
    }
    bookingMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="skeleton w-32 h-32 rounded-full" />
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Экскурсия не найдена</p>
      </div>
    )
  }

  const photos = tour.photos?.length > 0 
    ? tour.photos 
    : ['https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&h=800&fit=crop']

  const totalPrice = tour.price * bookingData.participants
  
  // Формируем breadcrumbs
  const breadcrumbs = []
  if (tour.location) {
    // Парсим локацию: "Город, Страна"
    const locationParts = tour.location.split(', ')
    if (locationParts.length === 2) {
      const cityName = locationParts[0].trim()
      const countryName = locationParts[1].trim()
      breadcrumbs.push({
        label: countryName,
        href: buildDestinationUrl(countryName),
      })
      breadcrumbs.push({
        label: cityName,
        href: buildExperienceUrl(cityName),
      })
    } else {
      // Если формат не "Город, Страна", просто добавляем локацию
      breadcrumbs.push({
        label: tour.location,
        href: `/tours?location=${encodeURIComponent(tour.location)}`,
      })
    }
  }
  breadcrumbs.push({
    label: tour.title,
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(243, 244, 246)' }}>
      <PublicHeader />
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      <div className="container mx-auto px-4 py-8 relative">
        {/* Hero галерея 2×2 */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-0 h-[500px] rounded-xl overflow-hidden shadow-xl">
            {/* Большое фото слева */}
            <div className="col-span-2 row-span-2 cursor-pointer relative group">
              <img
                src={photos[0]}
                alt={tour.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* 4 миниатюры справа */}
            {photos.slice(1, 5).map((photo, i) => (
              <div key={i} className="cursor-pointer relative group">
                <img
                  src={photo || `https://images.unsplash.com/photo-${1589394815804 + i}-964ed0be2eb5?w=400&h=250&fit=crop`}
                  alt={`${tour.title} ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {i === 3 && photos.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="gap-2">
                      <ImageIcon size={16} />
                      Показать все {photos.length} фото
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-1 space-y-6">
            {/* Заголовок и действия */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <MapPin size={16} />
                  <span>{tour.location}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <Clock size={16} />
                    <span>{tour.duration} ч</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Heart
                      size={20}
                      className={isFavorite ? 'fill-airbnb-rausch stroke-airbnb-rausch' : 'stroke-gray-900'}
                    />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Share2 size={20} className="text-gray-900" />
                  </button>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{tour.title}</h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star size={18} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">{tour.rating.toFixed(1)}</span>
                </div>
                <a href="#reviews" className="text-gray-900 underline hover:text-gray-700">
                  {tour.reviews_count} отзыв{tour.reviews_count === 1 ? '' : tour.reviews_count < 5 ? 'а' : 'ов'}
                </a>
              </div>
            </div>

            {/* Статистические блоки - как на скриншоте */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mb-1">{formatRUB(tour.price)}</p>
                    <p className="text-xs text-blue-700">За человека</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-green-900 mb-1">{tour.duration}ч</p>
                    <p className="text-xs text-green-700">Длительность</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-900 mb-1">{tour.rating.toFixed(1)}</p>
                    <p className="text-xs text-yellow-700">Рейтинг</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mb-1">{tour.total_bookings || 0}</p>
                    <p className="text-xs text-purple-700">Бронирований</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Описание экскурсии */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Описание экскурсии</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {tour.description}
                </p>
              </CardContent>
            </Card>

            {/* Что вас ожидает */}
            {tour.what_to_expect && (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Что вас ожидает</h2>
                  </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {tour.what_to_expect}
                      </p>
                  </CardContent>
                </Card>
            )}

            {/* Организационные детали - Блочный дизайн */}
            {(tour.organizational_details || (tour.included && tour.included.length > 0) || (tour.not_included && tour.not_included.length > 0)) && (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Организационные детали</h2>
                  </div>

                  {tour.organizational_details && (
                    <div className="mb-6 pb-6 border-b">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {tour.organizational_details}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Что включено - Блочный стиль */}
                    {tour.included && tour.included.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900">Что включено</h3>
                        </div>
                        <div className="space-y-2">
                          {tour.included.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Что не включено - Блочный стиль */}
                    {tour.not_included && tour.not_included.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900">Что не включено</h3>
                        </div>
                        <div className="space-y-2">
                          {tour.not_included.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Дополнительная информация - Блоки */}
                  {(tour.meeting_point || tour.max_group_size || tour.min_age || tour.difficulty_level || (tour.languages && tour.languages.length > 0)) && (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Дополнительная информация</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {tour.meeting_point && (
                      <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Navigation className="w-5 h-5 text-blue-600" />
                          <p className="font-semibold text-blue-900">Место встречи</p>
                        </div>
                        <p className="text-gray-700">{tour.meeting_point}</p>
                      </div>
                    )}

                    {tour.max_group_size && (
                      <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-purple-600" />
                          <p className="font-semibold text-purple-900">Размер группы</p>
                        </div>
                        <p className="text-gray-700">До {tour.max_group_size} человек</p>
                      </div>
                    )}

                    {tour.min_age !== null && tour.min_age !== undefined && (
                      <div className="p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-pink-600" />
                          <p className="font-semibold text-pink-900">Возрастное ограничение</p>
                        </div>
                        <p className="text-gray-700">От {tour.min_age} лет</p>
                      </div>
                    )}

                    {tour.difficulty_level && (
                      <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-orange-600" />
                          <p className="font-semibold text-orange-900">Сложность</p>
                        </div>
                        <p className="text-gray-700">{tour.difficulty_level}</p>
                      </div>
                    )}

                    {tour.languages && tour.languages.length > 0 && (
                      <div className="p-4 bg-teal-50 rounded-xl border-2 border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-5 h-5 text-teal-600" />
                          <p className="font-semibold text-teal-900">Языки</p>
                        </div>
                        <p className="text-gray-700">{tour.languages.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Отзывы */}
            {reviews.length > 0 && (
              <div id="reviews">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Отзывы</h2>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review: any, index: number) => (
                    <Card key={index} className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {review.client_name?.charAt(0)?.toUpperCase() || 'А'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.client_name || 'Аноним'}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.comment ? (
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        ) : (
                          <p className="text-gray-400 italic text-sm">Отзыв без комментария</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - форма бронирования */}
          <aside
            id="booking-form"
            className="mt-8 lg:mt-0"
          >
            <div className="lg:sticky lg:top-24 lg:z-40 [transition:none!important]">
              <Card className="shadow-2xl border-2 border-airbnb-rausch/20 overflow-hidden">
              <div className="bg-gradient-to-r from-airbnb-rausch to-pink-600 p-6 text-white text-center">
                  <p className="text-4xl font-bold mb-2">{formatRUB(tour.price)}</p>
                  <p className="text-white/90">за человека</p>
                  </div>

                <CardContent className="p-6">
                  {showSuccess ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Заявка отправлена!</h3>
                      <p className="text-gray-600">Гид свяжется с вами в ближайшее время</p>
                    </motion.div>
                  ) : (
                  <div className="space-y-4">
                    <div>
                        <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                          <CalendarIcon size={16} />
                          Дата экскурсии
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                          className="border-2 focus:border-airbnb-rausch"
                        />
                    </div>

                    <div>
                        <Label htmlFor="participants" className="flex items-center gap-2 mb-2">
                          <Users size={16} />
                          Количество участников
                        </Label>
                        <Input
                          id="participants"
                          type="number"
                          min="1"
                          value={bookingData.participants}
                          onChange={(e) => setBookingData({ ...bookingData, participants: parseInt(e.target.value) })}
                          className="border-2 focus:border-airbnb-rausch"
                        />
                    </div>

                      <div>
                        <Label htmlFor="name">Ваше имя</Label>
                    <Input
                          id="name"
                      value={bookingData.clientName}
                      onChange={(e) => setBookingData({ ...bookingData, clientName: e.target.value })}
                          placeholder="Иван Иванов"
                          className="border-2 focus:border-airbnb-rausch"
                    />
                      </div>

                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                    <Input
                          id="phone"
                      type="tel"
                      value={bookingData.clientPhone}
                      onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                          placeholder="+7 (999) 123-45-67"
                          className="border-2 focus:border-airbnb-rausch"
                    />
                      </div>

                      <div>
                        <Label htmlFor="email">Email (необязательно)</Label>
                    <Input
                          id="email"
                      type="email"
                      value={bookingData.clientEmail}
                      onChange={(e) => setBookingData({ ...bookingData, clientEmail: e.target.value })}
                          placeholder="ivan@example.com"
                          className="border-2 focus:border-airbnb-rausch"
                    />
                  </div>

                      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border-2 border-green-200">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700">Цена за человека:</span>
                          <span className="font-semibold">{formatRUB(tour.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-gray-700">Участников:</span>
                          <span className="font-semibold">{bookingData.participants}</span>
                    </div>
                        <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Итого:</span>
                          <span className="text-3xl font-bold text-green-700">{formatRUB(totalPrice)}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleBooking}
                    disabled={!bookingData.date || !bookingData.clientName || !bookingData.clientPhone || bookingMutation.isPending}
                        className="w-full bg-gradient-to-r from-airbnb-rausch to-pink-600 hover:from-airbnb-rausch/90 hover:to-pink-600/90 text-white py-6 text-lg shadow-lg"
                  >
                    {bookingMutation.isPending ? 'Обработка...' : 'Забронировать'}
                  </Button>

                      <p className="text-xs text-gray-500 text-center">
                        После бронирования гид свяжется с вами для подтверждения
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        {/* Похожие туры */}
        {relatedTours.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Похожие экскурсии</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedTours.map((relatedTour: Tour) => (
                <TourCard key={relatedTour.id} tour={relatedTour} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Кнопка прокрутки к форме бронирования - только на мобильных */}
      <button
        onClick={() => {
          const bookingForm = document.getElementById('booking-form')
          if (bookingForm) {
            const yOffset = -80 // Отступ сверху для хедера
            const y = bookingForm.getBoundingClientRect().top + window.pageYOffset + yOffset
            window.scrollTo({ top: y, behavior: 'smooth' })
          }
        }}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-airbnb-rausch text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-airbnb-rausch/90 hover:scale-110 transition-all md:hidden"
        aria-label="Перейти к форме бронирования"
      >
        <ArrowDown size={20} />
      </button>

      <PublicFooter />
    </div>
  )
}
