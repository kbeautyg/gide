import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Calendar as CalendarIcon, HelpCircle } from 'lucide-react'
import { GuideCalendar } from '@/components/dashboard/GuideCalendar'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { toast } from '@/lib/toast'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

export default function CalendarPage() {
  const queryClient = useQueryClient()
  const [rescheduleModal, setRescheduleModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [newDate, setNewDate] = useState<Date | null>(null)
  const [clientConfirmed, setClientConfirmed] = useState(false) // Галочка "я согласовал с клиентом"

  // Автообновление данных через WebSocket + polling fallback
  useAutoRefresh({
    queryKeys: [['my-schedule']],
    intervalMs: 15000,
  })

  // Загрузка расписания
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['my-schedule'],
    queryFn: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      return api.get('/requests/my-schedule', {
        params: {
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd')
        }
      }).then(res => res.data)
    },
  })

  // Перенос заявки
  const rescheduleMutation = useMutation({
    mutationFn: (data: { requestId: number, new_date: string }) =>
      api.put(`/requests/${data.requestId}/reschedule`, {
        new_date: data.new_date
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-schedule'] })
      setRescheduleModal(false)
      setSelectedRequest(null)
      setNewDate(null)
      toast.success('Заявка успешно перенесена!', 'Расписание обновлено')
    },
    onError: (error: any) => {
      toast.error('Ошибка при переносе', error.response?.data?.detail)
    }
  })

  // Отмена заявки
  const cancelMutation = useMutation({
    mutationFn: (requestId: number) =>
      api.put(`/requests/${requestId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-schedule'] })
      toast.success('Заявка отменена', 'Часы освобождены в расписании')
    },
    onError: (error: any) => {
      toast.error('Ошибка при отмене', error.response?.data?.detail)
    }
  })

  // Обновление дат тура (оставлено для совместимости, но не используется)
  // Теперь используем rescheduleTourMutation с подтверждением клиента

  // Перенос тура с подтверждением клиента
  const rescheduleTourMutation = useMutation({
    mutationFn: ({ tourId, new_start_date, client_confirmed }: { 
      tourId: number, 
      new_start_date: string, 
      client_confirmed: boolean 
    }) =>
      api.put(`/tours/${tourId}/reschedule`, { new_start_date, client_confirmed }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['my-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success('Тур успешно перенесён!', response.data.message)
    },
    onError: (error: any) => {
      toast.error('Ошибка при переносе тура', error.response?.data?.detail)
    }
  })

  const schedules = scheduleData?.schedules || []
  const requests = scheduleData?.requests || []
  const tours = scheduleData?.tours || []

  // Debug: проверяем что пришло
  console.log('Calendar data:', { schedules: schedules.length, requests: requests.length, tours: tours.length })
  console.log('Tours:', tours)
  console.log('Requests:', requests)

  // Статистика
  const totalBookedHours = schedules.reduce((sum: number, s: any) => sum + s.booked_hours, 0)
  const requestsThisMonth = requests.length
  const daysWorked = schedules.filter((s: any) => s.booked_hours > 0).length

  const handleReschedule = (request: any) => {
    setSelectedRequest(request)
    setRescheduleModal(true)
    setNewDate(null)
  }

  const confirmReschedule = () => {
    if (!selectedRequest || !newDate) return
    
    rescheduleMutation.mutate({
      requestId: selectedRequest.id,
      new_date: format(newDate, 'yyyy-MM-dd')
    })
  }

  // Полностью занятые даты
  const fullyBookedDates = schedules
    .filter((s: any) => s.booked_hours >= 8)
    .map((s: any) => new Date(s.date))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Календарь экскурсий</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Управляйте своим расписанием • Занято: {totalBookedHours} часов в месяц
          </p>
        </div>
        
        {/* Статистика */}
        <div className="flex gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-airbnb-rausch">{requestsThisMonth}</div>
            <div className="text-xs sm:text-sm text-gray-600">Заявок</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{totalBookedHours}</div>
            <div className="text-xs sm:text-sm text-gray-600">Часов</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{daysWorked}</div>
            <div className="text-xs sm:text-sm text-gray-600">Дней</div>
          </div>
        </div>
      </div>

      {/* Режим переноса дат с подтверждением клиента */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={clientConfirmed}
                onCheckedChange={setClientConfirmed}
                className="data-[state=checked]:bg-green-600"
              />
              <div className="flex flex-col">
                <label className="text-base font-bold text-gray-900 cursor-pointer" onClick={() => setClientConfirmed(!clientConfirmed)}>
                  Я согласовал даты с клиентом
                </label>
                <p className="text-xs text-gray-600 mt-0.5">
                  Включите, чтобы разрешить перетаскивание туров в календаре
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-gray-500 hover:text-gray-700">
                      <HelpCircle size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-white border-2 border-blue-200 p-4">
                    <p className="font-semibold mb-2">Как это работает:</p>
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>Включите переключатель после согласования с клиентом</li>
                      <li>Перетащите тур на новую дату в календаре</li>
                      <li>Дата автоматически обновится в ссылке тура (/t/code)</li>
                      <li>Клиент увидит новую дату при переходе по ссылке</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {clientConfirmed ? (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold text-sm shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Режим переноса активен
              </div>
            ) : (
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded">Отключено</span>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="skeleton w-full h-[500px] rounded-lg" />
          </CardContent>
        </Card>
      ) : (
        <>
          <GuideCalendar
            schedules={schedules}
            requests={requests}
            tours={tours}
            mode="view"
            enableDragDrop={clientConfirmed}
            onReschedule={(requestId, newDate) => {
              rescheduleMutation.mutate({ requestId, new_date: newDate })
            }}
            onTourReschedule={(tourId, newStartDate) => {
              // Перенос тура напрямую (подтверждение уже дано через clientConfirmed)
              const tour = tours.find((t: any) => t.id === tourId)
              if (tour && clientConfirmed) {
                rescheduleTourMutation.mutate({
                  tourId,
                  new_start_date: newStartDate,
                  client_confirmed: true
                })
              }
            }}
            onCancel={(requestId) => cancelMutation.mutate(requestId)}
          />
          
          {/* Легенда */}
          <Card className="bg-gray-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-50 border border-green-200 rounded" />
                  <span className="text-gray-700">🟢 Свободно (0-3ч)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-50 border border-yellow-200 rounded" />
                  <span className="text-gray-700">🟡 Частично (4-7ч)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-50 border border-red-200 rounded" />
                  <span className="text-gray-700">🔴 Полностью (8ч)</span>
                </div>
                <div className="flex items-center gap-2 border-l pl-6">
                  <div className="w-6 h-6 bg-white border border-gray-300 rounded" />
                  <span className="text-gray-700">Заявка</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 border border-blue-200 rounded" />
                  <span className="text-blue-700">Тур</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Список заявок на сегодня */}
          {requests.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CalendarIcon size={20} className="text-airbnb-rausch" />
                  Ваши заявки
                </h3>
                <div className="space-y-3">
                  {requests.map((request: any) => (
                    <div 
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(request.assigned_date).toLocaleDateString('ru')} • {request.duration_hours}ч
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReschedule(request)}
                      >
                        Перенести
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal переноса заявки */}
      <Dialog open={rescheduleModal} onOpenChange={setRescheduleModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Перенести заявку на другую дату</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selectedRequest.title}</h3>
                <p className="text-gray-600">
                  Текущая дата: {new Date(selectedRequest.assigned_date).toLocaleDateString('ru')} • {selectedRequest.duration_hours}ч
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  ⚠️ После переноса время на старой дате освободится, а на новой забронируется
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Выберите новую дату:</h4>
                <GuideCalendar
                  schedules={schedules}
                  requests={requests.filter((r: any) => r.id !== selectedRequest.id)}
                  mode="select"
                  onDateSelect={(date) => setNewDate(date)}
                  showHoursAvailability={true}
                  disabledDates={fullyBookedDates}
                  selectedDate={newDate}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setRescheduleModal(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button 
                  onClick={confirmReschedule}
                  disabled={!newDate || rescheduleMutation.isPending}
                  className="flex-1 bg-airbnb-rausch hover:bg-airbnb-rausch/90"
                >
                  {rescheduleMutation.isPending ? 'Переносим...' : 'Подтвердить перенос'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
