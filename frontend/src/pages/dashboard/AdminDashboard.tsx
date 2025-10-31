import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, DollarSign, Calendar, Edit, Trash2, CheckCircle, XCircle, Sparkles, Grid } from 'lucide-react'
import { api } from '@/lib/api'

interface AdminStats {
  total_tours: number
  total_guides: number
  total_bookings: number
  total_revenue: number
}

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const [enhancing, setEnhancing] = useState(false)
  
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
  
  // Массовое дозаполнение туров
  const enhanceMutation = useMutation({
    mutationFn: () => api.post('/admin/tours/bulk-enhance'),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tours'] })
      alert(`✅ ${response.data.message}\n\nОбновлено туров: ${response.data.updated_count}`)
      setEnhancing(false)
    },
    onError: (error: any) => {
      alert(`❌ Ошибка: ${error.response?.data?.detail || 'Не удалось обновить туры'}`)
      setEnhancing(false)
    },
  })
  
  const handleBulkEnhance = () => {
    if (confirm('Запустить автоматическое дозаполнение всех туров с пустыми полями?\n\nЭто может занять несколько минут.')) {
      setEnhancing(true)
      enhanceMutation.mutate()
    }
  }

  const formatRUB = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Админ-панель</h1>
          <p className="text-sm sm:text-base text-gray-600">Управление контентом и статистикой платформы</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/admin/categories">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Grid size={16} className="mr-2" />
              Категории
            </Button>
          </Link>
          <Button
            onClick={handleBulkEnhance}
            disabled={enhancing}
            className="bg-airbnb-rausch hover:bg-airbnb-rausch/90 w-full sm:w-auto"
          >
            <Sparkles size={16} className="mr-2" />
            {enhancing ? 'Обработка...' : 'Дозаполнить все туры'}
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
        <CardContent className="p-0">
          {toursLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : tours.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Нет экскурсий</div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ID</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Локация</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Цена</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Рейтинг</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Статус</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tours.map((tour: any) => (
                    <tr key={tour.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">#{tour.id}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 max-w-[200px] truncate">
                          {tour.title}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{tour.location}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 font-semibold whitespace-nowrap">
                        {formatRUB(tour.price)}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        ⭐ {tour.rating || 0} ({tour.reviews_count || 0})
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          tour.is_public && tour.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tour.is_public && tour.active ? 'Опубликован' : 'Черновик'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                        <div className="flex gap-1 sm:gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            onClick={() => window.location.href = `/dashboard/tours/edit/${tour.id}`}
                            className="text-sm whitespace-nowrap"
                          >
                            <Edit size={16} className="mr-1" />
                            <span className="hidden sm:inline">Редактировать</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm('Удалить тур?')) {
                                api.delete(`/admin/tours/${tour.id}`)
                                  .then(() => window.location.reload())
                              }
                            }}
                          >
                            <Trash2 size={16} />
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
        <CardContent className="p-0">
          {guidesLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : guides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Нет гидов</div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ID</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Телефон</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Роль</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Баланс</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {guides.map((guide: any) => (
                    <tr key={guide.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">#{guide.id}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                        {guide.name || 'Не указано'}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{guide.phone}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          {guide.role}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                        {formatRUB(guide.balance_rub || 0)}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                        <div className="flex gap-1 sm:gap-2 justify-end flex-wrap">
                          <Button 
                            variant="outline" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 text-sm whitespace-nowrap"
                            onClick={() => {
                              api.put(`/admin/guides/${guide.id}/approve`)
                                .then(() => alert('Гид одобрен'))
                            }}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            <span className="hidden sm:inline">Одобрить</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm whitespace-nowrap"
                            onClick={() => {
                              if (confirm('Заблокировать гида?')) {
                                api.put(`/admin/guides/${guide.id}/block`)
                                  .then(() => alert('Гид заблокирован'))
                              }
                            }}
                          >
                            <XCircle size={16} className="mr-1" />
                            <span className="hidden sm:inline">Заблокировать</span>
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
