import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, User, Phone, Mail } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

interface PaymentDialogProps {
  tour: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PaymentDialog({ tour, open, onOpenChange, onSuccess }: PaymentDialogProps) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    participants_count: 1
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post(`/guide-stats/tours/${tour.id}/payment`, formData)
      
      if (response.data.success) {
        onSuccess()
        onOpenChange(false)
        // Сброс формы
        setFormData({
          client_name: '',
          client_phone: '',
          client_email: '',
          participants_count: 1
        })
      }
    } catch (error) {
      console.error('Ошибка при фиксации оплаты:', error)
      alert('Ошибка при фиксации оплаты')
    } finally {
      setIsLoading(false)
    }
  }

  const totalPrice = tour.price * formData.participants_count

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="text-tropical-ocean" size={20} />
            Фиксация оплаты
          </DialogTitle>
          <DialogDescription>
            Введите данные клиента для фиксации оплаты экскурсии
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tour-title">Экскурсия</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold">{tour.title}</p>
              <p className="text-sm text-gray-600">{formatRUB(tour.price)} за человека</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_name">Имя клиента *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Введите имя клиента"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_phone">Телефон клиента *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="client_phone"
                value={formData.client_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                placeholder="+7 (999) 123-45-67"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_email">Email клиента</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                placeholder="client@example.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participants_count">Количество участников</Label>
            <Input
              id="participants_count"
              type="number"
              min="1"
              max="20"
              value={formData.participants_count}
              onChange={(e) => setFormData(prev => ({ ...prev, participants_count: parseInt(e.target.value) || 1 }))}
              className="text-center"
            />
          </div>

          <div className="p-4 bg-tropical-ocean/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Итого к оплате:</span>
              <span className="text-xl font-bold text-tropical-ocean">
                {formatRUB(totalPrice)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formData.participants_count} чел. × {formatRUB(tour.price)}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="tropical"
              disabled={isLoading || !formData.client_name || !formData.client_phone}
            >
              {isLoading ? 'Фиксируем...' : 'Зафиксировать оплату'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
