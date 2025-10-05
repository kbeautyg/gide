import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, Wallet, DollarSign, Plus } from 'lucide-react'
import { formatRUB } from '@/lib/utils'
import { CreateUserDialog } from '@/components/CreateUserDialog'

export default function SuperAdminDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Дашборд Супер-Админа</h1>
        <Button variant="tropical" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2" size={18} />
          Создать админа
        </Button>
      </div>

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Общая статистика */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Общая статистика за месяц</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp size={18} className="text-tropical-turquoise" />
                Общий оборот
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatRUB(0)}</p>
              <p className="text-xs text-gray-600">+0% к прошлому месяцу</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet size={18} className="text-tropical-coral" />
                Комиссия сервиса
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-tropical-coral">{formatRUB(0)}</p>
              <p className="text-xs text-gray-600">2.8% от оборота</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign size={18} className="text-tropical-gold" />
                Комиссия обменников
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatRUB(0)}</p>
              <p className="text-xs text-gray-600">0.2% от оборота</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users size={18} className="text-tropical-ocean" />
                Долг обменникам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{formatRUB(0)}</p>
              <p className="text-xs text-gray-600">Текущий долг</p>
            </CardContent>
        </Card>
        </div>
      </div>

      {/* Админы */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика по админам</CardTitle>
          <CardDescription>Оборот и команда каждого админа</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Админ</th>
                  <th className="text-left p-2">Команда</th>
                  <th className="text-left p-2">Оборот</th>
                  <th className="text-left p-2">Комиссия</th>
                  <th className="text-left p-2">Баланс</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-600">
                    Нет данных. Создайте первого админа!
                  </td>
                </tr>
              </tbody>
            </table>
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
