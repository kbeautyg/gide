import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Users, Shield, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { toursApi } from '@/lib/api'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { SearchBar } from '@/components/SearchBar'
import { TourCard } from '@/components/TourCard'

// Анимационные варианты
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function HomePage() {
  const [seasonalIndex, setSeasonalIndex] = useState(0)
  const [reviewIndex, setReviewIndex] = useState(0)
  
  // Загрузка популярных экскурсий
  const { data: toursData } = useQuery({
    queryKey: ['tours', 'popular'],
    queryFn: () => toursApi.getList({ page: 1, page_size: 6 }),
  })

  const popularTours = toursData?.data?.tours || []

  // Mock данные для сезонных идей
  const seasonalIdeas = [
    {
      title: 'Оценить стрит-фуд Стамбула',
      image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=600&h=400&fit=crop',
      link: '/tours?category=food&location=Стамбул'
    },
    {
      title: 'Изучить древние храмы Тбилиси',
      image: 'https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=600&h=400&fit=crop',
      link: '/tours?category=culture&location=Тбилиси'
    },
    {
      title: 'Покататься на слонах в Чианг Мае',
      image: 'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=600&h=400&fit=crop',
      link: '/tours?category=nature&location=Чианг%20Май'
    },
    {
      title: 'Продлить лето в Дубае',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop',
      link: '/tours?location=Дубай'
    },
  ]

  // Mock данные для направлений
  const destinations = [
    { name: 'Тбилиси', count: 480, image: 'https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=500&h=500&fit=crop', country: 'Грузия' },
    { name: 'Стамбул', count: 1240, image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=500&h=500&fit=crop', country: 'Турция' },
    { name: 'Бангкок', count: 890, image: 'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=500&h=500&fit=crop', country: 'Таиланд' },
    { name: 'Дубай', count: 650, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&h=500&fit=crop', country: 'ОАЭ' },
    { name: 'Париж', count: 1150, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=500&fit=crop', country: 'Франция' },
    { name: 'Рим', count: 920, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&h=500&fit=crop', country: 'Италия' },
  ]

  // Mock данные для отзывов
  const reviews = [
    {
      name: 'Мария',
      photo: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      text: 'Это была моя самая лучшая экскурсия в жизни! Михаил — самый чудесный экскурсовод; накормит, напоит и сфотографирует! Было очень интересно слушать информацию...',
      tour: 'Золотое кольцо Кахетии',
      experience: 14
    },
    {
      name: 'Андрей',
      photo: 'https://i.pravatar.cc/150?img=33',
      rating: 5,
      text: 'Приятная экскурсия, приятный очаровательный экскурсовод Тамара, хороший водитель, долгий путь. Рекомендую всем!',
      tour: 'Из Тбилиси — к селу Кanoби',
      experience: 1
    },
    {
      name: 'Дарья',
      photo: 'https://i.pravatar.cc/150?img=5',
      rating: 5,
      text: 'Замечательный экскурсовод Арчи, очень интересно, подробно рассказывал о всех достопримечательностях. Спасибо!',
      tour: 'Древняя Мцхета',
      experience: 9
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative hero-gradient text-white py-24 md:py-32 overflow-hidden">
        {/* Parallax фон */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Откройте незабываемые экскурсии
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto">
              Более 500 уникальных экскурсий с местными гидами по всему миру
            </p>
            
            {/* SearchBar */}
            <div className="mb-8">
              <SearchBar variant="hero" />
            </div>
            
            {/* CTA */}
            <Link to="/request">
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-white text-airbnb-rausch hover:bg-gray-50 font-semibold text-lg px-8 shadow-lg"
              >
                ✨ Заказать индивидуальную экскурсию
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Блок "Планы на сезон" */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Планы на яркую осень 🍁</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSeasonalIndex(Math.max(0, seasonalIndex - 1))}
                disabled={seasonalIndex === 0}
                className="p-2 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setSeasonalIndex(Math.min(seasonalIdeas.length - 3, seasonalIndex + 1))}
                disabled={seasonalIndex >= seasonalIdeas.length - 3}
                className="p-2 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 overflow-hidden">
            {seasonalIdeas.slice(seasonalIndex, seasonalIndex + 3).map((idea, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={idea.link}>
                  <div className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer">
                    <img
                      src={idea.image}
                      alt={idea.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-white">{idea.title}</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Популярные направления */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Популярные направления</h2>
          
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {destinations.map((dest, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Link to={`/destinations/${dest.name.toLowerCase()}`}>
                  <div className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="font-bold text-lg">{dest.name}</div>
                      <div className="text-sm text-white/90">{dest.count} экскурсий</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Популярные экскурсии */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Популярные экскурсии</h2>
            <Link to="/tours">
              <Button variant="outline" className="rounded-full">
                Все экскурсии <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {popularTours.length > 0 ? (
              popularTours.map((tour) => (
                <motion.div key={tour.id} variants={itemVariants}>
                  <TourCard tour={tour} />
                </motion.div>
              ))
            ) : (
              // Skeleton loaders
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="skeleton rounded-xl h-[380px]" />
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Как мы делаем экскурсии */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Как мы делаем экскурсии</h2>
            <p className="text-lg text-gray-600">
              Мы — тысячи увлечённых гидов с необычным опытом и глубокими знаниями. 
              Это журналисты, историки, архитекторы и другие интересные люди, 
              которые умеют увлечь историями о своих городах и странах.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 bg-airbnb-babu/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-airbnb-babu" size={36} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Проверенные гиды</h3>
              <p className="text-gray-600">
                Все гиды прошли тщательный отбор и имеют высокие рейтинги
              </p>
            </motion.div>
            
            <motion.div
              className="text-center"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-20 h-20 bg-airbnb-rausch/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-airbnb-rausch" size={36} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Моментальное бронирование</h3>
              <p className="text-gray-600">
                Платите сразу онлайн, без ожидания подтверждения
              </p>
            </motion.div>
            
            <motion.div
              className="text-center"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={36} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Гарантия возврата</h3>
              <p className="text-gray-600">
                Вернём деньги при отмене за 48 часов до начала
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Свежие отзывы */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Свежие отзывы</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                disabled={reviewIndex === 0}
                className="p-2 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setReviewIndex(Math.min(reviews.length - 1, reviewIndex + 1))}
                disabled={reviewIndex >= reviews.length - 1}
                className="p-2 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <motion.div
                key={review.name}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={review.photo}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          size={14}
                          className="fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3 line-clamp-4">{review.text}</p>
                
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{review.tour}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Опыт: {review.experience} экскурси{review.experience === 1 ? 'я' : 'й'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Email подписка */}
      <section className="py-16 bg-gradient-to-r from-airbnb-rausch to-airbnb-arches text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3">
              Экскурсии и туры от экспертов
            </h3>
            <p className="mb-6 text-white/90">
              Классные места, скидки и интересные события у вас в почте · 
              <a href="#" className="underline ml-1">Пример письма</a>
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Эл. почта"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900"
              />
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6">
                Подписаться
              </Button>
            </div>
            <p className="text-xs text-white/70 mt-3">
              Нажимая «Подписаться», вы даёте согласие на получение рекламных сообщений
            </p>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-airbnb-rausch mb-2">500+</div>
              <div className="text-gray-600">Увлечённых гидов</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-airbnb-babu mb-2">10,000+</div>
              <div className="text-gray-600">Довольных путешественников</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-airbnb-arches mb-2">4.9</div>
              <div className="text-gray-600">Средний рейтинг</div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
