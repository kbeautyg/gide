import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

interface MarkAsPaidDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tour: {
    id: number
    title: string
    price: number
    client_name?: string
    client_phone?: string
    client_email?: string
  }
}

export function MarkAsPaidDialog({ open, onOpenChange, tour }: MarkAsPaidDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    client_name: tour.client_name || '',
    client_phone: tour.client_phone || '',
    client_email: tour.client_email || '',
    participants_count: 1,
    time: '10:00',
  })
  
  // Обновляем данные формы когда меняется тур
  useEffect(() => {
    if (tour) {
      setFormData({
        client_name: tour.client_name || '',
        client_phone: tour.client_phone || '',
        client_email: tour.client_email || '',
        participants_count: 1,
        time: '10:00',
      })
    }
  }, [tour])

  const markPaidMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/bookings/offline-payment', {
        tour_id: tour.id,
        ...data,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['revenue-stats'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      
      alert(`✅ Оплата зафиксирована!\n\nЭкскурсия: ${tour.title}\nКлиент: ${formData.client_name}\nСумма: ${formatRUB(tour.price * formData.participants_count)}\n\n💰 Баланс обновлён!`)
      
      onOpenChange(false)
      setFormData({
        client_name: '',
        client_phone: '',
        client_email: '',
        participants_count: 1,
        time: '10:00',
      })
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Ошибка при сохранении оплаты')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    markPaidMutation.mutate(formData)
  }

  const totalPrice = tour.price * formData.participants_count

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide p-3 sm:p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Отметить как оплаченное</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Введите данные клиента, который оплатил экскурсию офлайн
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div className="bg-tropical-ocean/5 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Экскурсия:</p>
              <p className="font-bold text-sm sm:text-base break-words">{tour.title}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 mb-1">Цена за человека:</p>
              <p className="font-semibold text-sm sm:text-base">{formatRUB(tour.price)}</p>
            </div>

            <div>
              <Label htmlFor="client_name" className="text-xs sm:text-sm">Имя клиента *</Label>
              <Input
                id="client_name"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Иван Иванов"
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="client_phone" className="text-xs sm:text-sm">Телефон клиента *</Label>
              <Input
                id="client_phone"
                required
                type="tel"
                value={formData.client_phone}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="client_email" className="text-xs sm:text-sm">Email клиента (необязательно)</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                placeholder="ivan@example.com"
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="participants_count" className="text-xs sm:text-sm">Количество участников</Label>
              <Input
                id="participants_count"
                required
                type="number"
                min="1"
                value={formData.participants_count}
                onChange={(e) => setFormData({ ...formData, participants_count: parseInt(e.target.value) || 1 })}
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="time" className="text-xs sm:text-sm">Время экскурсии</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-2 border-green-200">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Сумма к зачислению:</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatRUB(totalPrice)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Будет добавлено на ваш баланс после сохранения
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Отмена
            </Button>
            <Button
              type="submit"
              variant="tropical"
              disabled={markPaidMutation.isPending}
              className="w-full sm:w-auto"
            >
              {markPaidMutation.isPending ? 'Сохранение...' : 'Подтвердить оплату'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
