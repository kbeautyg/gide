import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Bell } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-gray-600 mt-1">Управление профилем и параметрами учетной записи</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Профиль
          </CardTitle>
          <CardDescription>Обновите информацию о своем профиле</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
          <Button>Сохранить изменения</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            Безопасность
          </CardTitle>
          <CardDescription>Изменение пароля и настройки безопасности</CardDescription>
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
          <Button>Изменить пароль</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            Уведомления
          </CardTitle>
          <CardDescription>Управление уведомлениями</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email уведомления</div>
              <div className="text-sm text-gray-500">Получать уведомления на email</div>
            </div>
            <Button variant="outline" size="sm">Включить</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Telegram уведомления</div>
              <div className="text-sm text-gray-500">Получать уведомления в Telegram</div>
            </div>
            <Button variant="outline" size="sm">Настроить</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push уведомления</div>
              <div className="text-sm text-gray-500">Уведомления в браузере</div>
            </div>
            <Button variant="outline" size="sm">Включить</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
