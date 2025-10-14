import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  MapPin, Clock, Calendar, CheckCircle, Users, DollarSign,
  Star, Heart, Share2, Sparkles, Gift, Trophy, Shield,
  MessageCircle, Phone, Mail, User, CalendarDays, PartyPopper
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

export default function TourSharePage() {
  const { code } = useParams<{ code: string }>()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    participants_count: 1,
    date: '',
  })
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Автообновление данных тура
  useAutoRefresh({
    queryKeys: [['tour-by-code', code || '']],
    intervalMs: 30000, // Каждые 30 сек
  })

  const { data: tourResponse, isLoading } = useQuery({
    queryKey: ['tour-by-code', code],
    queryFn: async () => {
      const response = await api.get(`/tours/by-code/${code}`)
      return response.data
    },
    enabled: !!code,
  })

  const tour = tourResponse?.tour
  const clientData = tourResponse?.client_data

  // Предзаполнение формы данными из заявки
  useEffect(() => {
    if (clientData) {
      setFormData({
        client_name: clientData.client_name || '',
        client_phone: clientData.client_phone || '',
        client_email: clientData.client_email || '',
        participants_count: clientData.participants_count || 1,
        date: clientData.assigned_date || clientData.preferred_date || '',
      })
    }
  }, [clientData])

  const bookingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/bookings/', {
        tour_id: tour.id,
        ...data,
      })
      return response.data
    },
    onSuccess: () => {
      setBookingSuccess(true)
      
      // Конфетти!
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FF385C', '#00A699', '#FC642D', '#FFD700', '#00D0B0']
      })
      
      toast.success('Бронирование успешно!', 'Гид свяжется с вами в ближайшее время')
      queryClient.invalidateQueries({ queryKey: ['tour-by-code', code] })
    },
    onError: (error: any) => {
      toast.error('Ошибка при бронировании', error.response?.data?.detail)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    bookingMutation.mutate(formData)
  }

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-airbnb-rausch border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium text-lg">Загрузка экскурсии...</p>
        </motion.div>
      </div>
    )
  }

  // Not found state
  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="max-w-md shadow-2xl">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-red-600" size={48} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Экскурсия не найдена</h1>
              <p className="text-gray-600 mb-6">Проверьте правильность ссылки или свяжитесь с гидом</p>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                На главную
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Success state
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          <Card className="shadow-2xl overflow-hidden border-2 border-green-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <PartyPopper className="text-green-600" size={56} strokeWidth={2.5} />
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-2">Бронирование оформлено!</h1>
              <p className="text-green-50 text-lg">Ваша заявка успешно отправлена гиду</p>
            </div>

            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Статус</p>
                    <p className="text-lg font-bold text-green-700">Подтверждается</p>
                  </div>
                </div>

                <div className="space-y-3 text-gray-800">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold">{tour.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <span>{formData.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>{formData.client_phone}</span>
                  </div>
                  {formData.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <span>{new Date(formData.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-600" />
                    <span>{formData.participants_count} {formData.participants_count === 1 ? 'участник' : 'участников'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-airbnb-rausch/10 to-pink-100 p-6 rounded-2xl mb-6">
                <p className="text-sm text-gray-600 mb-2">К оплате</p>
                <p className="text-4xl font-bold text-airbnb-rausch">
                  {formatRUB(tour.price * formData.participants_count)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatRUB(tour.price)} × {formData.participants_count}
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl mb-6">
                <p className="text-sm text-blue-900">
                  <strong>Что дальше?</strong> Гид свяжется с вами в ближайшее время для подтверждения деталей и согласования способа оплаты.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1 py-6 text-lg"
                >
                  На главную
                </Button>
                <Button
                  onClick={() => setBookingSuccess(false)}
                  className="flex-1 bg-gradient-to-r from-airbnb-rausch to-pink-600 hover:from-airbnb-rausch/90 hover:to-pink-600/90 py-6 text-lg"
                >
                  Ещё одна заявка
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Main tour page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[60vh] overflow-hidden"
        >
          <img
            src={tour.photos[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200'}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Floating action buttons */}
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

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-airbnb-rausch to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white text-sm px-4 py-1">
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
                  {tour.start_date && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">
                        {new Date(tour.start_date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Tour info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{formatRUB(tour.price)}</p>
                  <p className="text-xs text-blue-700">За человека</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">{tour.duration}ч</p>
                  <p className="text-xs text-green-700">Длительность</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-900">{tour.rating || '5.0'}</p>
                  <p className="text-xs text-yellow-700">Рейтинг</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{tour.total_bookings || 0}</p>
                  <p className="text-xs text-purple-700">Бронирований</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Gift className="w-6 h-6 text-airbnb-rausch" />
                    Описание экскурсии
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {tour.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Photo gallery */}
            {tour.photos && tour.photos.length > 1 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      Фотогалерея
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {tour.photos.slice(1, 7).map((photo: string, i: number) => (
                        <motion.img
                          key={i}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
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
              transition={{ delay: 0.6 }}
              className="sticky top-6"
            >
              <Card className="backdrop-blur-lg bg-white/90 border-2 border-airbnb-rausch/30 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-airbnb-rausch to-pink-600 p-6 text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">Забронировать</h2>
                  <p className="text-white/90">Заполните форму и мы свяжемся с вами</p>
                </div>

                <CardContent className="p-6">
                  {clientData && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="font-bold text-green-900">Ваши данные уже заполнены!</p>
                      </div>
                      <p className="text-sm text-green-700">
                        Данные взяты из вашей заявки. Проверьте их и нажмите "Подтвердить и оплатить".
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="client_name" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <User className="w-4 h-4" />
                        Ваше имя *
                      </Label>
                      <Input
                        id="client_name"
                        required
                        value={formData.client_name}
                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        placeholder="Иван Иванов"
                        className={`border-2 focus:border-airbnb-rausch ${clientData ? 'bg-green-50' : ''}`}
                        readOnly={!!clientData}
                      />
                    </div>

                    <div>
                      <Label htmlFor="client_phone" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Phone className="w-4 h-4" />
                        Телефон *
                      </Label>
                      <Input
                        id="client_phone"
                        required
                        type="tel"
                        value={formData.client_phone}
                        onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                        placeholder="+7 (999) 123-45-67"
                        className={`border-2 focus:border-airbnb-rausch ${clientData ? 'bg-green-50' : ''}`}
                        readOnly={!!clientData}
                      />
                    </div>

                    <div>
                      <Label htmlFor="client_email" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Mail className="w-4 h-4" />
                        Email (опционально)
                      </Label>
                      <Input
                        id="client_email"
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                        placeholder="ivan@example.com"
                        className={`border-2 focus:border-airbnb-rausch ${clientData ? 'bg-green-50' : ''}`}
                        readOnly={!!clientData}
                      />
                    </div>

                    <div>
                      <Label htmlFor="date" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <CalendarDays className="w-4 h-4" />
                        Дата экскурсии *
                      </Label>
                      <Input
                        id="date"
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={`border-2 focus:border-airbnb-rausch ${clientData ? 'bg-green-50 font-bold text-green-800' : ''}`}
                        readOnly={!!clientData}
                      />
                      {clientData && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Дата согласована с гидом
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="participants_count" className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                        <Users className="w-4 h-4" />
                        Количество участников *
                      </Label>
                      <Input
                        id="participants_count"
                        required
                        type="number"
                        min="1"
                        max="20"
                        value={formData.participants_count}
                        onChange={(e) => setFormData({ ...formData, participants_count: parseInt(e.target.value) })}
                        className={`border-2 focus:border-airbnb-rausch ${clientData ? 'bg-green-50' : ''}`}
                        readOnly={!!clientData}
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
                          <span className="font-semibold">{formData.participants_count}</span>
                        </div>
                        <div className="border-t-2 border-green-300 pt-2 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Итого:</span>
                          <span className="text-3xl font-bold text-green-700">
                            {formatRUB(tour.price * formData.participants_count)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={bookingMutation.isPending}
                      className="w-full bg-gradient-to-r from-airbnb-rausch to-pink-600 hover:from-airbnb-rausch/90 hover:to-pink-600/90 text-white text-lg py-7 shadow-xl hover:shadow-2xl transition-all group"
                    >
                      {bookingMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Обработка...
                        </>
                      ) : clientData ? (
                        <>
                          <CheckCircle className="mr-2 group-hover:scale-110 transition-transform" />
                          Подтвердить и оплатить
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
                  </form>
                </CardContent>
              </Card>

              {/* Contact info */}
              {tour.guide && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card className="mt-6 backdrop-blur-lg bg-white/80 border-2 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ваш гид</p>
                          <p className="font-bold text-gray-900">{tour.guide.name || 'Профессиональный гид'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Опытный гид с отличными отзывами. Готов ответить на ваши вопросы!
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
)
