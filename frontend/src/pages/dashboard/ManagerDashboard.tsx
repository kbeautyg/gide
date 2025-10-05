import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Wallet, Plus } from 'lucide-react'

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Дашборд Менеджера</h1>
        <Button variant="tropical">
          <Plus className="mr-2" size={18} />
          Создать экскурсию
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} className="text-tropical-turquoise" />
              Мои экскурсии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-600">Активных экскурсий</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} className="text-tropical-coral" />
              Бронирования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-600">Активных броней</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet size={20} className="text-tropical-gold" />
              Баланс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0 ₽</p>
            <p className="text-sm text-gray-600">Доступно для вывода</p>
          </CardContent>
        </Card>
      </div>

      {/* Последние бронирования */}
      <Card>
        <CardHeader>
          <CardTitle>Последние бронирования</CardTitle>
          <CardDescription>Новые заказы на ваши экскурсии</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Пока нет бронирований. Создайте экскурсию чтобы начать принимать заказы!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
