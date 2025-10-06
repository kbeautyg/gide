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
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

interface AssignRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: number
    name?: string
    phone: string
    role: string
  }
}

export function AssignRoleDialog({ open, onOpenChange, user }: AssignRoleDialogProps) {
  const { user: currentUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState(user.role)

  // Определяем доступные роли в зависимости от роли текущего пользователя
  const getAvailableRoles = () => {
    if (currentUser?.role === 'super_admin') {
      return [
        { value: 'super_admin', label: 'Супер-админ', color: 'text-purple-600' },
        { value: 'admin', label: 'Админ', color: 'text-blue-600' },
        { value: 'super_manager', label: 'Супер-менеджер', color: 'text-green-600' },
        { value: 'manager', label: 'Менеджер', color: 'text-orange-600' },
        { value: 'guide', label: 'Гид', color: 'text-orange-600' },
        { value: 'client', label: 'Клиент', color: 'text-gray-600' },
      ]
    } else if (currentUser?.role === 'admin') {
      return [
        { value: 'super_manager', label: 'Супер-менеджер', color: 'text-green-600' },
        { value: 'manager', label: 'Менеджер', color: 'text-orange-600' },
      ]
    } else if (currentUser?.role === 'super_manager') {
      return [
        { value: 'manager', label: 'Менеджер', color: 'text-orange-600' },
      ]
    }
    return []
  }

  const availableRoles = getAvailableRoles()

  const assignRoleMutation = useMutation({
    mutationFn: async (newRole: string) => {
      const response = await api.put(`/profile/${user.id}/role?new_role=${newRole}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['my-team'] })
      alert('Роль успешно назначена!')
      onOpenChange(false)
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Ошибка при назначении роли')
    },
  })

  const handleAssign = () => {
    if (selectedRole === user.role) {
      alert('Выберите другую роль')
      return
    }
    assignRoleMutation.mutate(selectedRole)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Назначить роль пользователю</DialogTitle>
          <DialogDescription>
            {user.name || user.phone} - текущая роль: <span className="font-semibold">{getRoleName(user.role)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Выберите новую роль</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {availableRoles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    selectedRole === role.value
                      ? 'border-tropical-ocean bg-tropical-ocean/5'
                      : 'border-gray-200 hover:border-tropical-ocean/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${role.color}`}>{role.label}</span>
                    {selectedRole === role.value && (
                      <span className="text-tropical-ocean">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{getRoleDescription(role.value)}</p>
                </button>
              ))}
            </div>
          </div>

          {availableRoles.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              У вас нет прав для назначения ролей
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            variant="tropical"
            onClick={handleAssign}
            disabled={assignRoleMutation.isPending || selectedRole === user.role || availableRoles.length === 0}
          >
            {assignRoleMutation.isPending ? 'Назначение...' : 'Назначить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getRoleName(role: string): string {
  const roles: Record<string, string> = {
    super_admin: 'Супер-админ',
    admin: 'Админ',
    super_manager: 'Супер-менеджер',
    manager: 'Менеджер',
    guide: 'Гид',
    client: 'Клиент',
  }
  return roles[role] || role
}

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    super_admin: 'Полный доступ ко всей системе',
    admin: 'Управление своей командой и финансами',
    super_manager: 'Управление менеджерами и экскурсиями',
    manager: 'Создание экскурсий и работа с клиентами',
    guide: 'Проведение экскурсий',
    client: 'Бронирование экскурсий',
  }
  return descriptions[role] || ''
}
