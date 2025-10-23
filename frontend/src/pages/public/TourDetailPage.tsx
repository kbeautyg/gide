import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  MapPin, Clock, Star, Users, DollarSign,
  Heart, Share2, CheckCircle, XCircle, Image as ImageIcon,
  Shield, Calendar as CalendarIcon, Gift, Sparkles, Trophy,
  Info, Check, X, Phone, Mail, User as UserIcon, MessageCircle
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toursApi, bookingsApi, api } from '@/lib/api'
import type { Tour } from '@/types/tour'
import { formatRUB } from '@/lib/utils'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { toast } from '@/lib/toast'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

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

  // Автообновление данных
  useAutoRefresh({
    queryKeys: [['tour', id!]],
    intervalMs: 30000,
  })

  // Загрузка экскурсии
  const { data: tourData, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => toursApi.getById(id!),
    enabled: !!id,
  })

  const tour = tourData?.data as Tour | undefined

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
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FF385C', '#00A699', '#FC642D', '#FFD700']
      })
      toast.success('Бронирование успешно!', 'Гид свяжется с вами в ближайшее время')
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
    onError: (error: any) => {
      toast.error('Ошибка при бронировании', error.response?.data?.detail)
    }
  })

  const handleShare = () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      navigator.share({
        title: tour?.title,
        text: tour?.description?.substring(0, 100),
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success('Ссылка скопирована!', 'Поделитесь с друзьями')
    }
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.info(isFavorite ? 'Убрано из избранного' : 'Добавлено в избранное')
  }

  const handleBooking = () => {
    if (!bookingData.date || !bookingData.clientName || !bookingData.clientPhone) {
      toast.error('Заполните обязательные поля')
      return
    }
    bookingMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-airbnb-rausch border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-2xl font-bold text-gray-900 mb-2">Экскурсия не найдена</p>
            <p className="text-gray-600">Попробуйте выбрать другую экскурсию</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const photos = tour.photos?.length > 0 
    ? tour.photos 
    : ['https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&h=800&fit=crop']

  const totalPrice = tour.price * bookingData.participants

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <PublicHeader />

      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={photos[0]}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Action buttons */}
        <div className="absolute top-6 right-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavorite}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <Share2 className="w-6 h-6 text-gray-700" />
          </motion.button>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-airbnb-rausch to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-green-500 text-white px-4 py-1">
                  Доступно
                </Badge>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {tour.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/95">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">{tour.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">{tour.duration} часов</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{tour.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Info blocks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats blocks */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{formatRUB(tour.price)}</p>
                  <p className="text-xs text-blue-700">За человека</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">{tour.duration}ч</p>
                  <p className="text-xs text-green-700">Длительность</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">{tour.rating?.toFixed(1) || '5.0'}</p>
                  <p className="text-xs text-yellow-700">Рейтинг</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{tour.total_bookings || 0}</p>
                  <p className="text-xs text-purple-700">Бронирований</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/50 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Описание экскурсии</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {tour.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* What to expect */}
            {tour.what_to_expect && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/50 shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Что вас ожидает</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {tour.what_to_expect}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Included / Not included */}
            {((tour.included && tour.included.length > 0) || (tour.not_included && tour.not_included.length > 0)) && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/50 shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Что включено</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Included */}
                      {tour.included && tour.included.length > 0 && (
                        <div>
                          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            Что включено
                          </h3>
                          <ul className="space-y-3">
                            {tour.included.map((item, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Not included */}
                      {tour.not_included && tour.not_included.length > 0 && (
                        <div>
                          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-700">
                            <XCircle className="w-5 h-5" />
                            Что не включено
                          </h3>
                          <ul className="space-y-3">
                            {tour.not_included.map((item, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <X className="w-4 h-4 text-red-600" />
                                </div>
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Organizational details */}
            {(tour.meeting_point || tour.max_group_size || tour.min_age || tour.difficulty_level || (tour.languages && tour.languages.length > 0)) && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/50 shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Организационные детали</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {tour.meeting_point && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Место встречи</p>
                            <p className="text-gray-700">{tour.meeting_point}</p>
                          </div>
                        </div>
                      )}

                      {tour.max_group_size && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Размер группы</p>
                            <p className="text-gray-700">Максимум {tour.max_group_size} человек</p>
                          </div>
                        </div>
                      )}

                      {tour.languages && tour.languages.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Языки</p>
                            <p className="text-gray-700">{tour.languages.join(', ')}</p>
                          </div>
                        </div>
                      )}

                      {tour.difficulty_level && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Сложность</p>
                            <p className="text-gray-700">{tour.difficulty_level}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Photo gallery */}
            {photos.length > 1 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/50 shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Фотогалерея</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.slice(1, 7).map((photo, i) => (
                        <motion.img
                          key={i}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          src={photo}
                          alt={`${tour.title} - фото ${i + 2}`}
                          className="w-full h-48 object-cover rounded-xl shadow-lg cursor-pointer"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right column - Booking form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="sticky top-6"
            >
              {showSuccess ? (
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">Успешно!</h3>
                    <p className="text-green-700 mb-6">Ваша заявка отправлена. Гид свяжется с вами в ближайшее время.</p>
                    <Button
                      onClick={() => setShowSuccess(false)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Закрыть
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="backdrop-blur-lg bg-white/90 border-2 border-airbnb-rausch/30 shadow-2xl">
                  <div className="bg-gradient-to-r from-airbnb-rausch to-pink-600 p-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Забронировать</h2>
                    <p className="text-white/90">Заполните форму и мы свяжемся с вами</p>
                  </div>

                  <CardContent className="p-6 space-y-5">
                    <div>
                      <Label htmlFor="clientName" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <UserIcon className="w-4 h-4" />
                        Ваше имя *
                      </Label>
                      <Input
                        id="clientName"
                        required
                        value={bookingData.clientName}
                        onChange={(e) => setBookingData({ ...bookingData, clientName: e.target.value })}
                        placeholder="Иван Иванов"
                        className="border-2 focus:border-airbnb-rausch"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientPhone" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Phone className="w-4 h-4" />
                        Телефон *
                      </Label>
                      <Input
                        id="clientPhone"
                        required
                        type="tel"
                        value={bookingData.clientPhone}
                        onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                        placeholder="+7 (999) 123-45-67"
                        className="border-2 focus:border-airbnb-rausch"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientEmail" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Mail className="w-4 h-4" />
                        Email (опционально)
                      </Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={bookingData.clientEmail}
                        onChange={(e) => setBookingData({ ...bookingData, clientEmail: e.target.value })}
                        placeholder="ivan@example.com"
                        className="border-2 focus:border-airbnb-rausch"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        Желаемая дата *
                      </Label>
                      <Input
                        id="date"
                        required
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        className="border-2 focus:border-airbnb-rausch"
                      />
                    </div>

                    <div>
                      <Label htmlFor="participants" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Users className="w-4 h-4" />
                        Количество участников *
                      </Label>
                      <Input
                        id="participants"
                        required
                        type="number"
                        min="1"
                        max="20"
                        value={bookingData.participants}
                        onChange={(e) => setBookingData({ ...bookingData, participants: parseInt(e.target.value) })}
                        className="border-2 focus:border-airbnb-rausch"
                      />
                    </div>

                    {/* Price calculation */}
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-xl border-2 border-green-200">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Стоимость за человека:</span>
                          <span className="font-semibold">{formatRUB(tour.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Участников:</span>
                          <span className="font-semibold">{bookingData.participants}</span>
                        </div>
                        <div className="border-t-2 border-green-300 pt-2 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Итого:</span>
                          <span className="text-3xl font-bold text-green-700">
                            {formatRUB(totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleBooking}
                      disabled={bookingMutation.isPending}
                      className="w-full bg-gradient-to-r from-airbnb-rausch to-pink-600 hover:from-airbnb-rausch/90 hover:to-pink-600/90 text-white text-lg py-7 shadow-xl group"
                    >
                      {bookingMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Обработка...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 group-hover:rotate-12 transition-transform" />
                          Забронировать экскурсию
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      <p>После бронирования гид свяжется с вами для подтверждения</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
