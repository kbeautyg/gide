import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MapPin, Calendar, Wallet } from 'lucide-react'
import { formatRUB } from '@/lib/utils'
import { api } from '@/lib/api'

export default function SuperManagerDashboardPage() {

  // Загрузка команды
  const { data: teamData } = useQuery({
    queryKey: ['users', 'team'],
    queryFn: async () => {
      const response = await api.get('/admin/users/my-team')
      return response.data
    },
  })

  const team = teamData || []
  const managers = team.filter((u: any) => u.role === 'manager' || u.role === 'guide')
  const totalBalance = team.reduce((sum: number, u: any) => sum + (u.balance_rub || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-600">Дашборд Супер-Менеджера</h1>
        <p className="text-gray-600 mt-1">Управление менеджерами и экскурсиями</p>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-green-600">
              <Users size={18} />
              Менеджеры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{managers.length}</p>
            <p className="text-xs text-gray-600">В команде</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-blue-600">
              <MapPin size={18} />
              Экскурсии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-gray-600">Всего туров</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-orange-600">
              <Calendar size={18} />
              Бронирования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-gray-600">За месяц</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-green-600">
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

      {/* Список менеджеров */}
      <Card>
        <CardHeader>
          <CardTitle>Мои менеджеры</CardTitle>
          <CardDescription>Все менеджеры, которых вы создали</CardDescription>
        </CardHeader>
        <CardContent>
          {managers.length > 0 ? (
            <div className="space-y-3">
              {managers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="font-medium">{user.name || user.phone}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Менеджер
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
              <p>Нет менеджеров</p>
              <p className="text-sm mt-2">Создайте первого менеджера</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
