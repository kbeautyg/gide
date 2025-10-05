import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react'

export default function FinancesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Финансы</h1>
          <p className="text-gray-600 mt-1">Управление балансами и платежами</p>
        </div>
        <Button className="gap-2">
          <ArrowUpRight size={20} />
          Вывести средства
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Баланс RUB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ₽</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              Доступно для вывода
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Баланс USD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-gray-500 mt-1">В иностранной валюте</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Баланс THB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿0.00</div>
            <p className="text-xs text-gray-500 mt-1">Тайские баты</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Последние транзакции</CardTitle>
            <CardDescription>История финансовых операций</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Wallet size={48} className="mx-auto mb-4 opacity-50" />
              <p>Транзакции не найдены</p>
              <p className="text-sm mt-2">Здесь будет отображаться история ваших операций</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Заявки на вывод</CardTitle>
            <CardDescription>Статус заявок на вывод средств</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
              <p>Заявок нет</p>
              <p className="text-sm mt-2">Создайте заявку на вывод средств</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Курсы валют</CardTitle>
          <CardDescription>Текущие курсы обмена</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">USD/RUB</div>
              <div className="text-2xl font-bold">91.50</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">THB/RUB</div>
              <div className="text-2xl font-bold">2.70</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">EUR/RUB</div>
              <div className="text-2xl font-bold">99.50</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
