import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, Calendar, Users, MapPin, CreditCard, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'
import { useState } from 'react'
import { AssignRoleDialog } from '@/components/AssignRoleDialog'
import { useAuthStore } from '@/lib/store'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const [assignRoleOpen, setAssignRoleOpen] = useState(false)

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const response = await api.get(`/profile/${userId}`)
      return response.data
    },
  })

  const { data: statistics } = useQuery({
    queryKey: ['user-statistics', userId],
    queryFn: async () => {
      const response = await api.get(`/profile/${userId}/statistics`)
      return response.data
    },
    enabled: !!profile,
  })

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tropical-ocean"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Профиль не найден</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Вернуться назад
        </Button>
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800 border-purple-300',
    admin: 'bg-blue-100 text-blue-800 border-blue-300',
    super_manager: 'bg-green-100 text-green-800 border-green-300',
    manager: 'bg-orange-100 text-orange-800 border-orange-300',
    guide: 'bg-orange-100 text-orange-800 border-orange-300',
    client: 'bg-gray-100 text-gray-800 border-gray-300',
  }

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      super_admin: 'Супер-админ',
      admin: 'Админ',
      super_manager: 'Супер-менеджер',
      manager: 'Менеджер',
      guide: 'Гид',
      client: 'Клиент',
    }
    return names[role] || role
  }

  const canAssignRole = () => {
    if (!currentUser) return false
    if (currentUser.role === 'super_admin') return true
    if (currentUser.role === 'admin' && profile.role !== 'super_admin') return true
    if (currentUser.role === 'super_manager' && profile.role === 'manager') return true
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-tropical-ocean">Профиль пользователя</h1>
            <p className="text-gray-600 mt-1">Детальная информация и статистика</p>
          </div>
        </div>
        {canAssignRole() && (
          <Button variant="tropical" onClick={() => setAssignRoleOpen(true)}>
            Назначить роль
          </Button>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-tropical-turquoise to-tropical-ocean flex items-center justify-center text-white text-3xl font-bold">
                {profile.name ? profile.name[0].toUpperCase() : profile.phone[0]}
              </div>
            </div>
            <CardTitle className="text-center">{profile.name || 'Без имени'}</CardTitle>
            <CardDescription className="text-center">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${roleColors[profile.role] || ''}`}>
                {getRoleName(profile.role)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-gray-400" />
                <span>{profile.phone}</span>
              </div>
              {profile.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span>{profile.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span>С {new Date(profile.created_at).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Балансы</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">RUB:</span>
                  <span className="font-semibold">{formatRUB(profile.balance_rub)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">USD:</span>
                  <span className="font-semibold">${profile.balance_usd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">THB:</span>
                  <span className="font-semibold">฿{profile.balance_thb.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {profile.parent && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2">Создан пользователем</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">{profile.parent.name}</p>
                  <p className="text-xs text-gray-600">{profile.parent.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">{getRoleName(profile.parent.role)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Statistics */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {profile.role in ['manager', 'guide'] && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin size={18} className="text-tropical-ocean" />
                    Экскурсии
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{profile.stats.tours_count}</p>
                  <p className="text-xs text-gray-600 mt-1">Всего создано</p>
                </CardContent>
              </Card>
            )}
            
            {profile.role === 'client' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CreditCard size={18} className="text-tropical-ocean" />
                    Бронирования
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{profile.stats.bookings_count}</p>
                  <p className="text-xs text-gray-600 mt-1">Всего оформлено</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users size={18} className="text-tropical-ocean" />
                  Команда
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{profile.stats.team_count}</p>
                <p className="text-xs text-gray-600 mt-1">Подчиненных</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp size={18} className="text-tropical-ocean" />
                  Активность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">Активен</p>
                <p className="text-xs text-gray-600 mt-1">Статус аккаунта</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          {statistics && (
            <>
              {/* Team by Role Chart */}
              {statistics.team_by_role && statistics.team_by_role.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Состав команды</CardTitle>
                    <CardDescription>Распределение по ролям</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statistics.team_by_role.map((item: any) => (
                        <div key={item.role} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg ${roleColors[item.role] || 'bg-gray-100'} flex items-center justify-center font-semibold`}>
                              {item.count}
                            </div>
                            <span className="font-medium">{getRoleName(item.role)}</span>
                          </div>
                          <div className="w-1/2 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-tropical-ocean h-2 rounded-full transition-all"
                              style={{ width: `${(item.count / profile.stats.team_count) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tours by Status Chart */}
              {statistics.tours_by_status && statistics.tours_by_status.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Статистика экскурсий</CardTitle>
                    <CardDescription>Распределение по статусам</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {statistics.tours_by_status.map((item: any) => (
                        <div key={item.status} className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-3xl font-bold text-tropical-ocean">{item.count}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.status === 'active' ? 'Активные' : 'Неактивные'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bookings Timeline */}
              {statistics.bookings_by_day && statistics.bookings_by_day.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Активность бронирований</CardTitle>
                    <CardDescription>За последние 30 дней</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {statistics.bookings_by_day.slice(0, 10).map((item: any) => (
                        <div key={item.date} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{new Date(item.date).toLocaleDateString('ru-RU')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-tropical-ocean h-2 rounded-full"
                                style={{ width: `${Math.min(item.count * 20, 100)}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold w-8 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assign Role Dialog */}
      <AssignRoleDialog
        open={assignRoleOpen}
        onOpenChange={setAssignRoleOpen}
        user={{
          id: profile.id,
          name: profile.name,
          phone: profile.phone,
          role: profile.role,
        }}
      />
    </div>
  )
}
