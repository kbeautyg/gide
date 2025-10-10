import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Filter, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RequestCard } from '@/components/dashboard/RequestCard'
import { api } from '@/lib/api'

type FilterType = 'all' | 'short' | 'long'

export default function RequestsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterType>('all')

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
      alert(`❌ ${error.response?.data?.detail || 'Ошибка при принятии заявки'}`)
    }
  })

  const requests = requestsData?.requests || []

  // Фильтрация заявок
  const filteredRequests = requests.filter((req: any) => {
    if (filter === 'short') return req.duration_hours <= 2
    if (filter === 'long') return req.duration_hours >= 5
    return true
  })

  const shortCount = requests.filter((r: any) => r.duration_hours <= 2).length
  const longCount = requests.filter((r: any) => r.duration_hours >= 5).length

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Заявки</h1>
          <p className="text-gray-600 mt-1">Выберите заявку и создайте тур. Когда клиент бронирует — она появится здесь.</p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button 
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'airbnb' : 'outline'}
          className="gap-2"
        >
          <Filter size={16} />
          Все ({requests.length})
        </Button>
        <Button 
          onClick={() => setFilter('short')}
          variant={filter === 'short' ? 'airbnb' : 'outline'}
        >
          ⚡ Короткие до 2ч ({shortCount})
        </Button>
        <Button 
          onClick={() => setFilter('long')}
          variant={filter === 'long' ? 'airbnb' : 'outline'}
        >
          🌟 Длинные 5+ч ({longCount})
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
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
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

