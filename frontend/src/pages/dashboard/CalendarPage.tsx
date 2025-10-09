import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, TrendingUp } from 'lucide-react'
import { GuideCalendar } from '@/components/dashboard/GuideCalendar'
import { api } from '@/lib/api'

export default function CalendarPage() {
  const queryClient = useQueryClient()
  const [rescheduleModal, setRescheduleModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [newDate, setNewDate] = useState<Date | null>(null)

  // Загрузка расписания
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['my-schedule'],
    queryFn: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      return api.get('/requests/my-schedule', {
        params: {
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0]
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
      alert('✅ Заявка успешно перенесена!')
    },
    onError: (error: any) => {
      alert(`❌ ${error.response?.data?.detail || 'Ошибка при переносе'}`)
    }
  })

  const schedules = scheduleData?.schedules || []
  const requests = scheduleData?.requests || []

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
      new_date: newDate.toISOString().split('T')[0]
    })
  }

  // Полностью занятые даты
  const fullyBookedDates = schedules
    .filter((s: any) => s.booked_hours >= 8)
    .map((s: any) => new Date(s.date))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Календарь экскурсий</h1>
          <p className="text-gray-600">
            Управляйте своим расписанием • Занято: {totalBookedHours} часов в месяц
          </p>
        </div>
        
        {/* Статистика */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-airbnb-rausch">{requestsThisMonth}</div>
            <div className="text-sm text-gray-600">Заявок</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalBookedHours}</div>
            <div className="text-sm text-gray-600">Часов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{daysWorked}</div>
            <div className="text-sm text-gray-600">Дней</div>
          </div>
        </div>
      </div>

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
            mode="view"
          />
          
          {/* Легенда */}
          <Card className="bg-gray-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-50 border border-green-200 rounded" />
                  <span className="text-sm text-gray-700">🟢 Свободно (0-3ч)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-50 border border-yellow-200 rounded" />
                  <span className="text-sm text-gray-700">🟡 Частично (4-7ч)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-50 border border-red-200 rounded" />
                  <span className="text-sm text-gray-700">🔴 Полностью занято (8ч)</span>
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Перенести заявку на другую дату</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
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
