import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Wallet, Plus } from 'lucide-react'
import { formatRUB } from '@/lib/utils'
import { api } from '@/lib/api'

export default function AdminDashboardPage() {
  const queryClient = useQueryClient()

  // Загрузка команды
  const { data: teamData } = useQuery({
    queryKey: ['users', 'team'],
    queryFn: async () => {
      const response = await api.get('/admin/users/my-team')
      return response.data
    },
  })

  // Загрузка всех экскурсий
  const { data: toursData } = useQuery({
    queryKey: ['tours', 'all'],
    queryFn: async () => {
      const response = await api.get('/tours/')
      return response.data
    },
  })

  const team = teamData || []
  const tours = toursData || []
  const superManagers = team.filter((u: any) => u.role === 'super_manager')
  const managers = team.filter((u: any) => u.role === 'manager' || u.role === 'guide')
  const totalBalance = team.reduce((sum: number, u: any) => sum + (u.balance_rub || 0), 0)
  const inactiveTours = tours.filter((t: any) => !t.active)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-600">Дашборд Админа</h1>
        <p className="text-gray-600 mt-1">Управление вашей командой</p>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-blue-600">
              <Users size={18} />
              Всего в команде
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{team.length}</p>
            <p className="text-xs text-gray-600">Пользователей</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-green-600">
              <Users size={18} />
              Супер-менеджеры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{superManagers.length}</p>
            <p className="text-xs text-gray-600">Активных</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-orange-600">
              <Users size={18} />
              Менеджеры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{managers.length}</p>
            <p className="text-xs text-gray-600">Активных</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-blue-600">
              <Wallet size={18} />
              Общий баланс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatRUB(totalBalance)}</p>
            <p className="text-xs text-gray-600">Команды</p>
          </CardContent>
        </Card>
      </div>

      {/* Экскурсии ожидают активации */}
      {inactiveTours.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600">Экскурсии ожидают активации</CardTitle>
            <CardDescription>Экскурсии созданные менеджерами, которые можно добавить на главную страницу</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveTours.map((tour: any) => (
                <div key={tour.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <div>
                    <div className="font-medium">{tour.title}</div>
                    <div className="text-sm text-gray-500">Гид: {tour.guide_name}</div>
                    <div className="text-sm text-gray-500">{formatRUB(tour.price)}</div>
                  </div>
                  <Button 
                    onClick={async () => {
                      try {
                        await api.put(`/tours/${tour.id}/activate`)
                        alert(`Экскурсия "${tour.title}" добавлена на главную страницу!`)
                        queryClient.invalidateQueries({ queryKey: ['tours'] })
                      } catch (error) {
                        alert('Ошибка при активации экскурсии')
                      }
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus size={16} className="mr-2" />
                    Добавить на сайт
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список команды */}
      <Card>
        <CardHeader>
          <CardTitle>Моя команда</CardTitle>
          <CardDescription>Все пользователи, которых вы создали</CardDescription>
        </CardHeader>
        <CardContent>
          {team.length > 0 ? (
            <div className="space-y-3">
              {team.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      user.role === 'super_manager' ? 'bg-green-100 text-green-600' :
                      user.role === 'manager' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100'
                    }`}>
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="font-medium">{user.name || user.phone}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'super_manager' ? 'bg-green-100 text-green-800' :
                      user.role === 'manager' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100'
                    }`}>
                      {user.role === 'super_manager' ? 'Супер-менеджер' : 
                       user.role === 'manager' ? 'Менеджер' : user.role}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatRUB(user.balance_rub || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Команда пуста</p>
              <p className="text-sm mt-2">Создайте первого пользователя</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
