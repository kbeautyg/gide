import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { MapPin, Clock, Star, Calendar, Users, ArrowLeft, UserCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toursApi, bookingsApi } from '@/lib/api'
import { formatRUB } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

export default function TourDetailPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { id } = useParams<{ id: string }>()
  const [bookingData, setBookingData] = useState({
    date: '',
    participants: 1,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)

  // Загрузка экскурсии
  const { data: tourData, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => toursApi.getById(id!),
    enabled: !!id,
  })

  const tour = tourData?.data

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
      // Сброс формы
      setBookingData({
        date: '',
        participants: 1,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
      })
      // Скрыть сообщение через 5 секунд
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
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Экскурсия не найдена</p>
      </div>
    )
  }

  const totalPrice = tour.price * bookingData.participants

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gradient">
            ThaiGuide Pro
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2" size={18} />
                На главную
              </Button>
            </Link>
            {isAuthenticated && user && (
              <Link to="/dashboard">
                <Button variant="ghost" className="gap-2">
                  <UserCircle size={20} />
                  {user.name || user.phone}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="rounded-lg overflow-hidden">
              <img
                src={tour.photos[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&h=600&fit=crop'}
                alt={tour.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Tour Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span>{tour.location}</span>
                </div>
                <CardTitle className="text-3xl">{tour.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-base mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="fill-yellow-400 text-yellow-400" size={18} />
                    <span className="font-semibold">{tour.rating}</span>
                    <span>({tour.reviews_count} отзывов)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={18} />
                    <span>{tour.duration} часов</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold mb-3">Описание</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {tour.description}
                </p>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Что включено:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✅ Трансфер от отеля и обратно</li>
                    <li>✅ Услуги русскоязычного гида</li>
                    <li>✅ Входные билеты</li>
                    <li>✅ Обед (если указано в программе)</li>
                    <li>✅ Страховка</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Забронировать экскурсию</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-tropical-ocean">
                    {formatRUB(tour.price)}
                  </span>
                  <span className="text-gray-600 ml-2">за человека</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="date">Дата экскурсии</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="participants">Количество участников</Label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="participants"
                      type="number"
                      min="1"
                      max="20"
                      className="pl-10"
                      value={bookingData.participants}
                      onChange={(e) => setBookingData({ ...bookingData, participants: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      {formatRUB(tour.price)} × {bookingData.participants}
                    </span>
                    <span className="font-semibold">{formatRUB(tour.price * bookingData.participants)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Итого:</span>
                    <span className="text-tropical-ocean">{formatRUB(totalPrice)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Ваше имя"
                    value={bookingData.clientName}
                    onChange={(e) => setBookingData({ ...bookingData, clientName: e.target.value })}
                  />
                  <Input
                    type="tel"
                    placeholder="Телефон"
                    value={bookingData.clientPhone}
                    onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Email (необязательно)"
                    value={bookingData.clientEmail}
                    onChange={(e) => setBookingData({ ...bookingData, clientEmail: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                {showSuccess && (
                  <div className="w-full bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                    <CheckCircle size={18} />
                    <span><strong>Успешно!</strong> Бронирование создано</span>
                  </div>
                )}
                <Button
                  variant="tropical"
                  size="lg"
                  className="w-full"
                  disabled={!bookingData.date || !bookingData.clientName || !bookingData.clientPhone || bookingMutation.isPending}
                  onClick={handleBooking}
                >
                  {bookingMutation.isPending ? 'Обработка...' : 'Забронировать сейчас'}
                </Button>
                {bookingMutation.error && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                    <strong>Ошибка:</strong> Не удалось создать бронирование
                  </div>
                )}
                <p className="text-xs text-gray-600 text-center w-full">
                  Нажимая кнопку, вы соглашаетесь с условиями бронирования
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
