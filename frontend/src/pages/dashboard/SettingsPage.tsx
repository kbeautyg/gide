import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Bell } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden max-w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Настройки</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Управление профилем и параметрами учетной записи</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User size={18} className="sm:w-5 sm:h-5" />
            Профиль
          </CardTitle>
          <CardDescription className="text-sm">Обновите информацию о своем профиле</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" placeholder="Ваше имя" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" type="tel" placeholder="+7 (999) 999-99-99" disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" />
          </div>
          <Button className="w-full sm:w-auto">Сохранить изменения</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Lock size={18} className="sm:w-5 sm:h-5" />
            Безопасность
          </CardTitle>
          <CardDescription className="text-sm">Изменение пароля и настройки безопасности</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Текущий пароль</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Новый пароль</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Подтвердите пароль</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button className="w-full sm:w-auto">Изменить пароль</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Bell size={18} className="sm:w-5 sm:h-5" />
            Уведомления
          </CardTitle>
          <CardDescription className="text-sm">Управление уведомлениями</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="font-medium text-sm sm:text-base">Email уведомления</div>
              <div className="text-xs sm:text-sm text-gray-500">Получать уведомления на email</div>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">Включить</Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="font-medium text-sm sm:text-base">Telegram уведомления</div>
              <div className="text-xs sm:text-sm text-gray-500">Получать уведомления в Telegram</div>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">Настроить</Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="font-medium text-sm sm:text-base">Push уведомления</div>
              <div className="text-xs sm:text-sm text-gray-500">Уведомления в браузере</div>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">Включить</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
