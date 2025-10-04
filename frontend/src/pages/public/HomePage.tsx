import { Link } from 'react-router-dom'
import { Search, MapPin, Star, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRUB } from '@/lib/utils'

export default function HomePage() {
  // Популярные экскурсии (временные данные)
  const popularTours = [
    {
      id: '1',
      title: 'Обзорная экскурсия по Пхукету',
      location: 'Пхукет',
      price: 2500,
      duration: 6,
      rating: 4.8,
      reviews: 127,
      image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop',
    },
    {
      id: '2',
      title: 'Острова Пхи-Пхи на скоростной лодке',
      location: 'Пхукет',
      price: 3200,
      duration: 8,
      rating: 4.9,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
    },
    {
      id: '3',
      title: 'Джунгли и водопады Краби',
      location: 'Краби',
      price: 2800,
      duration: 7,
      rating: 4.7,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gradient">
            ThaiGuide Pro
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/tours" className="hover:text-tropical-ocean transition-colors">
              Экскурсии
            </Link>
            <Link to="/about" className="hover:text-tropical-ocean transition-colors">
              О нас
            </Link>
            <Link to="/contacts" className="hover:text-tropical-ocean transition-colors">
              Контакты
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link to="/register">
              <Button variant="tropical">Регистрация</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Откройте для себя настоящий Таиланд!
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Более 100 уникальных экскурсий с русскоязычными гидами. 
              Оплата российскими картами и СБП.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-2 px-4">
                <MapPin className="text-gray-400" size={20} />
                <Input 
                  type="text" 
                  placeholder="Куда хотите поехать?" 
                  className="border-none shadow-none focus-visible:ring-0"
                />
              </div>
              <Button variant="tropical" size="lg" className="md:w-auto">
                <Search className="mr-2" size={20} />
                Найти экскурсию
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-tropical-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-tropical-turquoise" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Опытные гиды</h3>
              <p className="text-gray-600">
                Русскоязычные гиды с многолетним опытом работы в Таиланде
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-tropical-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-tropical-coral" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Лучшие маршруты</h3>
              <p className="text-gray-600">
                Тщательно проверенные экскурсии с высокими рейтингами
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-tropical-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-tropical-gold" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Удобная оплата</h3>
              <p className="text-gray-600">
                Оплата российскими картами, СБП и через QR-коды
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tours */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Популярные экскурсии</h2>
            <Link to="/tours">
              <Button variant="outline">Все экскурсии</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTours.map((tour) => (
              <Link to={`/tours/${tour.id}`} key={tour.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="relative">
                    <img 
                      src={tour.image} 
                      alt={tour.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                      {formatRUB(tour.price)}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin size={16} />
                      <span>{tour.location}</span>
                      <span className="ml-auto">{tour.duration} часов</span>
                    </div>
                    <CardTitle className="text-xl">{tour.title}</CardTitle>
                  </CardHeader>
                  
                  <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="fill-yellow-400 text-yellow-400" size={16} />
                      <span className="font-semibold">{tour.rating}</span>
                      <span className="text-gray-600 text-sm">({tour.reviews})</span>
                    </div>
                    <Button variant="tropical" size="sm">Забронировать</Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Как это работает?</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Выберите экскурсию', desc: 'Изучите каталог и найдите идеальный тур' },
              { step: '2', title: 'Забронируйте дату', desc: 'Выберите удобную дату в календаре' },
              { step: '3', title: 'Оплатите онлайн', desc: 'Безопасная оплата картой РФ или СБП' },
              { step: '4', title: 'Наслаждайтесь!', desc: 'Встречайтесь с гидом и отправляйтесь в путешествие' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-tropical-ocean text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-tropical-turquoise to-tropical-ocean text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Готовы к приключениям?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Начните планировать свой незабываемый отдых в Таиланде прямо сейчас!
          </p>
          <Link to="/tours">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Посмотреть все экскурсии
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ThaiGuide Pro</h3>
              <p className="text-gray-400">
                Лучшие экскурсии по Таиланду с русскоязычными гидами
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Экскурсии</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/tours?location=phuket" className="hover:text-white transition-colors">Пхукет</Link></li>
                <li><Link to="/tours?location=pattaya" className="hover:text-white transition-colors">Паттайя</Link></li>
                <li><Link to="/tours?location=bangkok" className="hover:text-white transition-colors">Бангкок</Link></li>
                <li><Link to="/tours?location=krabi" className="hover:text-white transition-colors">Краби</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">О нас</Link></li>
                <li><Link to="/contacts" className="hover:text-white transition-colors">Контакты</Link></li>
                <li><Link to="/guides" className="hover:text-white transition-colors">Стать гидом</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Условия использования</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 ThaiGuide Pro. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
