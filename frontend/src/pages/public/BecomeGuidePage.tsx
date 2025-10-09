import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, MapPin, DollarSign, Users, Trophy, CheckCircle, Send, Calendar, CreditCard, TrendingUp, QrCode, Wallet, BarChart3, Clock, Star } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function BecomeGuidePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    experience: '',
    languages: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Guide application:', formData)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block p-3 bg-airbnb-rausch/10 rounded-full mb-4">
            <UserPlus size={48} className="text-airbnb-rausch" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Подключитесь к платформе<br />
            <span className="text-airbnb-rausch">и начните зарабатывать уже сегодня</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ThaiGuide Pro — это не просто площадка для экскурсий. Это полноценная система управления 
            вашим бизнесом: бронирования, платежи, статистика и выплаты в одном месте.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Button size="lg" variant="tropical" className="text-lg px-8 py-6">
              Начать сейчас
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Посмотреть демо
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Preview - ГЛАВНЫЙ КОЗЫРЬ */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Ваш личный кабинет гида
            </h2>
            <p className="text-lg text-gray-600">
              Управляйте экскурсиями, принимайте платежи и следите за финансами в одном интерфейсе
            </p>
          </div>

          {/* Mockup Dashboard */}
          <Card className="max-w-6xl mx-auto border-4 border-airbnb-rausch shadow-airbnb-lg overflow-hidden">
            <div className="bg-gradient-to-r from-airbnb-rausch to-airbnb-arches p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Иван Петров</p>
                    <p className="text-xs opacity-90">Гид • Пхукет</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs opacity-90">Доход за месяц</p>
                    <p className="text-xl font-bold">187,500 ₽</p>
                  </div>
                  <Button size="sm" className="bg-white text-airbnb-rausch hover:bg-white/90">
                    Выставить счет
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex">
              {/* Sidebar Menu */}
              <div className="w-64 bg-gray-50 border-r p-4 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-airbnb-rausch/10 text-airbnb-rausch rounded-lg font-semibold">
                  <BarChart3 size={18} />
                  <span>Дашборд</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <MapPin size={18} />
                  <span>Мои экскурсии</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Calendar size={18} />
                  <span>Календарь</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <CreditCard size={18} />
                  <span>Заказы</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Wallet size={18} />
                  <span>Финансы</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 bg-white">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Активных экскурсий</p>
                          <p className="text-3xl font-bold text-green-600">12</p>
                        </div>
                        <MapPin size={32} className="text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Заказов за месяц</p>
                          <p className="text-3xl font-bold text-blue-600">28</p>
                        </div>
                        <CreditCard size={32} className="text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-tropical-ocean">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Доход</p>
                          <p className="text-3xl font-bold text-airbnb-rausch">187,500 ₽</p>
                        </div>
                        <TrendingUp size={32} className="text-airbnb-rausch" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Chart Mockup */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>График доходов</CardTitle>
                    <CardDescription>За последние 30 дней</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between h-48 gap-2">
                      {[65, 45, 80, 55, 90, 70, 100, 85, 75, 95, 110, 88, 92, 105].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-airbnb-rausch to-airbnb-arches rounded-t-lg relative group"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">
                            {Math.round(height * 20)}₽
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Orders List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Последние заказы</span>
                      <span className="text-sm font-normal text-green-600 flex items-center gap-1">
                        <CheckCircle size={16} />
                        Все оплачены
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { client: 'Анна К.', tour: 'Обзорная экскурсия по Пхукету', amount: '2,500₽', status: 'Оплачено' },
                        { client: 'Дмитрий М.', tour: 'Острова Пхи-Пхи', amount: '3,500₽', status: 'Оплачено' },
                        { client: 'Елена С.', tour: 'Вечерний Бангкок', amount: '3,000₽', status: 'Оплачено' },
                      ].map((order, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-tropical-ocean/10 rounded-full flex items-center justify-center">
                              <Users size={18} className="text-airbnb-rausch" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{order.client}</p>
                              <p className="text-xs text-gray-600">{order.tour}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-airbnb-rausch">{order.amount}</p>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle size={12} />
                              {order.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Card>
        </div>

        {/* QR Code Payment Feature */}
        <div className="mb-20 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Принимайте платежи через QR-коды
            </h2>
            <p className="text-lg text-gray-600">
              Генерируйте счета и QR-коды для оплаты прямо в личном кабинете
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left - Process */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-airbnb-rausch to-airbnb-arches rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Клиент бронирует экскурсию</h3>
                  <p className="text-gray-600">
                    Заявка автоматически попадает в ваш личный кабинет в раздел "Заказы"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-airbnb-rausch to-airbnb-arches rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Выставляете счет одним кликом</h3>
                  <p className="text-gray-600">
                    Нажимаете кнопку "Выставить счет" → система генерирует QR-код и платежную форму
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-airbnb-rausch to-airbnb-arches rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Клиент оплачивает</h3>
                  <p className="text-gray-600">
                    Клиент сканирует QR-код или переходит по ссылке и оплачивает картой любого банка
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Деньги на вашем балансе</h3>
                  <p className="text-gray-600">
                    Средства моментально зачисляются на ваш баланс. Выводите когда удобно!
                  </p>
                </div>
              </div>
            </div>

            {/* Right - QR Code Mockup */}
            <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-airbnb-rausch to-airbnb-arches text-white">
                <CardTitle>Счет на оплату</CardTitle>
                <CardDescription className="text-white/90">Заказ #12847 • Обзорная экскурсия</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">К оплате</p>
                  <p className="text-4xl font-bold text-airbnb-rausch mb-1">2,500 ₽</p>
                  <p className="text-xs text-gray-500">≈ 900 THB • ≈ $27</p>
                </div>

                <div className="flex justify-center mb-6">
                  <div className="w-48 h-48 bg-white border-4 border-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <QrCode size={120} className="text-gray-300" />
                    <div className="absolute inset-0 bg-gradient-to-br from-tropical-ocean/5 to-tropical-turquoise/5"></div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 mb-4">
                  Отсканируйте QR-код или нажмите кнопку ниже
                </div>

                <Button className="w-full bg-gradient-to-r from-airbnb-rausch to-airbnb-arches hover:opacity-90" size="lg">
                  <CreditCard size={18} className="mr-2" />
                  Оплатить картой
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                  <CheckCircle size={14} className="text-green-600" />
                  <span>Защищенный платеж</span>
                  <span>•</span>
                  <span>SSL шифрование</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Почему выбирают ThaiGuide Pro
            </h2>
            <p className="text-lg text-gray-600">
              Все инструменты для успешного ведения туристического бизнеса
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-t-4 border-t-airbnb-rausch hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-tropical-ocean/10 rounded-full flex items-center justify-center mb-3">
                  <DollarSign className="text-airbnb-rausch" size={24} />
                </div>
                <CardTitle>Высокий доход</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Зарабатывайте от 50,000₽ до 200,000₽ в месяц
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Комиссия всего 20%
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Еженедельные выплаты
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Бонусы за рейтинг
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Clock className="text-green-600" size={24} />
                </div>
                <CardTitle>Гибкий график</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Работайте когда удобно вам
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Выбирайте заказы сами
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Управляйте календарем
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Устанавливайте цены
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="text-blue-600" size={24} />
                </div>
                <CardTitle>Готовые клиенты</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Мы приводим клиентов к вам
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Реклама и SEO
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Соцсети и маркетинг
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Партнерские программы
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Trophy className="text-purple-600" size={24} />
                </div>
                <CardTitle>Поддержка 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Мы всегда рядом
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Техподдержка онлайн
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Обучение и тренинги
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    Страхование включено
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-20 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Как начать работать
            </h2>
            <p className="text-lg text-gray-600">
              4 простых шага до первого заказа
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-tropical-ocean/20 to-transparent rounded-bl-full"></div>
              <CardHeader>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-airbnb-rausch to-airbnb-arches rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    1
                  </div>
                  <CardTitle className="text-2xl">Регистрация</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Заполните анкету ниже или зарегистрируйтесь через личный кабинет. Укажите ваш опыт, 
                  языки и специализацию.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                  <span className="font-semibold">⏱️ Время:</span> 5-10 минут
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full"></div>
              <CardHeader>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    2
                  </div>
                  <CardTitle className="text-2xl">Создайте экскурсии</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Добавьте свои экскурсии: описание, фото, цену, маршрут. Настройте календарь доступности 
                  и начните принимать заказы.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                  <span className="font-semibold">⏱️ Время:</span> 20-30 минут
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full"></div>
              <CardHeader>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    3
                  </div>
                  <CardTitle className="text-2xl">Выставляйте счета</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  При поступлении заказа нажмите "Выставить счет" → система создаст QR-код и платежную форму. 
                  Отправьте клиенту.
                </p>
                <div className="bg-gradient-to-r from-tropical-ocean/10 to-airbnb-arches/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-airbnb-rausch font-semibold">
                    <QrCode size={20} />
                    QR-код генерируется автоматически
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full"></div>
              <CardHeader>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    4
                  </div>
                  <CardTitle className="text-2xl">Получайте выплаты</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Выводите заработанные средства на карту в любое время. Минимальная сумма вывода — 5,000₽. 
                  Выплаты в течение 24 часов.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                  <span className="font-semibold">💰 Вывод:</span> Карта, PayPal, наличные
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mb-20 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Полный функционал для гидов
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="text-airbnb-rausch mb-3" size={32} />
                <CardTitle>Календарь и расписание</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li>• Управление доступностью</li>
                  <li>• Автоматические напоминания</li>
                  <li>• Синхронизация с Google Calendar</li>
                  <li>• Блокировка дат отпуска</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="text-airbnb-rausch mb-3" size={32} />
                <CardTitle>Аналитика и статистика</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li>• График доходов по дням/месяцам</li>
                  <li>• Популярные экскурсии</li>
                  <li>• Средний чек</li>
                  <li>• Конверсия бронирований</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="text-airbnb-rausch mb-3" size={32} />
                <CardTitle>Рейтинг и отзывы</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li>• Система рейтингов</li>
                  <li>• Отзывы после экскурсий</li>
                  <li>• Бейджи "Топ гид"</li>
                  <li>• Повышение в поиске</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CreditCard className="text-airbnb-rausch mb-3" size={32} />
                <CardTitle>Приём платежей</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li>• QR-коды для оплаты</li>
                  <li>• Онлайн-платежи картой</li>
                  <li>• Мультивалютность (₽/$/ ฿)</li>
                  <li>• Автоматические чеки</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Wallet className="text-airbnb-rausch mb-3" size={32} />
                <CardTitle>Финансовый учет</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li>• История всех транзакций</li>
                  <li>• Обмен валют</li>
                  <li>• Экспорт отчетов</li>
                  <li>• Налоговые документы</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="text-airbnb-rausch mb-3" size={32} />
                <CardTitle>CRM для клиентов</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2 text-sm">
                  <li>• База постоянных клиентов</li>
                  <li>• История бронирований</li>
                  <li>• Персональные скидки</li>
                  <li>• Email и SMS рассылки</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Form */}
        {!submitted ? (
          <Card className="max-w-3xl mx-auto mb-16">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">Заявка на позицию гида</CardTitle>
              <CardDescription className="text-lg">
                Заполните форму, и мы свяжемся с вами в течение 24 часов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Полное имя *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+7 (917) 123-45-67"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ivan@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Город проживания *</Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Пхукет, Таиланд"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="experience">Опыт работы гидом (лет) *</Label>
                    <Input
                      id="experience"
                      required
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="languages">Знание языков *</Label>
                    <Input
                      id="languages"
                      required
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      placeholder="Русский, английский, тайский"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Расскажите о себе *</Label>
                  <textarea
                    id="message"
                    required
                    className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tropical-ocean"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ваш опыт, специализация, почему хотите работать с нами..."
                  />
                </div>

                <Button type="submit" variant="tropical" className="w-full text-lg py-6 gap-2">
                  <Send size={20} />
                  Отправить заявку
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <a href="/privacy" className="text-airbnb-rausch hover:underline">
                    Политикой конфиденциальности
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto mb-16 bg-gradient-to-br from-green-50 to-airbnb-arches/10 border-2 border-green-200">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Заявка отправлена!</h2>
              <p className="text-lg text-gray-700 mb-6">
                Спасибо за ваш интерес к работе гидом в ThaiGuide! Наш менеджер свяжется с вами 
                в течение 24 часов для обсуждения деталей.
              </p>
              <p className="text-gray-600">
                Следите за письмами на <strong>{formData.email}</strong>
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="mt-6"
              >
                Отправить еще одну заявку
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Testimonials */}
        <div className="mb-16 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Отзывы наших гидов
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-airbnb-rausch to-airbnb-arches rounded-full flex items-center justify-center text-white font-bold">
                    АК
                  </div>
                  <div>
                    <p className="font-bold">Анна Кузнецова</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  "Работаю с ThaiGuide уже полгода. Платформа удобная, клиенты платят вовремя, 
                  выплаты приходят быстро. Особенно нравится система QR-кодов — клиенты просто 
                  сканируют и оплачивают."
                </p>
                <p className="text-xs text-gray-500 mt-3">Гид в Пхукете • 3 года опыта</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    ДС
                  </div>
                  <div>
                    <p className="font-bold">Дмитрий Соколов</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  "До ThaiGuide тратил кучу времени на прием платежей и бухгалтерию. Теперь все 
                  автоматизировано — я только провожу экскурсии и получаю деньги. Доход вырос на 40%!"
                </p>
                <p className="text-xs text-gray-500 mt-3">Гид в Бангкоке • 5 лет опыта</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    МИ
                  </div>
                  <div>
                    <p className="font-bold">Мария Иванова</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  "Поддержка на высоте! Когда были вопросы с настройкой, мне помогли за 10 минут. 
                  Платформа интуитивная, все понятно даже без инструкций."
                </p>
                <p className="text-xs text-gray-500 mt-3">Гид в Паттайе • 2 года опыта</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ for guides */}
        <Card className="max-w-4xl mx-auto mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Часто задаваемые вопросы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-l-4 border-tropical-ocean pl-4 py-2">
              <p className="font-semibold mb-2 text-lg">Сколько я буду зарабатывать?</p>
              <p className="text-gray-600">
                Ваш доход зависит от количества экскурсий, их типа и продолжительности. В среднем наши 
                гиды зарабатывают от 50,000₽ до 200,000₽ в месяц. Топ-гиды могут зарабатывать более 300,000₽. 
                За каждую экскурсию вы получаете 80% от стоимости (20% — комиссия платформы).
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold mb-2 text-lg">Как часто нужно работать?</p>
              <p className="text-gray-600">
                График полностью гибкий. Вы сами выбираете, когда и сколько экскурсий проводить. 
                Можно работать на полную ставку (5-7 экскурсий в неделю) или совмещать с другой деятельностью 
                (1-2 экскурсии в неделю). Главное — своевременно обновлять календарь доступности.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-semibold mb-2 text-lg">Какая комиссия платформы?</p>
              <p className="text-gray-600">
                Комиссия составляет 20% от стоимости экскурсии. В неё входит: продвижение и реклама, 
                обработка платежей, техническая поддержка 24/7, страхование участников, хостинг и обслуживание 
                платформы. Никаких скрытых платежей!
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="font-semibold mb-2 text-lg">Как происходит вывод средств?</p>
              <p className="text-gray-600">
                Выводите заработанные средства на банковскую карту, PayPal или получайте наличными через 
                наших обменников. Минимальная сумма вывода — 5,000₽. Заявки на вывод обрабатываются в течение 
                24 часов в рабочие дни. Комиссия за вывод 2-3% в зависимости от способа.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-airbnb-rausch to-airbnb-arches text-white rounded-3xl p-12 max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Готовы начать зарабатывать?</h2>
          <p className="text-xl mb-8 opacity-90">
            Присоединяйтесь к 500+ гидам, которые уже работают с ThaiGuide Pro
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-airbnb-rausch hover:bg-gray-100 text-lg px-8 py-6">
              Заполнить заявку
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
              Написать в Telegram
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            Первые 50 гидов получают 0% комиссии за первый месяц работы! 🎉
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}