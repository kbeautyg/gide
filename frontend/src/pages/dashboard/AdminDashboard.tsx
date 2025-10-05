import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, MapPin, Wallet, TrendingUp, Plus } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Дашборд Админа</h1>
        <Button variant="tropical">
          <Plus className="mr-2" size={18} />
          Создать менеджера
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users size={18} className="text-tropical-turquoise" />
              Моя команда
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-gray-600">Менеджеров</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin size={18} className="text-tropical-coral" />
              Экскурсии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-gray-600">Всего</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={18} className="text-tropical-gold" />
              Оборот
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 ₽</p>
            <p className="text-xs text-gray-600">За месяц</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet size={18} className="text-tropical-ocean" />
              Баланс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 ₽</p>
            <p className="text-xs text-gray-600">Доступно</p>
          </CardContent>
        </Card>
      </div>

      {/* Моя команда */}
      <Card>
        <CardHeader>
          <CardTitle>Моя команда</CardTitle>
          <CardDescription>Супер-менеджеры и менеджеры</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Команда пуста. Создайте первого менеджера!
          </p>
        </CardContent>
      </Card>

      {/* Финансы */}
      <Card>
        <CardHeader>
          <CardTitle>Заявки на вывод средств</CardTitle>
          <CardDescription>Ваши заявки на вывод</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Нет активных заявок
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
