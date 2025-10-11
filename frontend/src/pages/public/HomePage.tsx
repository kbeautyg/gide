import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Star, Users, Shield, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { toursApi, api } from '@/lib/api'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { TourCard } from '@/components/TourCard'
import { TourCardSkeleton } from '@/components/TourCardSkeleton'
import { LiveStats } from '@/components/LiveStats'
import { WorldMap } from '@/components/WorldMap'
import { AnimatedFeatures } from '@/components/AnimatedFeatures'
import { TypewriterHero } from '@/components/TypewriterHero'
import { SearchBar } from '@/components/SearchBar'

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
  const [showStickySearch, setShowStickySearch] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight
      setShowStickySearch(window.scrollY > heroHeight * 0.8)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Загрузка популярных экскурсий
  const { data: toursData } = useQuery({
    queryKey: ['tours', 'popular'],
    queryFn: async () => {
      const response = await toursApi.getList({ page: 1, page_size: 6 })
      console.log('Popular tours API response:', response.data)
      return response.data
    },
  })

  const popularTours = toursData?.tours || []
  console.log('Popular tours array:', popularTours, 'Length:', popularTours.length)

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

  // Загружаем направления с реальным подсчетом туров из API
  const { data: destinationsData } = useQuery({
    queryKey: ['destinations-with-counts'],
    queryFn: () => api.get('/destinations/with-counts').then(res => res.data),
  })

  // Маппинг городов на изображения
  const cityImages: Record<string, string> = {
    'Бангкок': 'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=500&h=500&fit=crop',
    'Пхукет': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=500&h=500&fit=crop',
    'Токио': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=500&fit=crop',
    'Дубай': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&h=500&fit=crop',
    'Киото': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&h=500&fit=crop',
    'Сеул': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=500&h=500&fit=crop',
    'Убуд': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=500&fit=crop',
    'Ханой': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&h=500&fit=crop',
    'Сингапур': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&h=500&fit=crop',
  }

  // Формируем массив направлений из API с изображениями
  const destinations = (destinationsData?.destinations || [])
    .slice(0, 6)  // Берём топ-6 по количеству туров
    .map((dest: any) => ({
      name: dest.city,
      count: dest.tours_count,
      image: cityImages[dest.city] || 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=500&h=500&fit=crop',
      country: dest.country
    }))

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

      {/* Hero Section - 3D объекты фон */}
      <section className="relative text-white overflow-hidden h-[85vh] flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Анимированные blob градиенты */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              borderRadius: ['30%', '50%', '30%']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-airbnb-rausch/30 to-purple-500/30 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              borderRadius: ['50%', '30%', '50%']
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 100, 0],
              y: [0, -100, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-orange-500/20 blur-3xl"
          />
        </div>

        {/* 3D объекты разбросаны по экрану */}
        <div className="absolute inset-0 hidden lg:block pointer-events-none">
          {[
            { emoji: '🗿', x: '5%', y: '15%' },
            { emoji: '🍜', x: '15%', y: '70%' },
            { emoji: '🗺️', x: '85%', y: '20%' },
            { emoji: '🏯', x: '90%', y: '65%' },
            { emoji: '🎭', x: '10%', y: '45%' },
            { emoji: '🏔️', x: '80%', y: '85%' },
          ].map((obj, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 0.7, 
                scale: 1, 
                y: [0, -30, 0],
              }}
              transition={{ 
                opacity: { duration: 1, delay: i * 0.15 },
                scale: { duration: 1, delay: i * 0.15 },
                y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }
              }}
              whileHover={{
                scale: 1.5,
                rotate: 25,
                opacity: 1,
                transition: { duration: 0.3 }
              }}
              className="absolute text-7xl md:text-9xl cursor-pointer pointer-events-auto"
              style={{
                left: obj.x,
                top: obj.y,
                filter: 'drop-shadow(0 10px 40px rgba(0,0,0,0.6))'
              }}
            >
              {obj.emoji}
            </motion.div>
          ))}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* TypewriterHero - анимированный текст */}
            <TypewriterHero />
            
            {/* SearchBar с простым sticky БЕЗ анимации */}
            <div className={cn(
              "mb-8 mt-10",
              showStickySearch && "fixed top-16 left-0 right-0 z-50 bg-white shadow-md border-b"
            )}>
              <div className={cn(
                showStickySearch && "container mx-auto px-4 py-3"
              )}>
                <SearchBar variant={showStickySearch ? "sticky" : "hero"} />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 2 },
            y: { duration: 1.5, repeat: Infinity }
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-sm flex flex-col items-center gap-2"
        >
          <div>Прокрутите вниз</div>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-white/60 rounded-full mx-auto"
            />
          </div>
        </motion.div>
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
                    <div className="absolute inset-0 bg-black/40" />
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
            {destinations.map((dest: any, i: number) => (
              <motion.div key={i} variants={itemVariants}>
                <Link to={`/destinations/${dest.name.toLowerCase()}`}>
                  <div className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-all" />
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
                <TourCardSkeleton key={idx} />
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* LiveStats - Живая статистика */}
      <LiveStats />

      {/* WorldMap - Карта городов Азии */}
      <WorldMap />

      {/* AnimatedFeatures - Преимущества */}
      <AnimatedFeatures />

      {/* CTA блок: Индивидуальные туры */}
      <section className="py-20 bg-airbnb-rausch">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Не нашли подходящую экскурсию?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Опишите что хотите увидеть, и мы создадим индивидуальный тур специально для вас
            </p>
              <Link to="/request">
                <Button 
                  size="lg" 
                className="bg-white text-airbnb-rausch hover:bg-gray-50 font-semibold text-lg px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                Оставить заявку на индивидуальный тур
                </Button>
              </Link>
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
      <section className="py-16 bg-airbnb-rausch text-white">
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
