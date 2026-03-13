import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Bell } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { usersApi } from '@/lib/api'
import { toast } from '@/lib/toast'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const { user, token, setAuth } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: () => usersApi.updateProfile({
      name: profileData.name || undefined,
      email: profileData.email || undefined,
      bio: profileData.bio || undefined,
    }),
    onSuccess: (response) => {
      // Update local store with new data
      if (response?.data && token) {
        setAuth(response.data, token)
      }
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('Профиль обновлён', 'Ваши данные успешно сохранены')
    },
    onError: (error: any) => {
      toast.error('Ошибка сохранения', error.response?.data?.detail || 'Не удалось обновить профиль')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: () => usersApi.changePassword({
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
    }),
    onSuccess: () => {
      toast.success('Пароль изменён', 'Новый пароль успешно установлен')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (error: any) => {
      toast.error('Ошибка смены пароля', error.response?.data?.detail || 'Проверьте текущий пароль')
    },
  })

  const handleSaveProfile = () => {
    saveProfileMutation.mutate()
  }

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Заполните все поля пароля')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Новый пароль должен быть минимум 6 символов')
      return
    }
    changePasswordMutation.mutate()
  }

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Настройки</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Управление профилем и параметрами учетной записи</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <User size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                    Личные данные
                </CardTitle>
                <CardDescription className="text-sm">Информация, видимая другим пользователям (для гидов)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input 
                          id="name" 
                          value={profileData.name} 
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          placeholder="Ваше имя" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input id="phone" type="tel" value={user?.phone || ''} disabled className="bg-gray-50" />
                        <p className="text-xs text-gray-500">Номер телефона нельзя изменить</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email} 
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="your@email.com" 
                    />
                </div>
                
                {user?.role === 'manager' || user?.role === 'guide' ? (
                     <div className="space-y-2">
                        <Label htmlFor="bio">О себе (для туристов)</Label>
                        <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Расскажите о своем опыте..."
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        />
                     </div>
                ) : null}

                <Button 
                  className="w-full sm:w-auto" 
                  onClick={handleSaveProfile} 
                  disabled={saveProfileMutation.isPending}
                >
                    {saveProfileMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Lock size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                    Безопасность
                </CardTitle>
                <CardDescription className="text-sm">Изменение пароля</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Текущий пароль</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Введите текущий пароль"
                    />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Новый пароль</Label>
                        <Input 
                          id="new-password" 
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Минимум 6 символов"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                        <Input 
                          id="confirm-password" 
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Повторите пароль"
                        />
                    </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Изменение...' : 'Изменить пароль'}
                </Button>
                </CardContent>
            </Card>
        </div>

        {/* Sidebar / Notifications */}
        <div className="space-y-6">
             <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Bell size={18} className="sm:w-5 sm:h-5 text-orange-500" />
                    Уведомления
                </CardTitle>
                <CardDescription className="text-sm">Где вы хотите получать оповещения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between opacity-60">
                    <div>
                        <div className="font-medium text-sm">Email рассылка</div>
                        <div className="text-xs text-gray-500">Новости и акции</div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Скоро</span>
                </div>
                <div className="flex items-center justify-between opacity-60">
                    <div>
                        <div className="font-medium text-sm">Telegram бот</div>
                        <div className="text-xs text-gray-500">Статус заказов</div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Скоро</span>
                </div>
                </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div>
                            <div className="font-medium text-blue-900">
                              {user?.role === 'admin' || user?.role === 'super_admin' ? 'Администратор' : user?.role === 'manager' || user?.role === 'guide' ? 'Гид' : 'Турист'}
                            </div>
                            <div className="text-xs text-blue-600">ID: {user?.id}</div>
                        </div>
                    </div>
                    <p className="text-xs text-blue-700">
                        Ваш аккаунт активен и подтвержден. При возникновении вопросов обращайтесь в поддержку.
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
