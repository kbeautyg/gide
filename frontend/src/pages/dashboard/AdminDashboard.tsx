import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, DollarSign, Calendar, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'

interface AdminStats {
  total_tours: number
  total_guides: number
  total_bookings: number
  total_revenue: number
}

export default function AdminDashboard() {
  // Загрузка статистики
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminStats>('/admin/stats').then(res => res.data),
  })

  // Загрузка всех туров
  const { data: toursData, isLoading: toursLoading } = useQuery({
    queryKey: ['admin', 'tours'],
    queryFn: () => api.get('/admin/tours', { params: { page: 1, page_size: 50 } }).then(res => res.data),
  })

  // Загрузка всех гидов
  const { data: guidesData, isLoading: guidesLoading } = useQuery({
    queryKey: ['admin', 'guides'],
    queryFn: () => api.get('/admin/guides').then(res => res.data),
  })

  const tours = toursData?.tours || []
  const guides = guidesData?.guides || []

  const formatRUB = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
        <p className="text-gray-600">Управление контентом и статистикой платформы</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Экскурсий
            </CardTitle>
            <MapPin className="text-airbnb-rausch" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsLoading ? '...' : stats?.total_tours || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              В каталоге платформы
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Гидов
            </CardTitle>
            <Users className="text-airbnb-babu" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsLoading ? '...' : stats?.total_guides || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Активных на платформе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Выручка
            </CardTitle>
            <DollarSign className="text-green-600" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsLoading ? '...' : formatRUB(stats?.total_revenue || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Всего обработано
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Бронирований
            </CardTitle>
            <Calendar className="text-tropical-coral" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsLoading ? '...' : stats?.total_bookings || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              За всё время
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Таблица всех туров */}
      <Card>
        <CardHeader>
          <CardTitle>Все экскурсии</CardTitle>
          <p className="text-sm text-gray-600">Управление экскурсиями платформы</p>
        </CardHeader>
        <CardContent>
          {toursLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : tours.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Нет экскурсий</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Локация</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Рейтинг</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tours.map((tour: any) => (
                    <tr key={tour.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">#{tour.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">
                        {tour.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tour.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                        {formatRUB(tour.price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        ⭐ {tour.rating || 0} ({tour.reviews_count || 0})
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tour.is_public && tour.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tour.is_public && tour.active ? 'Опубликован' : 'Черновик'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/dashboard/tours/edit/${tour.id}`}
                          >
                            <Edit size={14} className="mr-1" />
                            Редактировать
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm('Удалить тур?')) {
                                api.delete(`/admin/tours/${tour.id}`)
                                  .then(() => window.location.reload())
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Таблица гидов */}
      <Card>
        <CardHeader>
          <CardTitle>Все гиды</CardTitle>
          <p className="text-sm text-gray-600">Управление гидами платформы</p>
        </CardHeader>
        <CardContent>
          {guidesLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : guides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Нет гидов</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Баланс</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {guides.map((guide: any) => (
                    <tr key={guide.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">#{guide.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {guide.name || 'Не указано'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{guide.phone}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {guide.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatRUB(guide.balance_rub || 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              api.put(`/admin/guides/${guide.id}/approve`)
                                .then(() => alert('Гид одобрен'))
                            }}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Одобрить
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm('Заблокировать гида?')) {
                                api.put(`/admin/guides/${guide.id}/block`)
                                  .then(() => alert('Гид заблокирован'))
                              }
                            }}
                          >
                            <XCircle size={14} className="mr-1" />
                            Заблокировать
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
