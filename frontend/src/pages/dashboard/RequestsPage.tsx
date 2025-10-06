import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Search, Filter, Calendar, Users, DollarSign, MapPin, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await api.get('/requests/')
      return response.data
    },
  })

  const requests = requestsData?.requests || []

  const filteredRequests = requests.filter((request: any) => {
    const matchesSearch = !searchTerm || 
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает'
      case 'in_progress': return 'В работе'
      case 'completed': return 'Завершена'
      case 'cancelled': return 'Отменена'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Заявки клиентов</h1>
          <p className="text-gray-600 mt-1">Управление индивидуальными заявками на экскурсии</p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">Всего заявок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.length}</div>
            <p className="text-xs text-gray-500 mt-1">Всего получено</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Ожидают</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.filter((r: any) => r.status === 'pending').length}</div>
            <p className="text-xs text-gray-500 mt-1">Новых заявок</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">В работе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.filter((r: any) => r.status === 'in_progress').length}</div>
            <p className="text-xs text-gray-500 mt-1">Активных</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-600">Завершены</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.filter((r: any) => r.status === 'completed').length}</div>
            <p className="text-xs text-gray-500 mt-1">Выполнено</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Список заявок</CardTitle>
              <CardDescription>Все заявки от клиентов на индивидуальные экскурсии</CardDescription>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Поиск по названию, описанию, локации..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white min-w-[180px]"
            >
              <option value="all">Все статусы</option>
              <option value="pending">Ожидают</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершены</option>
              <option value="cancelled">Отменены</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Загрузка заявок...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request: any) => (
                <div key={request.id} className="border-2 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{request.title}</h3>
                      <p className="text-gray-600 mb-4">{request.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {request.preferred_date && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{new Date(request.preferred_date).toLocaleDateString('ru-RU')}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span>{request.participants_count} чел.</span>
                        </div>
                        
                        {request.budget && (
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-gray-400" />
                            <span>{formatRUB(request.budget)}</span>
                          </div>
                        )}
                        
                        {request.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{request.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(request.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare size={16} className="mr-2" />
                      Ответить
                    </Button>
                    <Button size="sm" variant="outline">
                      Назначить
                    </Button>
                    <Button size="sm" variant="outline">
                      Редактировать
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || selectedStatus !== 'all' ? (
                <>
                  <Filter size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Заявки не найдены</p>
                  <p className="text-sm mt-2">Попробуйте изменить фильтры</p>
                </>
              ) : (
                <>
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Заявок пока нет</p>
                  <p className="text-sm mt-2">Клиенты смогут оставлять заявки на индивидуальные экскурсии</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
