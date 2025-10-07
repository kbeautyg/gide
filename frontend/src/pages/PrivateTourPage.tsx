import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Star, Calendar, Users, CreditCard } from 'lucide-react'
import { toursApi } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function PrivateTourPage() {
  const { tourId } = useParams<{ tourId: string }>()
  
  const { data: tourData, isLoading, error } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => toursApi.getById(parseInt(tourId!)),
    enabled: !!tourId
  })

  const tour = tourData?.data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tropical-ocean mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка экскурсии...</p>
        </div>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Экскурсия не найдена</h1>
          <p className="text-gray-600">Проверьте правильность ссылки</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Простой header без логотипа */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Экскурсия</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Фотографии */}
          <div className="space-y-4">
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={tour.photos?.[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800'}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {tour.photos && tour.photos.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {tour.photos.slice(1, 4).map((photo: string, index: number) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={photo}
                      alt={`${tour.title} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Информация об экскурсии */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tour.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{tour.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{tour.duration} часов</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <span>{tour.rating}</span>
                  <span className="text-sm">({tour.reviews_count})</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Информация об экскурсии</span>
                  <span className="text-2xl font-bold text-tropical-ocean">
                    {formatRUB(tour.price)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Описание</h3>
                  <p className="text-gray-700 leading-relaxed">{tour.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span>Место: {tour.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>Длительность: {tour.duration} ч</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Категория: {tour.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span>До 20 человек</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Форма бронирования */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard size={20} />
                  Забронировать экскурсию
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-tropical-ocean/10 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Стоимость:</span>
                      <span className="text-xl font-bold text-tropical-ocean">
                        {formatRUB(tour.price)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">за одного человека</p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      variant="tropical" 
                      size="lg" 
                      className="w-full"
                      onClick={() => {
                        // Здесь будет логика бронирования
                        alert('Функция бронирования будет добавлена позже')
                      }}
                    >
                      Забронировать экскурсию
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Оплата производится на месте гиду
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
