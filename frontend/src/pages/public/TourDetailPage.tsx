import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  MapPin, Clock, Star, Calendar, Users, ArrowLeft, 
  Heart, Share2, CheckCircle, XCircle, Image as ImageIcon,
  ChevronLeft, ChevronRight, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toursApi, bookingsApi } from '@/lib/api'
import { formatRUB } from '@/lib/utils'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { TourCard } from '@/components/TourCard'

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: '',
    participants: 1,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState<number[]>([])

  // Загрузка экскурсии
  const { data: tourData, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => toursApi.getById(id!),
    enabled: !!id,
  })

  // Загрузка отзывов
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetch(`/api/v1/reviews/${id}`).then(res => res.json()),
    enabled: !!id,
  })

  const tour = tourData?.data
  const reviews = reviewsData || []

  // Создание бронирования
  const bookingMutation = useMutation({
    mutationFn: () => bookingsApi.create({
      tour_id: Number(id),
      date: bookingData.date,
      participants_count: bookingData.participants,
      client_name: bookingData.clientName,
      client_phone: bookingData.clientPhone,
      client_email: bookingData.clientEmail || undefined,
    }),
    onSuccess: () => {
      setShowSuccess(true)
      setBookingData({
        date: '',
        participants: 1,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
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

  const toggleReviewExpand = (index: number) => {
    setExpandedReviews(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
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

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <Link to="/" className="hover:underline">Главная</Link>
            {' > '}
            <Link to="/tours" className="hover:underline">Все туры</Link>
            {' > '}
            <span className="text-gray-900 font-medium line-clamp-1">{tour.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero галерея 2×2 */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 h-[500px] rounded-xl overflow-hidden">
            {/* Большое фото слева */}
            <div
              className="col-span-2 row-span-2 cursor-pointer relative group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={photos[0]}
                alt={tour.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* 4 миниатюры справа */}
            {photos.slice(1, 5).map((photo, i) => (
              <div
                key={i}
                className="cursor-pointer relative group"
                onClick={() => setShowAllPhotos(true)}
              >
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-8">
            {/* Заголовок и действия */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{tour.location}</span>
                  <span className="mx-2">•</span>
                  <Clock size={16} />
                  <span>{tour.duration} часов</span>
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
                  <Star size={18} className="fill-gray-900 text-gray-900" />
                  <span className="font-semibold text-lg">{tour.rating.toFixed(2)}</span>
                </div>
                <a href="#reviews" className="text-gray-900 underline hover:text-gray-700">
                  {tour.reviews_count} отзыв{tour.reviews_count === 1 ? '' : tour.reviews_count < 5 ? 'а' : 'ов'}
                </a>
              </div>
            </div>

            {/* Основное описание */}
            <Card className="border-0 shadow-airbnb">
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {tour.description}
                </p>
              </CardContent>
            </Card>

            {/* Что вас ожидает */}
            {tour.what_to_expect && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Что вас ожидает</h2>
                <Card className="border-0 shadow-airbnb">
                  <CardContent className="p-8">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {tour.what_to_expect}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Организационные детали */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Организационные детали</h2>
              <Card className="border-0 shadow-airbnb">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Что включено */}
                    {tour.included && tour.included.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-900">Что включено</h3>
                        <ul className="space-y-2">
                          {tour.included.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700">
                              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Что НЕ включено */}
                    {tour.not_included && tour.not_included.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-900">Что НЕ включено</h3>
                        <ul className="space-y-2">
                          {tour.not_included.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700">
                              <XCircle size={18} className="text-gray-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Дополнительная информация */}
                  <div className="mt-6 pt-6 border-t grid md:grid-cols-2 gap-4 text-sm">
                    {tour.meeting_point && (
                      <div>
                        <span className="font-semibold text-gray-900">Место встречи:</span> {tour.meeting_point}
                      </div>
                    )}
                    {tour.max_group_size && (
                      <div>
                        <span className="font-semibold text-gray-900">Макс. размер группы:</span> {tour.max_group_size} человек
                      </div>
                    )}
                    {tour.min_age && (
                      <div>
                        <span className="font-semibold text-gray-900">Минимальный возраст:</span> {tour.min_age}+ лет
                      </div>
                    )}
                    {tour.difficulty_level && (
                      <div>
                        <span className="font-semibold text-gray-900">Сложность:</span> {tour.difficulty_level}
                      </div>
                    )}
                    {tour.languages && tour.languages.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-900">Языки:</span> {tour.languages.join(', ')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Отзывы */}
            <div id="reviews">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Отзывы <span className="text-gray-600 font-normal">({reviews.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <Star size={20} className="fill-gray-900 text-gray-900" />
                  <span className="text-xl font-bold">{tour.rating.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {reviews.length > 0 ? (
                  reviews.map((review: any, i: number) => (
                    <motion.div
                      key={i}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <img
                          src={review.user_photo || 'https://i.pravatar.cc/150?img=' + i}
                          alt={review.user_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{review.user_name}</div>
                          <div className="flex items-center gap-1 mb-1">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star
                                key={j}
                                size={14}
                                className={j < review.rating ? 'fill-gray-900 text-gray-900' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-gray-500">
                            Опыт: {review.experience_count} экскурси{review.experience_count === 1 ? 'я' : 'й'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('ru')}
                        </div>
                      </div>
                      
                      <p className={expandedReviews.includes(i) ? 'text-gray-700' : 'text-gray-700 line-clamp-3'}>
                        {review.text}
                      </p>
                      
                      {review.text.length > 200 && (
                        <button
                          onClick={() => toggleReviewExpand(i)}
                          className="text-sm text-gray-900 underline mt-2 hover:text-gray-700"
                        >
                          {expandedReviews.includes(i) ? 'Свернуть' : 'ещё'}
                        </button>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    Пока нет отзывов. Станьте первым!
                  </div>
                )}
              </div>
            </div>

            {/* Похожие экскурсии */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Вам также может понравиться</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Mock похожих туров */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton rounded-xl h-[360px]" />
                ))}
              </div>
            </div>

            {/* SEO-блок */}
            {tour.long_description && (
              <div className="prose prose-lg max-w-none pt-8 border-t">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Экскурсии в {tour.location}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {tour.long_description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar бронирования */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-0 shadow-airbnb-lg">
                <CardContent className="p-6 space-y-6">
                  {/* Цена */}
                  <div className="pb-6 border-b">
                    <div className="flex items-baseline gap-2 mb-1">
                      {tour.has_discount && tour.original_price ? (
                        <>
                          <span className="text-gray-400 line-through text-lg">
                            {formatRUB(tour.original_price)}
                          </span>
                          <span className="text-3xl font-bold text-gray-900">
                            {formatRUB(tour.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">
                          {formatRUB(tour.price)}
                        </span>
                      )}
                      <span className="text-gray-600">за человека</span>
                    </div>
                    {tour.has_discount && (
                      <Badge variant="discount" className="mt-2">
                        Скидка {tour.discount_percentage}%
                      </Badge>
                    )}
                  </div>

                  {/* Форма бронирования */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date" className="text-sm font-semibold">Дата экскурсии</Label>
                      <Input
                        id="date"
                        type="date"
                        className="mt-2 rounded-lg"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label htmlFor="participants" className="text-sm font-semibold">Количество гостей</Label>
                      <div className="flex items-center justify-between mt-2 border border-gray-300 rounded-lg px-4 py-3">
                        <span>Взрослые</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setBookingData({ ...bookingData, participants: Math.max(1, bookingData.participants - 1) })}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{bookingData.participants}</span>
                          <button
                            onClick={() => setBookingData({ ...bookingData, participants: bookingData.participants + 1 })}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <Input
                      placeholder="Ваше имя"
                      value={bookingData.clientName}
                      onChange={(e) => setBookingData({ ...bookingData, clientName: e.target.value })}
                      className="rounded-lg"
                    />
                    <Input
                      type="tel"
                      placeholder="Телефон"
                      value={bookingData.clientPhone}
                      onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                      className="rounded-lg"
                    />
                    <Input
                      type="email"
                      placeholder="Email (необязательно)"
                      value={bookingData.clientEmail}
                      onChange={(e) => setBookingData({ ...bookingData, clientEmail: e.target.value })}
                      className="rounded-lg"
                    />
                  </div>

                  {/* Расчёт стоимости */}
                  <div className="pt-6 border-t space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>{formatRUB(tour.price)} × {bookingData.participants}</span>
                      <span>{formatRUB(tour.price * bookingData.participants)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                      <span>Итого:</span>
                      <span>{formatRUB(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Кнопка бронирования */}
                  {showSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <CheckCircle size={18} />
                      <span><strong>Успешно!</strong> Бронирование создано</span>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleBooking}
                    disabled={!bookingData.date || !bookingData.clientName || !bookingData.clientPhone || bookingMutation.isPending}
                    className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch/90 text-white text-lg py-6 rounded-lg"
                  >
                    {bookingMutation.isPending ? 'Обработка...' : 'Забронировать'}
                  </Button>

                  {bookingMutation.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                      <strong>Ошибка:</strong> Не удалось создать бронирование
                    </div>
                  )}

                  {/* Гарантии */}
                  <div className="pt-6 border-t space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-airbnb-babu shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">Гарантия лучшей цены</div>
                        <div className="text-gray-600">Если найдёте цену ниже, мы вернём разницу</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-airbnb-babu shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">Моментальное бронирование</div>
                        <div className="text-gray-600">Без ожидания ответа гида</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield size={18} className="text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">Возврат при отмене</div>
                        <div className="text-gray-600">За 48 часов до начала</div>
                      </div>
                    </div>
                  </div>

                  {/* Блок гида */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users size={24} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Ваш гид</div>
                        <div className="text-sm text-gray-600">Отвечает в течение 10 минут</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
