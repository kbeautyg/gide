import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, DollarSign, Calendar, Edit, Trash2, CheckCircle, XCircle, Sparkles, Grid, ArrowRight, Activity, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { Link } from 'react-router-dom'
import { formatRUB } from '@/lib/utils'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'

interface AdminStats {
  total_tours: number
  total_guides: number
  total_bookings: number
  total_revenue: number
}

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const [enhancing, setEnhancing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Загрузка статистики
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminStats>('/admin/stats').then(res => res.data),
  })

  // Загрузка всех туров
  const { data: toursData, isLoading: toursLoading } = useQuery({
    queryKey: ['admin', 'tours'],
    queryFn: () => api.get('/admin/tours', { params: { page: 1, page_size: 10 } }).then(res => res.data), // Limit to 10 for dashboard
  })

  // Загрузка всех гидов
  const { data: guidesData, isLoading: guidesLoading } = useQuery({
    queryKey: ['admin', 'guides'],
    queryFn: () => api.get('/admin/guides').then(res => res.data),
  })

  const allTours = toursData?.tours || []
  const allGuides = guidesData?.guides || []
  
  // Фильтрация по поиску
  const query = searchQuery.toLowerCase().trim()
  const tours = query 
    ? allTours.filter((t: any) => 
        t.title?.toLowerCase().includes(query) || 
        t.location?.toLowerCase().includes(query))
    : allTours
  const guides = query 
    ? allGuides.filter((g: any) => 
        g.name?.toLowerCase().includes(query) || 
        g.phone?.includes(query))
    : allGuides
  
  // Массовое дозаполнение туров
  const enhanceMutation = useMutation({
    mutationFn: () => api.post('/admin/tours/bulk-enhance'),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tours'] })
      toast.success(response.data.message || 'AI оптимизация завершена', `Обновлено туров: ${response.data.updated_count}`)
      setEnhancing(false)
    },
    onError: (error: any) => {
      toast.error('Ошибка AI оптимизации', error.response?.data?.detail || 'Не удалось обновить туры')
      setEnhancing(false)
    },
  })
  
  const handleBulkEnhance = () => {
      setEnhancing(true)
    toast.info('Запускаем AI оптимизацию', 'Это может занять несколько минут...')
      enhanceMutation.mutate()
  }

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      {/* Header with Search and Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
          <p className="text-gray-500 mt-1">Управление платформой и контентом</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  type="search" 
                  placeholder="Поиск по турам или гидам..." 
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
          </div>
          <Button
            onClick={handleBulkEnhance}
            disabled={enhancing}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
          >
            <Sparkles size={16} className="mr-2" />
                {enhancing ? 'AI Обработка...' : 'AI Оптимизация'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-purple-100 hover:border-purple-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Всего экскурсий
              <MapPin className="text-purple-600" size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statsLoading ? '...' : stats?.total_tours || 0}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Activity size={12} />
                Активно
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100 hover:border-blue-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Гиды
              <Users className="text-blue-600" size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statsLoading ? '...' : stats?.total_guides || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 hover:border-green-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Общая выручка
              <DollarSign className="text-green-600" size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statsLoading ? '...' : formatRUB(stats?.total_revenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-orange-100 hover:border-orange-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Бронирования
              <Calendar className="text-orange-500" size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statsLoading ? '...' : stats?.total_bookings || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Tours Table */}
          <div className="lg:col-span-2 space-y-6">
      <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Последние экскурсии</CardTitle>
                        <CardDescription>Недавно добавленные или измененные</CardDescription>
                    </div>
                    <Link to="/dashboard/my-tours">
                        <Button variant="ghost" size="sm" className="gap-1">
                            Все <ArrowRight size={16} />
                        </Button>
                    </Link>
        </CardHeader>
        <CardContent className="p-0">
          {toursLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : tours.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Нет экскурсий</div>
          ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                        {tours.slice(0, 5).map((tour: any) => (
                    <tr key={tour.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                          {tour.title}
                        </div>
                                <div className="text-xs text-gray-500">{tour.location}</div>
                      </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatRUB(tour.price)}
                      </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          tour.is_public && tour.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                                {tour.is_public && tour.active ? 'Активен' : 'Черновик'}
                        </span>
                      </td>
                            <td className="px-4 py-3 text-right">
                                <Link to={`/dashboard/tours/edit/${tour.id}`}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Edit size={16} className="text-gray-500" />
                          </Button>
                                </Link>
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

          {/* Quick Actions & Guides */}
          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Быстрые действия</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                        <Link to="/dashboard/admin/categories">
                            <Button variant="outline" className="w-full justify-start">
                                <Grid size={16} className="mr-2" />
                                Управление категориями
                            </Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start opacity-60 cursor-not-allowed" disabled>
                            <Users size={16} className="mr-2" />
                            Рассылка пользователям
                            <span className="ml-auto text-[10px] uppercase font-bold text-gray-400">Скоро</span>
                        </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Гиды
                        <span className="text-xs font-normal text-gray-500">Топ 5</span>
                    </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
                    <div className="divide-y">
                        {guides.slice(0, 5).map((guide: any) => (
                            <div key={guide.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                        {guide.name?.[0] || 'G'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium truncate w-32">{guide.name}</p>
                                        <p className="text-xs text-gray-500">{guide.phone}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold">{formatRUB(guide.balance_rub || 0)}</p>
                                </div>
                        </div>
                  ))}
            </div>
        </CardContent>
      </Card>
          </div>
      </div>
    </div>
  )
}
