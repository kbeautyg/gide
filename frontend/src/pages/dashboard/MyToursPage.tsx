import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateTourDialog } from '@/components/CreateTourDialog'
import { MapPin, Clock, Star, Edit, Trash2 } from 'lucide-react'
import { toursApi } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function MyToursPage() {
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList(),
  })

  const tours = toursData?.data?.tours || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Мои экскурсии</h1>
          <p className="text-gray-600">Управление вашими экскурсиями</p>
        </div>
        <CreateTourDialog />
      </div>

      {isLoading ? (
        <p className="text-center py-12 text-gray-600">Загрузка...</p>
      ) : tours.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">
              У вас пока нет экскурсий. Создайте первую!
            </p>
            <CreateTourDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="flex flex-col">
              <div className="relative">
                <img
                  src={tour.photos[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800'}
                  alt={tour.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                  {formatRUB(tour.price)}
                </div>
              </div>

              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span>{tour.location}</span>
                  <Clock size={16} className="ml-auto" />
                  <span>{tour.duration} ч</span>
                </div>
                <CardTitle className="text-lg">{tour.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <span className="font-semibold">{tour.rating}</span>
                  <span className="text-gray-600">({tour.reviews_count} отзывов)</span>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit size={16} className="mr-1" />
                  Редактировать
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 size={16} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}