import { Users, MapPin, Star, Award, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-tropical-turquoise to-tropical-ocean text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              О ThaiGuide Pro
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Ваш надежный проводник в мир незабываемых путешествий по Азии
            </p>
          </div>
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

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-tropical-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-tropical-turquoise" size={32} />
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

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-tropical-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-tropical-coral" size={32} />
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

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-tropical-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-tropical-gold" size={32} />
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
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-tropical-turquoise mb-2">100+</div>
              <div className="text-gray-600">Экскурсий</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-tropical-coral mb-2">5000+</div>
              <div className="text-gray-600">Довольных клиентов</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-tropical-gold mb-2">50+</div>
              <div className="text-gray-600">Профессиональных гидов</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-tropical-ocean mb-2">4.9</div>
              <div className="text-gray-600">Средний рейтинг</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Наши ценности</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-tropical-turquoise/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="text-tropical-turquoise" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Качество</h3>
                  <p className="text-gray-600">
                    Мы предоставляем только высококачественные услуги и работаем с лучшими гидами.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-tropical-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="text-tropical-coral" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Профессионализм</h3>
                  <p className="text-gray-600">
                    Наша команда состоит из опытных профессионалов, которые знают свое дело.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-tropical-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="text-tropical-gold" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ответственность</h3>
                  <p className="text-gray-600">
                    Мы несем полную ответственность за безопасность и комфорт наших клиентов.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-tropical-turquoise to-tropical-ocean text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Готовы начать путешествие?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Присоединяйтесь к тысячам довольных клиентов и откройте для себя Азию!
          </p>
          <a href="/tours" className="inline-block">
            <button className="bg-white text-tropical-ocean px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Выбрать экскурсию
            </button>
          </a>
        </div>
      </section>
    </div>
  )
}
