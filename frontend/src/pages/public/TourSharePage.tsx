import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Clock, Calendar, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function TourSharePage() {
  const { code } = useParams<{ code: string }>()
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    participants_count: 1,
    date: '',
  })
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour-by-code', code],
    queryFn: async () => {
      const response = await api.get(`/tours/by-code/${code}`)
      return response.data
    },
  })

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
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Ошибка при бронировании')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    bookingMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tropical-turquoise/10 to-tropical-ocean/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tropical-ocean"></div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-2xl font-bold text-gray-900 mb-2">Экскурсия не найдена</p>
            <p className="text-gray-600">Проверьте правильность ссылки</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-tropical-turquoise/20 flex items-center justify-center p-4">
        <Card className="max-w-2xl">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Бронирование оформлено!</h1>
            <p className="text-lg text-gray-700 mb-6">
              Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для подтверждения деталей.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm text-gray-600 mb-1">Экскурсия:</p>
              <p className="font-bold text-lg mb-3">{tour.title}</p>
              <p className="text-sm text-gray-600 mb-1">Клиент:</p>
              <p className="font-semibold">{formData.client_name}</p>
              <p className="text-sm text-gray-600">{formData.client_phone}</p>
              <p className="text-sm text-gray-600 mt-3 mb-1">К оплате:</p>
              <p className="text-2xl font-bold text-tropical-ocean">{formatRUB(tour.price * formData.participants_count)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tropical-turquoise/10 via-white to-tropical-ocean/10 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Tour Info */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative">
            <img
              src={tour.photos[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800'}
              alt={tour.title}
              className="w-full h-80 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h1 className="text-4xl font-bold text-white mb-2">{tour.title}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-1">
                  <MapPin size={18} />
                  {tour.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={18} />
                  {tour.duration} часов
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={18} />
                  {tour.start_date && tour.end_date 
                    ? `${new Date(tour.start_date).toLocaleDateString('ru-RU')} - ${new Date(tour.end_date).toLocaleDateString('ru-RU')}`
                    : 'По запросу'
                  }
                </span>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-tropical-ocean/5 rounded-lg">
                <p className="text-4xl font-bold text-tropical-ocean mb-1">{formatRUB(tour.price)}</p>
                <p className="text-sm text-gray-600">За человека</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-4xl font-bold text-blue-600 mb-1">{tour.duration}ч</p>
                <p className="text-sm text-gray-600">Продолжительность</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-4xl font-bold text-green-600 mb-1">{tour.rating}</p>
                <p className="text-sm text-gray-600">Рейтинг</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Описание</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description}</p>
            </div>

            {tour.photos && tour.photos.length > 1 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Фотогалерея</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tour.photos.slice(1).map((photo: string, i: number) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`${tour.title} - фото ${i + 2}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-tropical-ocean to-tropical-turquoise text-white">
            <CardTitle className="text-2xl">Забронировать экскурсию</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="client_name">Ваше имя *</Label>
                  <Input
                    id="client_name"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Иван Иванов"
                  />
                </div>

                <div>
                  <Label htmlFor="client_phone">Телефон *</Label>
                  <Input
                    id="client_phone"
                    required
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    placeholder="ivan@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="date">Желаемая дата *</Label>
                  <Input
                    id="date"
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="participants_count">Количество участников *</Label>
                <Input
                  id="participants_count"
                  required
                  type="number"
                  min="1"
                  value={formData.participants_count}
                  onChange={(e) => setFormData({ ...formData, participants_count: parseInt(e.target.value) })}
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Стоимость за человека:</span>
                  <span className="font-semibold">{formatRUB(tour.price)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Количество участников:</span>
                  <span className="font-semibold">{formData.participants_count}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold">Итого к оплате:</span>
                  <span className="text-2xl font-bold text-tropical-ocean">
                    {formatRUB(tour.price * formData.participants_count)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="tropical"
                className="w-full text-lg py-6"
                disabled={bookingMutation.isPending}
              >
                {bookingMutation.isPending ? 'Обработка...' : 'Забронировать и оплатить'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                После бронирования с вами свяжется гид для подтверждения деталей и оплаты
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
