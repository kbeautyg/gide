import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Bell } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-4 md:space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Настройки</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Управление профилем и параметрами учетной записи</p>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <User size={18} className="md:w-5 md:h-5" />
            Профиль
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Обновите информацию о своем профиле</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="name" className="text-xs md:text-sm">Имя</Label>
              <Input id="name" placeholder="Ваше имя" className="text-sm md:text-base" />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="phone" className="text-xs md:text-sm">Телефон</Label>
              <Input id="phone" type="tel" placeholder="+7 (999) 999-99-99" disabled className="text-sm md:text-base" />
            </div>
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" className="text-sm md:text-base" />
          </div>
          <Button className="w-full sm:w-auto text-xs md:text-sm">Сохранить изменения</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Lock size={18} className="md:w-5 md:h-5" />
            Безопасность
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Изменение пароля и настройки безопасности</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="current-password" className="text-xs md:text-sm">Текущий пароль</Label>
            <Input id="current-password" type="password" className="text-sm md:text-base" />
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="new-password" className="text-xs md:text-sm">Новый пароль</Label>
            <Input id="new-password" type="password" className="text-sm md:text-base" />
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="confirm-password" className="text-xs md:text-sm">Подтвердите пароль</Label>
            <Input id="confirm-password" type="password" className="text-sm md:text-base" />
          </div>
          <Button className="w-full sm:w-auto text-xs md:text-sm">Изменить пароль</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Bell size={18} className="md:w-5 md:h-5" />
            Уведомления
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Управление уведомлениями</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm md:text-base">Email уведомления</div>
              <div className="text-xs md:text-sm text-gray-500">Получать уведомления на email</div>
            </div>
            <Button variant="outline" size="sm" className="flex-shrink-0 text-xs md:text-sm">Включить</Button>
          </div>
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm md:text-base">Telegram уведомления</div>
              <div className="text-xs md:text-sm text-gray-500">Получать уведомления в Telegram</div>
            </div>
            <Button variant="outline" size="sm" className="flex-shrink-0 text-xs md:text-sm">Настроить</Button>
          </div>
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm md:text-base">Push уведомления</div>
              <div className="text-xs md:text-sm text-gray-500">Уведомления в браузере</div>
            </div>
            <Button variant="outline" size="sm" className="flex-shrink-0 text-xs md:text-sm">Включить</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
