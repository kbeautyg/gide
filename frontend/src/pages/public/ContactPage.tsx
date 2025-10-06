import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-tropical-turquoise to-tropical-ocean text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Свяжитесь с нами
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Мы всегда готовы помочь вам спланировать идеальное путешествие
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Контактная информация</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-tropical-turquoise/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="text-tropical-turquoise" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Телефон</h3>
                    <p className="text-gray-600">+7 (999) 123-45-67</p>
                    <p className="text-gray-600">+66 (0) 81-234-5678</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-tropical-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-tropical-coral" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Email</h3>
                    <p className="text-gray-600">info@thaiguide.pro</p>
                    <p className="text-gray-600">support@thaiguide.pro</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-tropical-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-tropical-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Офисы</h3>
                    <p className="text-gray-600 mb-1">Москва, ул. Тверская, 15</p>
                    <p className="text-gray-600 mb-1">Пхукет, район Ката, пляж Ката</p>
                    <p className="text-gray-600">Паттайя, район Джомтьен</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-tropical-ocean/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-tropical-ocean" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Время работы</h3>
                    <p className="text-gray-600">Пн-Пт: 9:00 - 21:00 (МСК)</p>
                    <p className="text-gray-600">Сб-Вс: 10:00 - 20:00 (МСК)</p>
                    <p className="text-gray-600">24/7 поддержка в Таиланде</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Напишите нам</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Имя *</Label>
                        <Input id="name" placeholder="Ваше имя" required />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="your@email.com" required />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input id="phone" placeholder="+7 (999) 123-45-67" />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Тема *</Label>
                      <Input id="subject" placeholder="Тема сообщения" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Сообщение *</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Расскажите нам, чем можем помочь..." 
                        rows={5}
                        required 
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-tropical-turquoise hover:bg-tropical-turquoise/90">
                      <MessageCircle className="mr-2" size={18} />
                      Отправить сообщение
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Часто задаваемые вопросы</h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Как забронировать экскурсию?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Выберите понравившуюся экскурсию, нажмите "Забронировать", заполните форму 
                  и произведите оплату. Подтверждение придет на вашу почту.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Какие способы оплаты вы принимаете?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Мы принимаем российские карты Visa/MasterCard, СБП, а также наличные 
                  в рублях и тайских батах на месте.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Можно ли отменить бронирование?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Да, отмена возможна за 24 часа до начала экскурсии с полным возвратом средств. 
                  При отмене менее чем за 24 часа возвращается 50% от стоимости.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Предоставляете ли вы трансфер?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Да, трансфер включен в стоимость большинства экскурсий. Мы заберем вас 
                  из отеля и привезем обратно.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Мы в социальных сетях</h2>
          <p className="text-lg text-gray-600 mb-8">
            Следите за нашими новостями и делитесь впечатлениями
          </p>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg" className="gap-2">
              <span>📘</span>
              Facebook
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <span>📷</span>
              Instagram
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <span>📺</span>
              YouTube
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <span>💬</span>
              Telegram
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
