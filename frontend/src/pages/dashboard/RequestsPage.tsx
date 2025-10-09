import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Filter, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RequestCard } from '@/components/dashboard/RequestCard'
import { GuideCalendar } from '@/components/dashboard/GuideCalendar'
import { api } from '@/lib/api'

type FilterType = 'all' | 'short' | 'long'

export default function RequestsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<FilterType>('all')
  const [showTakeModal, setShowTakeModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Загрузка доступных заявок
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['requests', 'available'],
    queryFn: () => api.get('/requests/available').then(res => res.data),
  })

  // Загрузка расписания для проверки доступности
  const { data: scheduleData } = useQuery({
    queryKey: ['my-schedule'],
    queryFn: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 3, 0)
      return api.get('/requests/my-schedule', {
        params: {
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0]
        }
      }).then(res => res.data)
    },
  })

  // Взять заявку
  const takeMutation = useMutation({
    mutationFn: (data: { requestId: number, assigned_date: string }) => 
      api.post(`/requests/${data.requestId}/take`, {
        assigned_date: data.assigned_date
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'available'] })
      queryClient.invalidateQueries({ queryKey: ['my-schedule'] })
      setShowTakeModal(false)
      setSelectedRequest(null)
      setSelectedDate(null)
      alert('✅ Заявка успешно взята!')
    },
    onError: (error: any) => {
      alert(`❌ ${error.response?.data?.detail || 'Ошибка при взятии заявки'}`)
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

  const handleTakeRequest = (request: any) => {
    setSelectedRequest(request)
    setShowTakeModal(true)
    setSelectedDate(null)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const confirmTakeRequest = () => {
    if (!selectedRequest || !selectedDate) return
    
    takeMutation.mutate({
      requestId: selectedRequest.id,
      assigned_date: selectedDate.toISOString().split('T')[0]
    })
  }

  // Получаем полностью занятые даты
  const fullyBookedDates = (scheduleData?.schedules || [])
    .filter((s: any) => s.booked_hours >= 8)
    .map((s: any) => new Date(s.date))

  // Доступные часы на выбранную дату
  const availableHours = selectedDate 
    ? (scheduleData?.schedules || []).find((s: any) => 
        new Date(s.date).toDateString() === selectedDate.toDateString()
      )?.available_hours ?? 8
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Доступные заявки</h1>
          <p className="text-gray-600">Выберите заявки, которые подходят вашему расписанию</p>
        </div>
        
        {/* Статистика */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-airbnb-rausch">{requests.length}</div>
            <div className="text-sm text-gray-600">Доступно</div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex gap-3">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton rounded-xl h-[300px]" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'Нет доступных заявок' : 'Нет заявок с этим фильтром'}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Новые заявки появятся здесь автоматически' 
                : 'Попробуйте выбрать другой фильтр'}
            </p>
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
                onTake={() => handleTakeRequest(request)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal выбора даты */}
      <Dialog open={showTakeModal} onOpenChange={setShowTakeModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-2xl">Взять заявку</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selectedRequest.title}</h3>
                <p className="text-gray-600">
                  {selectedRequest.duration_hours} час{selectedRequest.duration_hours === 1 ? '' : selectedRequest.duration_hours < 5 ? 'а' : 'ов'} • 
                  {selectedRequest.participants_count} участник{selectedRequest.participants_count === 1 ? '' : selectedRequest.participants_count < 5 ? 'а' : 'ов'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 Эта заявка займёт <strong>{selectedRequest.duration_hours} часов</strong> из ваших 8 доступных в день
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Выберите дату проведения:</h4>
                <GuideCalendar
                  schedules={scheduleData?.schedules || []}
                  requests={scheduleData?.requests || []}
                  mode="select"
                  onDateSelect={handleDateSelect}
                  showHoursAvailability={true}
                  disabledDates={fullyBookedDates}
                  selectedDate={selectedDate}
                />
              </div>

              {selectedDate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    ✓ На {selectedDate.toLocaleDateString('ru')} доступно <strong>{availableHours}/8 часов</strong>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    После бронирования останется {availableHours - selectedRequest.duration_hours} часов
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTakeModal(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button 
                  onClick={confirmTakeRequest}
                  disabled={!selectedDate || takeMutation.isPending}
                  className="flex-1 bg-airbnb-rausch hover:bg-airbnb-rausch/90"
                >
                  {takeMutation.isPending ? 'Бронируем...' : 'Подтвердить'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

