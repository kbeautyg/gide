import { useState } from 'react'
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
  }
}

export function MarkAsPaidDialog({ open, onOpenChange, tour }: MarkAsPaidDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    participants_count: 1,
  })

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Отметить как оплаченное</DialogTitle>
          <DialogDescription>
            Введите данные клиента, который оплатил экскурсию офлайн
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="bg-tropical-ocean/5 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">Экскурсия:</p>
              <p className="font-bold">{tour.title}</p>
              <p className="text-sm text-gray-600 mt-2 mb-1">Цена за человека:</p>
              <p className="font-semibold">{formatRUB(tour.price)}</p>
            </div>

            <div>
              <Label htmlFor="client_name">Имя клиента *</Label>
              <Input
                id="client_name"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Иван Иванов"
              />
            </div>

            <div>
              <Label htmlFor="client_phone">Телефон клиента *</Label>
              <Input
                id="client_phone"
                required
                type="tel"
                value={formData.client_phone}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <Label htmlFor="client_email">Email клиента (необязательно)</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                placeholder="ivan@example.com"
              />
            </div>

            <div>
              <Label htmlFor="participants_count">Количество участников</Label>
              <Input
                id="participants_count"
                required
                type="number"
                min="1"
                value={formData.participants_count}
                onChange={(e) => setFormData({ ...formData, participants_count: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">Сумма к зачислению:</p>
              <p className="text-3xl font-bold text-green-600">{formatRUB(totalPrice)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Будет добавлено на ваш баланс после сохранения
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="tropical"
              disabled={markPaidMutation.isPending}
            >
              {markPaidMutation.isPending ? 'Сохранение...' : 'Подтвердить оплату'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
