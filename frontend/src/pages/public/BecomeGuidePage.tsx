import { useState } from 'react'
import { UserPlus, MapPin, DollarSign, Users, Trophy, CheckCircle, Send } from 'lucide-react'
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
    // Здесь можно добавить отправку на backend
    console.log('Guide application:', formData)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-tropical-turquoise/20">
      <PublicHeader />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-tropical-ocean/10 rounded-full mb-4">
            <UserPlus size={48} className="text-tropical-ocean" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Станьте гидом в нашей команде!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Поделитесь своими знаниями и любовью к путешествиям с туристами со всего мира. 
            Присоединяйтесь к профессиональному сообществу гидов ThaiGuide!
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-t-4 border-t-tropical-ocean hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-tropical-ocean/10 rounded-full flex items-center justify-center mb-3">
                <DollarSign className="text-tropical-ocean" size={24} />
              </div>
              <CardTitle>Высокий доход</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Зарабатывайте от 50,000₽ до 200,000₽ в месяц в зависимости от количества и типа экскурсий
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <MapPin className="text-green-600" size={24} />
              </div>
              <CardTitle>Гибкий график</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Работайте когда удобно вам. Выбирайте экскурсии и клиентов самостоятельно
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Users className="text-blue-600" size={24} />
              </div>
              <CardTitle>Поддержка команды</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                24/7 поддержка, обучение, маркетинг, страховка и все необходимое для работы
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Trophy className="text-purple-600" size={24} />
              </div>
              <CardTitle>Профессиональный рост</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Повышайте квалификацию, получайте сертификаты, становитесь лучшими
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Requirements Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-2">Требования к кандидатам</CardTitle>
            <CardDescription className="text-center text-lg">
              Мы ищем профессионалов, увлеченных своим делом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-tropical-ocean mb-3">Обязательные требования:</h3>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Опыт работы гидом</p>
                    <p className="text-sm text-gray-600">Минимум 1 год опыта проведения экскурсий</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Свободный русский язык</p>
                    <p className="text-sm text-gray-600">Грамотная речь, умение четко и интересно излагать информацию</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Глубокие знания региона</p>
                    <p className="text-sm text-gray-600">История, культура, традиции, современная жизнь</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Коммуникабельность</p>
                    <p className="text-sm text-gray-600">Умение находить подход к разным людям и группам</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg text-blue-600 mb-3">Будет плюсом:</h3>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Дополнительные языки</p>
                    <p className="text-sm text-gray-600">Английский, немецкий, французский, тайский</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Лицензия гида</p>
                    <p className="text-sm text-gray-600">Официальная лицензия на проведение экскурсий</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Водительские права</p>
                    <p className="text-sm text-gray-600">Категория B, опыт вождения в Таиланде</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Специализация</p>
                    <p className="text-sm text-gray-600">Дайвинг, треккинг, фотография, кулинария и т.д.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-2">Как стать нашим гидом</CardTitle>
            <CardDescription className="text-center text-lg">
              Простой процесс из 4 шагов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-tropical-ocean to-tropical-turquoise rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  1
                </div>
                <h4 className="font-bold mb-2">Заполните анкету</h4>
                <p className="text-sm text-gray-600">
                  Расскажите о себе, своем опыте и мотивации
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-tropical-ocean to-tropical-turquoise rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  2
                </div>
                <h4 className="font-bold mb-2">Собеседование</h4>
                <p className="text-sm text-gray-600">
                  Онлайн-интервью с нашим HR-менеджером
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-tropical-ocean to-tropical-turquoise rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  3
                </div>
                <h4 className="font-bold mb-2">Обучение</h4>
                <p className="text-sm text-gray-600">
                  Пройдите наш вводный тренинг (2-3 дня)
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-tropical-ocean to-tropical-turquoise rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  4
                </div>
                <h4 className="font-bold mb-2">Начните работать</h4>
                <p className="text-sm text-gray-600">
                  Получайте заявки и проводите экскурсии
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        {!submitted ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Заявка на позицию гида</CardTitle>
              <CardDescription className="text-center text-lg">
                Заполните форму, и мы свяжемся с вами в течение 3-5 рабочих дней
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
                  <a href="/privacy" className="text-tropical-ocean hover:underline">
                    Политикой конфиденциальности
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-tropical-turquoise/10 border-2 border-green-200">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Заявка отправлена!</h2>
              <p className="text-lg text-gray-700 mb-6">
                Спасибо за ваш интерес к работе гидом в ThaiGuide! Мы рассмотрим вашу анкету и 
                свяжемся с вами в течение 3-5 рабочих дней.
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

        {/* FAQ for guides */}
        <Card className="mt-16 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Часто задаваемые вопросы от гидов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div className="border-l-4 border-tropical-ocean pl-4">
              <p className="font-semibold mb-1">Сколько я буду зарабатывать?</p>
              <p className="text-sm">
                Ваш доход зависит от количества экскурсий, их типа и продолжительности. В среднем наши 
                гиды зарабатывают от 50,000₽ до 200,000₽ в месяц. Топ-гиды могут зарабатывать более 300,000₽.
              </p>
            </div>

            <div className="border-l-4 border-tropical-ocean pl-4">
              <p className="font-semibold mb-1">Как часто нужно работать?</p>
              <p className="text-sm">
                График полностью гибкий. Вы сами выбираете, когда и сколько экскурсий проводить. 
                Можно работать на полную ставку или совмещать с другой деятельностью.
              </p>
            </div>

            <div className="border-l-4 border-tropical-ocean pl-4">
              <p className="font-semibold mb-1">Нужно ли мне оплачивать маркетинг?</p>
              <p className="text-sm">
                Нет, мы берем на себя все расходы на маркетинг, продвижение, рекламу и привлечение клиентов. 
                Комиссия платформы уже включает эти услуги.
              </p>
            </div>

            <div className="border-l-4 border-tropical-ocean pl-4">
              <p className="font-semibold mb-1">Какая комиссия платформы?</p>
              <p className="text-sm">
                Комиссия составляет 20% от стоимости экскурсии. В комиссию входит: маркетинг, поддержка, 
                страховка, обработка платежей, техническая поддержка платформы.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <PublicFooter />
    </div>
  )
}
