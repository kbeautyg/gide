import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatRUB } from '@/lib/utils'

export default function AllToursPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  // Загружаем ВСЕ экскурсии (включая неактивные)
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['all-tours'],
    queryFn: async () => {
      // Используем прямой API запрос для получения всех туров
      const response = await api.get('/tours/?page_size=1000')
      return response.data
    },
  })

  // Активация экскурсии
  const activateMutation = useMutation({
    mutationFn: async (tourId: number) => {
      await api.put(`/tours/${tourId}/activate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tours'] })
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      alert('✅ Экскурсия активирована и появится на главной!')
    },
  })

  // Деактивация экскурсии
  const deactivateMutation = useMutation({
    mutationFn: async (tourId: number) => {
      await api.put(`/tours/${tourId}/deactivate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tours'] })
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      alert('✅ Экскурсия деактивирована и убрана с главной!')
    },
  })

  const allTours = toursData?.tours || []
  const activeTours = allTours.filter((t: any) => t.active)
  const inactiveTours = allTours.filter((t: any) => !t.active)

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
          <h1 className="text-3xl font-bold">Все экскурсии системы</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Управление публикацией экскурсий на главной странице' : 'Просмотр всех экскурсий'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Активные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeTours.length}</div>
            <p className="text-xs text-gray-500 mt-1">Опубликованы на главной</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">Неактивные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{inactiveTours.length}</div>
            <p className="text-xs text-gray-500 mt-1">Ждут активации</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">Всего</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{allTours.length}</div>
            <p className="text-xs text-gray-500 mt-1">Экскурсий в системе</p>
          </CardContent>
        </Card>
      </div>

      {/* Неактивные экскурсии (ждут активации) */}
      {inactiveTours.length > 0 && isAdmin && (
        <Card className="border-2 border-orange-300">
          <CardHeader>
            <CardTitle className="text-orange-600">⏳ Экскурсии ожидают активации</CardTitle>
            <CardDescription>
              Эти экскурсии НЕ видны на главной странице. Нажмите "Активировать" чтобы опубликовать.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveTours.map((tour: any) => (
                <Card key={tour.id} className="border-orange-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{tour.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {tour.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {tour.duration}ч
                          </span>
                          <span className="font-semibold text-tropical-ocean">
                            {formatRUB(tour.price)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Создана: {tour.guide_name || `ID ${tour.guide_id}`}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="tropical"
                          size="sm"
                          onClick={() => activateMutation.mutate(tour.id)}
                          disabled={activateMutation.isPending}
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Активировать
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/tours/${tour.id}`, '_blank')}
                        >
                          <Eye size={16} className="mr-1" />
                          Просмотр
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Активные экскурсии (на главной) */}
      {activeTours.length > 0 && (
        <Card className="border-2 border-green-300">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Активные экскурсии (опубликованы)</CardTitle>
            <CardDescription>
              Эти экскурсии видны на главной странице и доступны для бронирования
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {activeTours.map((tour: any) => (
                <Card key={tour.id} className="border-green-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">{tour.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {tour.location}
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatRUB(tour.price)}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deactivateMutation.mutate(tour.id)}
                          disabled={deactivateMutation.isPending}
                        >
                          <XCircle size={16} className="mr-1" />
                          Убрать
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {allTours.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <p>Экскурсий пока нет</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}