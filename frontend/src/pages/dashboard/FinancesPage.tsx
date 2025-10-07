import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown, Calendar, CreditCard, DollarSign } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function FinancesPage() {
  // Загрузка транзакций
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/transactions/')
      return response.data
    },
  })

  // Загрузка профиля для балансов
  const { data: profileData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await api.get('/users/me')
      return response.data
    },
  })

  const transactions = transactionsData?.transactions || []
  const totalTransactions = transactionsData?.total || 0
  
  const balance_rub = profileData?.balance_rub || 0
  const balance_usd = profileData?.balance_usd || 0
  const balance_thb = profileData?.balance_thb || 0

  // Статистика
  const totalIncome = transactions
    .filter((t: any) => t.type === 'booking_payment')
    .reduce((sum: number, t: any) => sum + t.amount_rub, 0)
  
  const totalWithdrawals = transactions
    .filter((t: any) => t.type === 'withdrawal')
    .reduce((sum: number, t: any) => sum + t.amount_rub, 0)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'booking_payment':
        return <TrendingUp className="text-green-600" size={20} />
      case 'withdrawal':
        return <TrendingDown className="text-red-600" size={20} />
      case 'refund':
        return <TrendingDown className="text-orange-600" size={20} />
      case 'exchange':
        return <DollarSign className="text-blue-600" size={20} />
      default:
        return <CreditCard className="text-gray-600" size={20} />
    }
  }

  const getTransactionTypeName = (type: string) => {
    const types: Record<string, string> = {
      booking_payment: 'Оплата бронирования',
      withdrawal: 'Вывод средств',
      refund: 'Возврат',
      exchange: 'Обмен валюты',
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-tropical-ocean">Финансы</h1>
        <p className="text-gray-600 mt-1">Управление балансом и история транзакций</p>
      </div>

      {/* Балансы */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <Wallet size={18} />
              Баланс RUB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatRUB(balance_rub)}</p>
            <p className="text-xs text-gray-500 mt-1">Доступно для вывода</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
              <DollarSign size={18} />
              Баланс USD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">${balance_usd.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Доступно для вывода</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-600">
              <Wallet size={18} />
              Баланс THB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">฿{balance_thb.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Доступно для вывода</p>
          </CardContent>
        </Card>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp size={20} />
              Доход за всё время
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{formatRUB(totalIncome)}</p>
            <p className="text-sm text-gray-600 mt-2">Из {transactions.filter((t: any) => t.type === 'booking_payment').length} бронирований</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown size={20} />
              Выведено средств
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">{formatRUB(totalWithdrawals)}</p>
            <p className="text-sm text-gray-600 mt-2">Всего операций: {transactions.filter((t: any) => t.type === 'withdrawal').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* История транзакций */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            История транзакций
          </CardTitle>
          <CardDescription>
            Всего операций: {totalTransactions}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tropical-ocean mx-auto mb-4"></div>
              <p>Загрузка транзакций...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wallet size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет транзакций</p>
              <p className="text-sm mt-2">Транзакции появятся после оплаты бронирований</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-tropical-ocean transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'booking_payment' ? 'bg-green-100' :
                      transaction.type === 'withdrawal' ? 'bg-red-100' :
                      transaction.type === 'refund' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-semibold">{getTransactionTypeName(transaction.type)}</p>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {new Date(transaction.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      transaction.type === 'booking_payment' ? 'text-green-600' :
                      transaction.type === 'withdrawal' ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}{formatRUB(transaction.amount_rub)}
                    </p>
                    {transaction.booking_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Бронирование #{transaction.booking_id}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}