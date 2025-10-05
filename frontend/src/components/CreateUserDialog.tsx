import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  // Определяем доступные роли в зависимости от текущего пользователя
  const getAvailableRoles = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { value: 'admin', label: 'Админ', color: 'bg-blue-100 text-blue-800' },
          { value: 'super_manager', label: 'Супер-менеджер', color: 'bg-green-100 text-green-800' },
          { value: 'manager', label: 'Менеджер', color: 'bg-orange-100 text-orange-800' },
        ]
      case 'admin':
        return [
          { value: 'super_manager', label: 'Супер-менеджер', color: 'bg-green-100 text-green-800' },
          { value: 'manager', label: 'Менеджер', color: 'bg-orange-100 text-orange-800' },
        ]
      case 'super_manager':
        return [
          { value: 'manager', label: 'Менеджер', color: 'bg-orange-100 text-orange-800' },
        ]
      default:
        return []
    }
  }

  const availableRoles = getAvailableRoles()
  
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    name: '',
    role: availableRoles[0]?.value || 'manager',
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => 
      api.post('/admin/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onOpenChange(false)
      setFormData({
        phone: '',
        email: '',
        password: '',
        name: '',
        role: 'manager',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="sm:max-w-md z-[100]">
        <DialogHeader>
          <DialogTitle>Создать пользователя</DialogTitle>
          <DialogDescription>
            Добавьте нового гида, менеджера или администратора
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                placeholder="Имя пользователя"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 999-99-99"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (необязательно)</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <div className="grid grid-cols-1 gap-2">
                {availableRoles.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === role.value
                        ? 'border-tropical-turquoise bg-tropical-turquoise/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{role.label}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${role.color}`}>
                      {role.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {user?.role === 'super_admin' && 'Вы можете создавать админов, супер-менеджеров и менеджеров'}
                {user?.role === 'admin' && 'Вы можете создавать супер-менеджеров и менеджеров'}
                {user?.role === 'super_manager' && 'Вы можете создавать только менеджеров'}
              </p>
            </div>
            {createMutation.error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                Ошибка при создании пользователя
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
