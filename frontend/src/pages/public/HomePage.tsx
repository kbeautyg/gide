import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Users, Shield, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { LiveStats } from '@/components/LiveStats'
import { AnimatedFeatures } from '@/components/AnimatedFeatures'
import { DynamicNavigation } from '@/components/DynamicNavigation'
import { SmartRecommendations } from '@/components/SmartRecommendations'

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

  // Сезонные идеи для осени (ТОЛЬКО АЗИЯ!)
  const seasonalIdeas = [
    {
      title: 'Уличная еда Бангкока: 12+ блюд',
      image: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600&h=400&fit=crop',
      link: '/tours?category=Гастрономия&location=Бангкок'
    },
    {
      title: 'Храмы Киото: золотой павильон',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop',
      link: '/tours?category=Культура&location=Киото'
    },
    {
      title: 'Острова Пхи-Пхи на закате',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop',
      link: '/tours?category=Природа&location=Пхукет'
    },
    {
      title: 'Сафари в пустыне Дубая',
      image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600&h=400&fit=crop',
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

  // Отзывы с азиатских туров
  const reviews = [
    {
      name: 'Мария',
      photo: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      text: 'Невероятная экскурсия по храмам Бангкока! Гид показал секретные места, рассказал историю каждого храма. Особенно впечатлил лежащий Будда!',
      tour: 'Три главных храма Бангкока',
      experience: 7
    },
    {
      name: 'Андрей',
      photo: 'https://i.pravatar.cc/150?img=33',
      rating: 5,
      text: 'Лучшая экскурсия! Увидели бухту Майя Бэй, поплавали с рыбками, романтический ужин на закате. Потрясающе!',
      tour: 'Острова Пхи-Пхи — к селу Кanobi',
      experience: 1
    },
    {
      name: 'Дарья',
      photo: 'https://i.pravatar.cc/150?img=5',
      rating: 5,
      text: 'Замечательный экскурсовод Арчи, очень интересно, подробно рассказывал о всех достопримечательностях. Спасибо!',
      tour: 'teamLab Borderless Токио',
      experience: 8
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <PublicHeader />

      {/* HERO SECTION - FLOATING OVERLAY DESIGN */}
      <section className="relative min-h-[85vh] md:h-screen overflow-hidden pt-16 md:pt-24">
        {/* Фоновое видео/изображение с параллакс эффектом */}
        <motion.div 
          className="absolute inset-0 top-0 left-0 right-0 bottom-0 w-full h-full"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Фоновое изображение */}
          <div 
            className="absolute inset-0 top-0 left-0 right-0 bottom-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920&h=1080&fit=crop')`
            }}
          />
          
          {/* Градиентные оверлеи для читаемости */}
          <div className="absolute inset-0 top-0 left-0 right-0 bottom-0 w-full h-full bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
          <div className="absolute inset-0 top-0 left-0 right-0 bottom-0 w-full h-full bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        </motion.div>

        {/* Центрированный контент */}
        <div className="relative h-full flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-5xl mx-auto"
            >
              {/* Бейдж */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white text-sm sm:text-base font-medium mb-8 shadow-lg"
              >
                <span className="w-2 h-2 bg-airbnb-rausch rounded-full animate-pulse" />
                Путешествия по Азии
              </motion.div>

              {/* Заголовок */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-none"
                style={{
                  textShadow: '0 10px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                Экскурсии<br />
                <span className="bg-gradient-to-r from-airbnb-rausch via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  мечты
                </span>
              </motion.h1>

              {/* Описание */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-12 font-light max-w-3xl mx-auto leading-relaxed"
                style={{
                  textShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}
              >
                Откройте для себя уникальные места Азии<br className="hidden sm:block" />
                с местными гидами
              </motion.p>

              {/* Кнопка */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <Link to="/tours">
                  <Button 
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-white/90 font-bold text-lg sm:text-xl px-12 py-7 sm:px-16 sm:py-8 rounded-full shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
                  >
                    Начать путешествие
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
              </motion.div>

              {/* Статистика */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="mt-20 flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16"
              >
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    500+
                  </div>
                  <div className="text-white/80 text-sm sm:text-base font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    Экскурсий
                  </div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    10K+
                  </div>
                  <div className="text-white/80 text-sm sm:text-base font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    Путешественников
                  </div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 flex items-center justify-center gap-2" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    4.9
                    <Star className="w-8 h-8 sm:w-10 sm:h-10 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="text-white/80 text-sm sm:text-base font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    Средний рейтинг
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator - убран полностью на мобиле */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1.5 },
            y: { duration: 1.5, repeat: Infinity }
          }}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-xs sm:text-sm hidden md:flex flex-col items-center gap-2"
        >
          <div style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Прокрутите вниз</div>
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/40 rounded-full p-1">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-white/60 rounded-full mx-auto"
            />
          </div>
        </motion.div>
      </section>

      {/* Блок "Планы на сезон" */}
      <section className="py-12 md:py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Популярные направления 🌏</h2>
            <div className="hidden md:flex gap-2">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 overflow-hidden">
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
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold text-white">{idea.title}</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Динамическая навигация по направлениям */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Изучайте по категориям</h2>
            <Link to="/tours" className="hidden sm:block">
              <Button variant="outline" className="rounded-full text-sm md:text-base">
                Все экскурсии <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
          
          <DynamicNavigation 
            section="landmarks"
            limit={8}
            showIcons={true}
          />
        </div>
      </section>

      {/* Популярные направления (города) */}
      <section className="py-12 md:py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Популярные направления</h2>
          
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {destinations.map((dest: any, i: number) => (
              <motion.div key={i} variants={itemVariants}>
                <Link to={`/tours?location=${encodeURIComponent(dest.name)}`}>
                  <div className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-all" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                      <div className="font-bold text-base md:text-lg">{dest.name}</div>
                      <div className="text-xs md:text-sm text-white/90">{dest.count} экскурсий</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Умные рекомендации */}
      <div className="bg-gray-100">
        <SmartRecommendations 
          limit={6}
          title="Популярные экскурсии"
          showAlgorithm={false}
        />
      </div>

      {/* LiveStats - Живая статистика */}
      <LiveStats />

      {/* AnimatedFeatures - Преимущества */}
      <AnimatedFeatures />

      {/* CTA блок: Индивидуальные туры */}
      <section className="py-12 md:py-20 bg-airbnb-rausch">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <span className="text-3xl md:text-4xl">✨</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Не нашли подходящую экскурсию?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
              Опишите что хотите увидеть, и мы создадим индивидуальный тур специально для вас
            </p>
              <Link to="/request">
                <Button 
                  size="lg" 
                className="bg-white text-airbnb-rausch hover:bg-gray-50 font-semibold text-base md:text-lg px-6 py-5 md:px-8 md:py-6 rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                Оставить заявку на индивидуальный тур
                </Button>
              </Link>
          </motion.div>
        </div>
      </section>

      {/* Как мы делаем экскурсии */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Как мы делаем экскурсии</h2>
            <p className="text-base md:text-lg text-gray-600">
              Мы — тысячи увлечённых гидов с необычным опытом и глубокими знаниями. 
              Это журналисты, историки, архитекторы и другие интересные люди, 
              которые умеют увлечь историями о своих городах и странах.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
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
      <section className="py-12 md:py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Свежие отзывы</h2>
            <div className="hidden md:flex gap-2">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
      <section className="py-12 md:py-16 bg-airbnb-rausch text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
              Экскурсии и туры от экспертов
            </h3>
            <p className="text-sm md:text-base mb-4 md:mb-6 text-white/90">
              Классные места, скидки и интересные события у вас в почте · 
              <a href="#" className="underline ml-1">Пример письма</a>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Эл. почта"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900"
              />
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3">
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
      <section className="py-12 md:py-16 bg-gray-100 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-airbnb-rausch mb-2">500+</div>
              <div className="text-sm md:text-base text-gray-600">Увлечённых гидов</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-airbnb-babu mb-2">10,000+</div>
              <div className="text-sm md:text-base text-gray-600">Довольных путешественников</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-airbnb-arches mb-2">4.9</div>
              <div className="text-sm md:text-base text-gray-600">Средний рейтинг</div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
