import { Helmet } from 'react-helmet-async'
import { MapPin, Phone, Mail, Clock, MessageCircle, Instagram, Youtube, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { motion } from 'framer-motion'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>Контакты Inturex — Связаться с нами | Экскурсии по Азии</title>
        <meta name="description" content="Свяжитесь с Inturex: телефон +7 (917) 744-51-82, email info@inturex.pro. Офис в Пхукете, Таиланд. Поддержка 24/7. Поможем спланировать идеальное путешествие!" />
        <meta name="keywords" content="контакты Inturex, связаться с турагентством, телефон экскурсии Азия, email туры Таиланд" />
        <link rel="canonical" href="https://thaiguide-frontend-production.up.railway.app/contact" />
        <meta property="og:title" content="Контакты Inturex — Связаться с нами" />
        <meta property="og:description" content="Телефон +7 (917) 744-51-82, email info@inturex.pro. Поддержка 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://thaiguide-frontend-production.up.railway.app/og-image.jpg" />
        <meta property="og:url" content="https://thaiguide-frontend-production.up.railway.app/contact" />
        
        {/* JSON-LD ContactPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Контакты Inturex",
            "description": "Свяжитесь с нами для бронирования экскурсий по Азии",
            "url": "https://thaiguide-frontend-production.up.railway.app/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "Inturex",
              "url": "https://thaiguide-frontend-production.up.railway.app/",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+7-999-123-45-67",
                  "contactType": "customer service",
                  "availableLanguage": ["Russian", "English"],
                  "areaServed": "RU"
                },
                {
                  "@type": "ContactPoint",
                  "telephone": "+66-81-234-5678",
                  "contactType": "customer service",
                  "availableLanguage": ["Russian", "English", "Thai"],
                  "areaServed": "TH"
                }
              ],
              "email": "info@thaiguide.pro",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Patong Beach Road",
                "addressLocality": "Phuket",
                "addressCountry": "TH"
              }
            }
          })}
        </script>
      </Helmet>
      
      <PublicHeader />
      {/* Hero Section */}
      <section className="relative text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-airbnb-rausch" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Свяжитесь с нами
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/95">
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
                    <Phone className="text-airbnb-babu" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Телефон</h3>
                    <p className="text-gray-600">+7 (999) 123-45-67</p>
                    <p className="text-gray-600">+66 (0) 81-234-5678</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-tropical-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-airbnb-rausch" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Email</h3>
                    <p className="text-gray-600">info@thaiguide.pro</p>
                    <p className="text-gray-600">support@thaiguide.pro</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-tropical-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-airbnb-arches" size={24} />
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
                    <Clock className="text-airbnb-rausch" size={24} />
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

      {/* FAQ Section */}
      <section className="py-16 bg-gray-100">
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
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Мы в социальных сетях</h2>
            <p className="text-lg text-gray-600">
              Следите за нашими новостями и делитесь впечатлениями
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="block"
            >
              <Card className="bg-white hover:shadow-xl transition-all cursor-pointer border-2 hover:border-pink-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Instagram className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Instagram</h3>
                      <p className="text-base text-gray-600">Фото и истории путешествий</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.a>

            <motion.a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="block"
            >
              <Card className="bg-white hover:shadow-xl transition-all cursor-pointer border-2 hover:border-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Youtube className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">YouTube</h3>
                      <p className="text-base text-gray-600">Видео-обзоры экскурсий</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.a>

            <motion.a
              href="https://t.me/thaiguide"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="block"
            >
              <Card className="bg-white hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Send className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Telegram</h3>
                      <p className="text-base text-gray-600">Быстрая связь и поддержка</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.a>

            <motion.a
              href="https://wa.me/79991234567"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="block"
            >
              <Card className="bg-white hover:shadow-xl transition-all cursor-pointer border-2 hover:border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">WhatsApp</h3>
                      <p className="text-base text-gray-600">Онлайн-консультации</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.a>
          </div>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  )
}
