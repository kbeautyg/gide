import { Helmet } from 'react-helmet-async'
import { MapPin, Mail, Clock, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>Контакты Inturex — Связаться с нами | Экскурсии по Азии</title>
        <meta name="description" content="Свяжитесь с Inturex: email help@inturex.pro. Офисы в Пхукете, Бишкеке и Москве. Поддержка 24/7." />
        <meta name="keywords" content="контакты Inturex, связаться с турагентством, email туры Таиланд, экскурсии Азия" />
        <link rel="canonical" href="https://inturex.pro/contact" />
        <meta property="og:title" content="Контакты Inturex — Связаться с нами" />
        <meta property="og:description" content="Email help@inturex.pro. Офисы в Пхукете, Бишкеке и Москве. Поддержка 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://inturex.pro/og-image.jpg" />
        <meta property="og:url" content="https://inturex.pro/contact" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Контакты Inturex",
            "description": "Свяжитесь с нами для бронирования экскурсий по Азии",
            "url": "https://inturex.pro/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "Inturex",
              "url": "https://inturex.pro/",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "help@inturex.pro",
                "contactType": "customer service",
                "availableLanguage": ["Russian", "English"],
                "areaServed": ["KG", "RU", "TH"]
              },
              "email": "help@inturex.pro"
            }
          })}
        </script>
      </Helmet>

      <PublicHeader />

      {/* Hero */}
      <section className="relative text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-airbnb-rausch" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">Свяжитесь с нами</h1>
            <p className="text-lg md:text-xl text-white/90">Мы всегда готовы помочь вам спланировать идеальное путешествие</p>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Left: Contact Details */}
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold">Контактная информация</h2>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="text-airbnb-rausch" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <a href="mailto:hello@inturex.pro" className="block text-gray-600 hover:text-airbnb-rausch transition-colors text-sm">hello@inturex.pro</a>
                  <a href="mailto:help@inturex.pro" className="block text-gray-600 hover:text-airbnb-rausch transition-colors text-sm">help@inturex.pro <span className="text-gray-400">— поддержка</span></a>
                  <a href="mailto:partners@inturex.pro" className="block text-gray-600 hover:text-airbnb-rausch transition-colors text-sm">partners@inturex.pro <span className="text-gray-400">— партнёрам</span></a>
                  <a href="mailto:orders@inturex.pro" className="block text-gray-600 hover:text-airbnb-rausch transition-colors text-sm">orders@inturex.pro <span className="text-gray-400">— заказы</span></a>
                </div>
              </div>

              {/* Offices — only cities, no addresses */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Офисы</h3>
                  <p className="text-gray-600 text-sm">🇹🇭 Пхукет, Таиланд</p>
                  <p className="text-gray-600 text-sm">🇰🇬 Бишкек, Кыргызстан</p>
                  <p className="text-gray-600 text-sm">🇷🇺 Москва, Россия</p>
                </div>
              </div>

              {/* Working hours */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-blue-500" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Время работы</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">🇹🇭 Пхукет — 10:00 — 19:00 <span className="text-gray-400">(GMT+7)</span></p>
                    <p className="text-gray-600">🇰🇬 Бишкек — 9:00 — 19:00 <span className="text-gray-400">(GMT+6)</span></p>
                    <p className="text-gray-600">🇷🇺 Москва — 9:00 — 19:00 <span className="text-gray-400">(МСК)</span></p>
                  </div>
                  <p className="text-gray-800 font-medium text-sm mt-2">📧 Поддержка 24/7 — <a href="mailto:help@inturex.pro" className="text-airbnb-rausch">help@inturex.pro</a></p>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Напишите нам</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="resize-none"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch/90">
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

      {/* FAQ */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Часто задаваемые вопросы</h2>

          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Как забронировать экскурсию?</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Выберите понравившуюся экскурсию, нажмите «Забронировать», заполните форму и произведите оплату. Подтверждение придёт на вашу почту.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Какие способы оплаты вы принимаете?</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Мы принимаем карты Visa/MasterCard, СБП, а также наличные в рублях и тайских батах на месте.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Можно ли отменить бронирование?</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Да, отмена возможна за 24 часа до начала экскурсии с полным возвратом средств. При отмене менее чем за 24 часа возвращается 50%.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Предоставляете ли вы трансфер?</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Да, трансфер включён в стоимость большинства экскурсий. Мы заберём вас из отеля и привезём обратно.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
