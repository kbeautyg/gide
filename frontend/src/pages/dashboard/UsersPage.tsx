import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, UserPlus, Mail, Phone, Search, Filter, TrendingUp } from 'lucide-react'
import { CreateUserDialog } from '@/components/CreateUserDialog'
import { api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

export default function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const { user } = useAuthStore()

  // Загрузка команды
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['users', 'team'],
    queryFn: async () => {
      const response = await api.get('/admin/users/my-team')
      return response.data
    },
  })

  const team = teamData || []

  // Фильтрация
  const filteredTeam = team.filter((u: any) => {
    const matchesSearch = !searchTerm || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || u.role === selectedRole
    
    return matchesSearch && matchesRole
  })

  // Статистика по ролям
  const roleStats = {
    admin: team.filter((u: any) => u.role === 'admin').length,
    super_manager: team.filter((u: any) => u.role === 'super_manager').length,
    manager: team.filter((u: any) => u.role === 'manager' || u.role === 'guide').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управление командой</h1>
          <p className="text-gray-600 mt-1">Создание и управление вашей командой</p>
        </div>
        <Button 
          className="gap-2 cursor-pointer" 
          onClick={() => setDialogOpen(true)}
          type="button"
        >
          <UserPlus size={20} />
          Добавить пользователя
        </Button>
      </div>

      {dialogOpen && <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-600">Всего в команде</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{team.length}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              Активных пользователей
            </p>
          </CardContent>
        </Card>

        {user?.role === 'super_admin' && (
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600">Админы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{roleStats.admin}</div>
              <p className="text-xs text-gray-500 mt-1">В системе</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Супер-менеджеры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roleStats.super_manager}</div>
            <p className="text-xs text-gray-500 mt-1">Активных</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">Менеджеры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roleStats.manager}</div>
            <p className="text-xs text-gray-500 mt-1">Активных</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Список команды</CardTitle>
              <CardDescription>Все пользователи, которых вы создали</CardDescription>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Поиск по имени, телефону, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white min-w-[180px]"
            >
              <option value="all">Все роли</option>
              {user?.role === 'super_admin' && <option value="admin">Админы</option>}
              <option value="super_manager">Супер-менеджеры</option>
              <option value="manager">Менеджеры</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p>Загрузка команды...</p>
            </div>
          ) : filteredTeam.length > 0 ? (
            <div className="space-y-2">
              {filteredTeam.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-600' :
                      user.role === 'super_manager' ? 'bg-green-100 text-green-600' :
                      user.role === 'manager' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100'
                    }`}>
                      {user.name?.[0] || user.phone?.[0] || '?'}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{user.name || user.phone}</div>
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
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'super_manager' ? 'bg-green-100 text-green-800' :
                      user.role === 'manager' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100'
                    }`}>
                      {user.role === 'admin' ? 'Админ' : 
                       user.role === 'super_manager' ? 'Супер-менеджер' :
                       user.role === 'manager' ? 'Менеджер' : user.role}
                    </span>
                    <div className="text-right min-w-[120px]">
                      <div className="text-lg font-bold">{formatRUB(user.balance_rub || 0)}</div>
                      <div className="text-xs text-gray-500">Баланс</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // TODO: Открыть диалог назначения роли
                          alert(`Назначить роль для ${user.name || user.phone}`)
                        }}
                      >
                        Назначить роль
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || selectedRole !== 'all' ? (
                <>
                  <Filter size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Пользователи не найдены</p>
                  <p className="text-sm mt-2">Попробуйте изменить фильтры</p>
                </>
              ) : (
                <>
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Команда пуста</p>
                  <p className="text-sm mt-2">Добавьте первого пользователя</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
