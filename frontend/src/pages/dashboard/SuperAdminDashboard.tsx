import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Wallet, Search, Eye } from 'lucide-react'
import { formatRUB } from '@/lib/utils'
import { api } from '@/lib/api'

export default function SuperAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')

  // Загрузка всех пользователей (супер-админ видит всех)
  const { data: allUsersData } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const response = await api.get('/admin/users/my-team') // TODO: создать эндпоинт /admin/users/all для супер-админа
      return response.data
    },
  })

  const allUsers = allUsersData || []
  
  // Фильтрация
  const filteredUsers = allUsers.filter((u: any) => {
    const matchesSearch = !searchTerm || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || u.role === selectedRole
    
    return matchesSearch && matchesRole
  })

  // Статистика
  const admins = allUsers.filter((u: any) => u.role === 'admin')
  const superManagers = allUsers.filter((u: any) => u.role === 'super_manager')
  const managers = allUsers.filter((u: any) => u.role === 'manager' || u.role === 'guide')
  const totalBalance = allUsers.reduce((sum: number, u: any) => sum + (u.balance_rub || 0), 0)

  // Группировка по админам для детальной статистики
  const adminStats = admins.map((admin: any) => {
    const adminTeam = allUsers.filter((u: any) => u.parent_id === admin.id)
    const teamBalance = adminTeam.reduce((sum: number, u: any) => sum + (u.balance_rub || 0), 0)
    return {
      ...admin,
      teamCount: adminTeam.length,
      teamBalance,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-600">Дашборд Супер-Админа</h1>
        <p className="text-gray-600 mt-1">Полный контроль над всей системой</p>
      </div>

      {/* Общая статистика */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Общая статистика системы</h2>
        <div className="grid md:grid-cols-5 gap-4">
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-purple-600">
                <Users size={16} />
                Всего пользователей
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{allUsers.length}</p>
              <p className="text-xs text-gray-600 mt-1">В системе</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-blue-600">
                <Users size={16} />
                Админы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{admins.length}</p>
              <p className="text-xs text-gray-600 mt-1">{formatRUB(admins.reduce((s: number, u: any) => s + (u.balance_rub || 0), 0))}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-green-600">
                <Users size={16} />
                Супер-менеджеры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{superManagers.length}</p>
              <p className="text-xs text-gray-600 mt-1">{formatRUB(superManagers.reduce((s: number, u: any) => s + (u.balance_rub || 0), 0))}</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-orange-600">
                <Users size={16} />
                Менеджеры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{managers.length}</p>
              <p className="text-xs text-gray-600 mt-1">{formatRUB(managers.reduce((s: number, u: any) => s + (u.balance_rub || 0), 0))}</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-purple-600">
                <Wallet size={16} />
                Общий баланс
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{formatRUB(totalBalance)}</p>
              <p className="text-xs text-gray-600 mt-1">Всей системы</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Детальная статистика по админам */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика по админам</CardTitle>
          <CardDescription>Детальная информация о каждом админе и его команде</CardDescription>
        </CardHeader>
        <CardContent>
          {adminStats.length > 0 ? (
            <div className="space-y-4">
              {adminStats.map((admin: any) => (
                <div key={admin.id} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {admin.name?.[0] || 'A'}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{admin.name || admin.phone}</div>
                        <div className="text-sm text-gray-600">{admin.phone}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye size={16} />
                      Подробнее
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{admin.teamCount}</div>
                      <div className="text-xs text-gray-600 mt-1">Пользователей в команде</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formatRUB(admin.teamBalance)}</div>
                      <div className="text-xs text-gray-600 mt-1">Баланс команды</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{formatRUB(admin.balance_rub || 0)}</div>
                      <div className="text-xs text-gray-600 mt-1">Личный баланс</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Нет админов</p>
              <p className="text-sm mt-2">Создайте первого админа</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Все пользователи с фильтрами */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Все пользователи системы</CardTitle>
              <CardDescription>Поиск и фильтрация по ролям</CardDescription>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
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
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">Все роли</option>
              <option value="admin">Админы</option>
              <option value="super_manager">Супер-менеджеры</option>
              <option value="manager">Менеджеры</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-600' :
                      user.role === 'super_manager' ? 'bg-green-100 text-green-600' :
                      user.role === 'manager' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100'
                    }`}>
                      {user.name?.[0] || user.phone?.[0] || '?'}
                    </div>
                    <div>
                      <div className="font-medium">{user.name || user.phone}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'super_manager' ? 'bg-green-100 text-green-800' :
                      user.role === 'manager' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100'
                    }`}>
                      {user.role === 'admin' ? 'Админ' :
                       user.role === 'super_manager' ? 'Супер-менеджер' :
                       user.role === 'manager' ? 'Менеджер' : user.role}
                    </span>
                    <span className="text-sm font-medium min-w-[100px] text-right">
                      {formatRUB(user.balance_rub || 0)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Пользователи не найдены
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Курсы валют */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Курсы валют</CardTitle>
              <CardDescription>Базовый и объемные курсы</CardDescription>
            </div>
            <Button variant="outline" size="sm">Изменить</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Базовый курс (Rapira)</p>
              <p className="text-2xl font-bold">91.50 ₽/USDT</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">С комиссией обменника</p>
              <p className="text-2xl font-bold">91.70 ₽/USDT</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
