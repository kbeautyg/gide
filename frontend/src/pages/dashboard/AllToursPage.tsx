import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function AllToursPage() {
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: async () => {
      const response = await axios.get('https://gide-production.up.railway.app/api/v1/tours/')
      return response.data
    },
  })

  const tours = Array.isArray(toursData) ? toursData : (toursData?.tours || [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Все экскурсии</h1>
        <div className="text-center py-12">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Все экскурсии</h1>
          <p className="text-gray-600 mt-1">Управление всеми экскурсиями в системе</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Всего экскурсий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tours.length}</div>
            <p className="text-xs text-gray-500 mt-1">Активных экскурсий</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Бронирований</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">Всего бронирований</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Средняя цена</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tours && tours.length > 0
                ? Math.round(tours.reduce((sum: number, t: any) => sum + t.price, 0) / tours.length)
                : 0} ₽
            </div>
            <p className="text-xs text-gray-500 mt-1">За экскурсию</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tours.length > 0 ? (
          tours.map((tour: any) => (
            <Card key={tour.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{tour.title}</CardTitle>
                <CardDescription className="line-clamp-2">{tour.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span>{tour.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>{tour.duration} часов</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-tropical-ocean">
                    <DollarSign size={16} />
                    <span>{tour.price} ₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="text-center py-12 text-gray-500">
              <p>Экскурсии не найдены</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
