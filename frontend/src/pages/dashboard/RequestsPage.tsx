import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Filter, Inbox, CheckCircle2, Clock, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RequestCard } from '@/components/dashboard/RequestCard'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

type FilterType = 'all' | 'short' | 'long' | 'pending' | 'in_progress' | 'completed'

export default function RequestsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterType>('all')

  // Автообновление данных через WebSocket + polling fallback
  useAutoRefresh({
    queryKeys: [['requests', 'available']],
    intervalMs: 15000,
  })

  // Загрузка доступных заявок
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['requests', 'available'],
    queryFn: () => api.get('/requests/available').then(res => res.data),
  })

  // Принять заявку и перейти к созданию тура
  const acceptMutation = useMutation({
    mutationFn: (requestId: number) => 
      api.post(`/requests/${requestId}/accept`),
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'available'] })
      navigate(`/dashboard/tours/create-from-request/${requestId}`)
    },
    onError: (error: any) => {
      toast.error('Ошибка при принятии заявки', error.response?.data?.detail)
      queryClient.invalidateQueries({ queryKey: ['requests', 'available'] })
    }
  })

  const requests = requestsData?.requests || []

  // Фильтрация заявок
  const filteredRequests = requests.filter((req: any) => {
    if (filter === 'short') return req.duration_hours <= 2
    if (filter === 'long') return req.duration_hours >= 5
    if (filter === 'pending') return req.status === 'pending'
    if (filter === 'in_progress') return req.status === 'in_progress'
    if (filter === 'completed') return req.status === 'completed'
    return true
  })

  const shortCount = requests.filter((r: any) => r.duration_hours <= 2).length
  const longCount = requests.filter((r: any) => r.duration_hours >= 5).length
  const pendingCount = requests.filter((r: any) => r.status === 'pending').length
  const inProgressCount = requests.filter((r: any) => r.status === 'in_progress').length
  const completedCount = requests.filter((r: any) => r.status === 'completed').length

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden max-w-full">
      {/* Заголовок */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Заявки</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Выберите заявку и создайте тур. Когда клиент бронирует — она появится здесь.</p>
        </div>
      </div>

      {/* Фильтры по статусу */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <Button 
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'airbnb' : 'outline'}
          className="gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <Filter size={14} className="sm:w-4 sm:h-4" />
          <span>Все</span>
          <span className="hidden sm:inline">({requests.length})</span>
        </Button>
        <Button 
          onClick={() => setFilter('pending')}
          variant={filter === 'pending' ? 'airbnb' : 'outline'}
          className="gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <Clock size={14} className="sm:w-4 sm:h-4" />
          <span>Новые</span>
          <span className="hidden sm:inline">({pendingCount})</span>
        </Button>
        <Button 
          onClick={() => setFilter('in_progress')}
          variant={filter === 'in_progress' ? 'airbnb' : 'outline'}
          className="gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <Link2 size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">В работе</span>
          <span className="sm:hidden">Работа</span>
          <span className="hidden sm:inline">({inProgressCount})</span>
        </Button>
        <Button 
          onClick={() => setFilter('completed')}
          variant={filter === 'completed' ? 'airbnb' : 'outline'}
          className="gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Завершены</span>
          <span className="sm:hidden">Готово</span>
          <span className="hidden sm:inline">({completedCount})</span>
        </Button>
        <Button 
          onClick={() => setFilter('short')}
          variant={filter === 'short' ? 'airbnb' : 'outline'}
          className="text-sm sm:text-base whitespace-nowrap"
        >
          ⚡ <span className="hidden sm:inline ml-1">Короткие</span>
          <span className="sm:hidden ml-1">Корот.</span>
          <span className="hidden sm:inline ml-1">({shortCount})</span>
        </Button>
        <Button 
          onClick={() => setFilter('long')}
          variant={filter === 'long' ? 'airbnb' : 'outline'}
          className="text-sm sm:text-base whitespace-nowrap"
        >
          🌟 <span className="hidden sm:inline ml-1">Длинные</span>
          <span className="sm:hidden ml-1">Длин.</span>
          <span className="hidden sm:inline ml-1">({longCount})</span>
        </Button>
      </div>

      {/* Список заявок */}
      {isLoading ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full border-4 border-gray-200 border-t-airbnb-rausch animate-spin" />
            <p className="text-gray-600">Загрузка заявок…</p>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center text-gray-600">
            <Inbox className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Пока нет заявок в этой категории. Посмотрите в других фильтрах.</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {filteredRequests.map((request: any) => (
            <motion.div
              key={request.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <RequestCard 
                request={request}
                onAccept={() => acceptMutation.mutate(request.id)}
                onViewTour={(tourId) => navigate(`/dashboard/my-tours#tour-${tourId}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Календарь */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* ... existing code ... */}
      </section>
    </div>
  )
}

