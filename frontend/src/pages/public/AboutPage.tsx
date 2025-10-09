import { motion } from 'framer-motion'
import { Users, MapPin, Star, Award, Heart, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      {/* Hero Section - минималистичный */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              О Turex Pro
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600">
              Ваш надежный проводник в мир незабываемых путешествий по Азии
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Наша миссия</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Мы создаем уникальные экскурсии и путешествия, которые помогают людям 
              открыть для себя красоту и культуру Азии. Наша цель — сделать каждое 
              путешествие незабываемым и безопасным.
            </p>
          </div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Card className="text-center shadow-airbnb-sm hover:shadow-airbnb transition-shadow h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-airbnb-babu/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-airbnb-babu" size={32} />
                  </div>
                  <CardTitle>Опытные гиды</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Наши гиды — это местные жители с многолетним опытом, которые знают 
                    все секретные места и готовы поделиться ими с вами.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Card className="text-center shadow-airbnb-sm hover:shadow-airbnb transition-shadow h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-airbnb-rausch/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-airbnb-rausch" size={32} />
                  </div>
                  <CardTitle>Уникальные маршруты</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Мы разрабатываем экскурсии, которые вы не найдете в обычных турагентствах. 
                    Каждый маршрут тщательно продуман и протестирован.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Card className="text-center shadow-airbnb-sm hover:shadow-airbnb transition-shadow h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-green-600" size={32} />
                  </div>
                  <CardTitle>С заботой о клиентах</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Мы заботимся о каждом клиенте и стремимся превзойти ваши ожидания. 
                    Ваше удовлетворение — наш главный приоритет.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid md:grid-cols-4 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <div className="text-5xl font-bold text-airbnb-rausch mb-2">500+</div>
              <div className="text-gray-600 font-medium">Экскурсий</div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <div className="text-5xl font-bold text-airbnb-babu mb-2">10,000+</div>
              <div className="text-gray-600 font-medium">Довольных клиентов</div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <div className="text-5xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Профессиональных гидов</div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <div className="text-5xl font-bold text-gray-900 mb-2">4.9</div>
              <div className="text-gray-600 font-medium">Средний рейтинг</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Наши ценности</h2>
            
            <div className="space-y-8">
              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-airbnb-babu/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="text-airbnb-babu" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Качество</h3>
                  <p className="text-gray-600">
                    Мы предоставляем только высококачественные услуги и работаем с лучшими гидами.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-12 h-12 bg-airbnb-rausch/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="text-airbnb-rausch" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Профессионализм</h3>
                  <p className="text-gray-600">
                    Наша команда состоит из опытных профессионалов, которые знают свое дело.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Ответственность</h3>
                  <p className="text-gray-600">
                    Мы несем полную ответственность за безопасность и комфорт наших клиентов.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-airbnb-rausch" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Готовы начать путешествие?
            </h2>
            <p className="text-xl mb-8 text-white/95 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам довольных клиентов и откройте для себя Азию!
            </p>
            <a href="/tours" className="inline-block">
              <button className="bg-white text-airbnb-rausch px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-105">
                Выбрать экскурсию
              </button>
            </a>
          </motion.div>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  )
}
