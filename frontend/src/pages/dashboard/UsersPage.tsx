import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, Mail, Phone } from 'lucide-react'
import { CreateUserDialog } from '@/components/CreateUserDialog'
import { api } from '@/lib/api'

export default function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Загрузка команды
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['users', 'team'],
    queryFn: async () => {
      const response = await api.get('/admin/users/my-team')
      return response.data
    },
  })

  const team = teamData || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
          <p className="text-gray-600 mt-1">Создание и управление гидами, менеджерами и администраторами</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <UserPlus size={20} />
          Добавить пользователя
        </Button>
      </div>

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.length}</div>
            <p className="text-xs text-gray-500 mt-1">В вашей команде</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Менеджеры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {team.filter((u: any) => u.role === 'manager' || u.role === 'guide').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Активных менеджеров</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Админы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {team.filter((u: any) => u.role === 'admin' || u.role === 'super_manager').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Администраторов</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
          <CardDescription>Все пользователи вашей команды</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Загрузка...</div>
          ) : team.length > 0 ? (
            <div className="space-y-3">
              {team.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-tropical-turquoise/20 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-tropical-turquoise" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name || user.phone}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {user.phone}
                        </span>
                        {user.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {user.role === 'manager' ? 'Менеджер' : 
                       user.role === 'admin' ? 'Админ' : 
                       user.role === 'super_manager' ? 'Супер-менеджер' : user.role}
                    </span>
                    <span className="text-sm text-gray-600">
                      {user.balance_rub.toFixed(0)} ₽
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пользователи не найдены</p>
              <p className="text-sm mt-2">Добавьте первого пользователя нажав кнопку выше</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
