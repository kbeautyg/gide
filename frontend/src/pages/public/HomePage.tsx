import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Star, Users, Shield, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { LiveStats } from '@/components/LiveStats'
import { AnimatedFeatures } from '@/components/AnimatedFeatures'
import { DynamicNavigation } from '@/components/DynamicNavigation'
import { SmartRecommendations } from '@/components/SmartRecommendations'
import { buildToursLink } from '@/lib/navigationUtils'
import { COUNTRY_SLUG_MAP, getCountryImage, getHeroBackground } from '@/constants/countryData'

import { ImageWithFallback } from '@/components/ImageWithFallback'

// Статические данные для стран (описания и картинки с бэкенда)
const COUNTRY_STATIC_DATA: Record<string, { description: string; image: string; highlights?: string[] }> = {
  'Таиланд': {
    description: 'Золотые храмы, белоснежные пляжи, уличная еда и тропические острова',
    image: getCountryImage('Таиланд'),
    highlights: ['Бангкок', 'Пхукет', 'Паттайя']
  },
  'ОАЭ': {
    description: 'Футуристические небоскребы, бескрайние пустыни и восточная роскошь',
    image: getCountryImage('ОАЭ'),
    highlights: ['Дубай', 'Абу-Даби', 'Шарджа']
  },
  'Япония': {
    description: 'Древние храмы, современные технологии, суши и цветущая сакура',
    image: getCountryImage('Япония'),
    highlights: ['Токио', 'Киото', 'Осака']
  },
  'Южная Корея': {
    description: 'K-pop культура, дворцы, уличная еда и неоновые улицы Сеула',
    image: getCountryImage('Южная Корея'),
  },
  'Индонезия': {
    description: 'Рисовые террасы Бали, вулканы, серфинг и древние храмы',
    image: getCountryImage('Индонезия'),
  },
  'Вьетнам': {
    description: 'Бухта Халонг, традиционная кухня, древние города и рисовые поля',
    image: getCountryImage('Вьетнам'),
  },
  'Сингапур': {
    description: 'Город-сад с небоскребами, мультикультурность и уличная еда',
    image: getCountryImage('Сингапур'),
  },
  'Китай': {
    description: 'Великая стена, Терракотовая армия, мегаполисы и древняя культура',
    image: getCountryImage('Китай'),
  },
  'Индия': {
    description: 'Тадж-Махал, йога, специи, духовные практики и красочные фестивали',
    image: getCountryImage('Индия'),
  },
  'Турция': {
    description: 'Каппадокия, Стамбул, море и античные руины',
    image: getCountryImage('Турция'),
  },
  'Малайзия': {
    description: 'Небоскребы Куала-Лумпура, чайные плантации и джунгли Борнео',
    image: getCountryImage('Малайзия'),
  }
}

export default function HomePage() {
  const [reviewIndex, setReviewIndex] = useState(0)
  const queryClient = useQueryClient()

  // Prefetch статей и туров при загрузке главной страницы
  useEffect(() => {
    // Prefetch все статьи для журнала
    queryClient.prefetchQuery({
      queryKey: ['all-articles'],
      queryFn: async () => {
        const response = await api.get('/articles/', { params: { limit: 1000 } })
        return response.data
      },
      staleTime: 1000 * 60 * 30, // 30 минут
    })

    // Prefetch туры (первая страница без фильтров)
    queryClient.prefetchQuery({
      queryKey: ['tours', '', [], [], [], [], [], [0, 100000], [0, 24], [0, 5], 1, null, '', '', 1],
      queryFn: async () => {
        const response = await api.get('/tours/', { params: { page: 1, page_size: 50 } })
        return response.data
      },
      staleTime: 1000 * 60 * 5, // 5 минут
    })
  }, [queryClient])

  // Загружаем статистику стран из API
  const { data: countriesData } = useQuery({
    queryKey: ['countries-stats-home'],
    queryFn: async () => {
      const response = await api.get('/destinations/countries-stats')
      return response.data
    },
    staleTime: 1000 * 60 * 10, // 10 минут
  })

  // Все страны из API, сортированные по количеству туров
  const allCountriesFromApi = (countriesData?.countries || [])
    .filter((c: any) => c.tours_count > 0) // Только страны с турами
    .sort((a: any, b: any) => b.tours_count - a.tours_count) // Сортировка по убыванию
    .map((c: any) => {
      const staticData = COUNTRY_STATIC_DATA[c.country]
      return {
        name: c.country,
        description: c.description || staticData?.description || '',
        image: c.image || staticData?.image || '',
        tours: c.tours_count || 0,
        highlights: c.highlights || staticData?.highlights || [],
        link: `/tours?location=${encodeURIComponent(c.country)}`
      }
    })

  // Подсчёт реального количества туров для статистики
  const totalToursCount = allCountriesFromApi.reduce((sum: number, c: any) => sum + (c.tours || 0), 0)

  // Топ-3 страны (первые 3 из отсортированного списка)
  const topCountries = allCountriesFromApi.slice(0, 3)
  
  // Остальные страны
  const moreCountries = allCountriesFromApi.slice(3)

  // Загружаем реальные отзывы из API
  const { data: reviewsApiData } = useQuery({
    queryKey: ['homepage-reviews'],
    queryFn: async () => {
      try {
        const response = await api.get('/reviews/latest', { params: { limit: 3 } })
        return response.data
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  })

  // Используем реальные отзывы или пустой массив (НЕ фейковые)
  const reviews = (reviewsApiData?.reviews || []).map((r: any) => ({
    name: r.author_name || 'Путешественник',
    photo: '',
    rating: r.rating || 5,
    text: r.text || r.comment || '',
    tour: r.tour_title || '',
    experience: r.tours_count || 0,
  }))

  return (
    <div className="min-h-screen bg-black">
      {/* SEO для главной страницы */}
      <Helmet>
        <title>Экскурсии по Азии 2025 — Таиланд, Вьетнам, Китай, Япония | Inturex</title>
        <meta name="description" content="🌏 Авторские экскурсии по Азии с русскоговорящими гидами. Таиланд, Вьетнам, Китай, Япония, Индонезия, Индия. 335+ туров от местных экспертов. Бронируйте онлайн!" />
        <meta name="keywords" content="экскурсии по Азии, туры в Таиланд, экскурсии Вьетнам, путешествие Китай, туры Япония, Бали экскурсии, Индия туры, русский гид Азия, авторские туры, индивидуальные экскурсии, экскурсии с гидом, туры 2025" />
        <link rel="canonical" href="https://inturex.pro/" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Экскурсии по Азии 2025 — Таиланд, Вьетнам, Китай, Япония | Inturex" />
        <meta property="og:description" content="🌏 Авторские экскурсии по Азии с русскоговорящими гидами. 335+ туров от местных экспертов." />
        <meta property="og:url" content="https://inturex.pro/" />
        <meta property="og:site_name" content="Inturex — Экскурсии по Азии" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Экскурсии по Азии 2025 — Таиланд, Вьетнам, Китай, Япония | Inturex" />
        <meta name="twitter:description" content="🌏 Авторские экскурсии по Азии с русскоговорящими гидами. 335+ туров от местных экспертов." />
        <meta property="og:image" content="https://inturex.pro/og-image.jpg" />
        <meta name="twitter:image" content="https://inturex.pro/og-image.jpg" />
        
        {/* JSON-LD Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "Inturex",
            "alternateName": "Inturex Pro",
            "description": "Авторские экскурсии по Азии с русскоговорящими гидами. Таиланд, Вьетнам, Китай, Япония, Индонезия, Индия.",
            "url": "https://inturex.pro/",
            "logo": "https://inturex.pro/logo.png",
            "image": "https://inturex.pro/og-image.jpg",
            "email": "help@inturex.pro",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "TH",
              "addressLocality": "Phuket"
            },
            "areaServed": [
              {"@type": "Country", "name": "Thailand"},
              {"@type": "Country", "name": "Vietnam"},
              {"@type": "Country", "name": "China"},
              {"@type": "Country", "name": "Japan"},
              {"@type": "Country", "name": "Indonesia"},
              {"@type": "Country", "name": "India"},
              {"@type": "Country", "name": "Turkey"},
              {"@type": "Country", "name": "United Arab Emirates"},
              {"@type": "Country", "name": "South Korea"},
              {"@type": "Country", "name": "Singapore"},
              {"@type": "Country", "name": "Malaysia"}
            ],
            "priceRange": "₽₽-₽₽₽",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "09:00",
              "closes": "19:00"
            },
            "sameAs": []
          })}
        </script>
        
        {/* JSON-LD ItemList for Popular Destinations */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Популярные направления экскурсий по Азии",
            "description": "Топ направлений для экскурсий с русскоговорящими гидами",
            "numberOfItems": 11,
            "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "Таиланд", "url": "https://inturex.pro/tours?location=Таиланд"},
              {"@type": "ListItem", "position": 2, "name": "ОАЭ", "url": "https://inturex.pro/tours?location=ОАЭ"},
              {"@type": "ListItem", "position": 3, "name": "Япония", "url": "https://inturex.pro/tours?location=Япония"},
              {"@type": "ListItem", "position": 4, "name": "Китай", "url": "https://inturex.pro/tours?location=Китай"},
              {"@type": "ListItem", "position": 5, "name": "Вьетнам", "url": "https://inturex.pro/tours?location=Вьетнам"},
              {"@type": "ListItem", "position": 6, "name": "Индонезия", "url": "https://inturex.pro/tours?location=Индонезия"},
              {"@type": "ListItem", "position": 7, "name": "Индия", "url": "https://inturex.pro/tours?location=Индия"},
              {"@type": "ListItem", "position": 8, "name": "Турция", "url": "https://inturex.pro/tours?location=Турция"},
              {"@type": "ListItem", "position": 9, "name": "Южная Корея", "url": "https://inturex.pro/tours?location=Южная Корея"},
              {"@type": "ListItem", "position": 10, "name": "Сингапур", "url": "https://inturex.pro/tours?location=Сингапур"},
              {"@type": "ListItem", "position": 11, "name": "Малайзия", "url": "https://inturex.pro/tours?location=Малайзия"}
            ]
          })}
        </script>
      </Helmet>

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
              backgroundImage: `url('${getHeroBackground()}')`
            }}
          />
          
          {/* Градиентные оверлеи для читаемости */}
          <div className="absolute inset-0 top-0 left-0 right-0 bottom-0 w-full h-full bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
          <div className="absolute inset-0 top-0 left-0 right-0 bottom-0 w-full h-full bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        </motion.div>

        {/* Контент - адаптивный дизайн */}
        <div className="relative h-full container mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
          {/* SEO: Единственный h1 на странице */}
          <h1 className="sr-only">Экскурсии мечты по Азии с русскоговорящими гидами — Inturex</h1>
          
          {/* Мобильная версия - центрированная */}
          <div className="md:hidden h-full flex items-center justify-center text-center">
          <motion.div
              initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-5xl mx-auto pt-8"
            >
              {/* Заголовок визуальный */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-8 leading-none mt-8"
            style={{
                  textShadow: '0 10px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
            }}
            aria-hidden="true"
          >
            Экскурсии<br />
                <span className="text-[rgb(255,56,92)]">
                  мечты
                </span>
          </motion.div>

          {/* Описание */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl sm:text-2xl text-white/95 mb-12 font-light max-w-3xl mx-auto leading-relaxed"
                style={{
                  textShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}
              >
                Откройте для себя уникальные места Азии с местными гидами
              </motion.p>

              {/* Кнопка */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Link to="/tours">
                  <Button 
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-white/90 font-bold text-lg px-12 py-7 rounded-full shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
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
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mt-20 flex flex-wrap items-center justify-center gap-8"
              >
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-2" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    {totalToursCount > 0 ? `${totalToursCount}+` : '300+'}
                  </div>
                  <div className="text-white/80 text-sm sm:text-base font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    Экскурсий
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-2" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    {allCountriesFromApi.length}+
                  </div>
                  <div className="text-white/80 text-sm sm:text-base font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    Стран
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-2" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    4.9
                    <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="text-white/80 text-sm sm:text-base font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    Средний рейтинг
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Десктопная версия - боковой layout */}
          <div className="hidden md:flex flex-row items-center justify-between h-full gap-12 py-20">
            <div className="w-3/5 xl:w-1/2 flex flex-col gap-6 text-white">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-7xl lg:text-8xl xl:text-[9rem] font-bold text-white leading-[0.95]"
                  style={{
                    textShadow: '0 4px 30px rgba(0,0,0,0.8), 0 8px 60px rgba(0,0,0,0.5)'
                  }}
                  aria-hidden="true"
                >
                  Экскурсии <span className="text-airbnb-rausch">мечты</span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl md:text-2xl text-white/90 max-w-2xl font-light"
            style={{
              textShadow: '0 2px 20px rgba(0,0,0,0.8)'
            }}
          >
            Откройте для себя уникальные места Азии с местными гидами
          </motion.p>
              </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4"
          >
            <Link to="/tours">
              <Button 
                size="lg"
                className="bg-white text-black hover:bg-white/90 font-semibold text-lg px-10 py-7 rounded-full shadow-2xl hover:scale-105 transition-all"
              >
                Смотреть экскурсии
              </Button>
            </Link>
          </motion.div>
            </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="w-2/5 xl:w-1/3 flex flex-col gap-6 text-white"
          >
              <div className="bg-black/25 backdrop-blur-sm px-5 py-4 rounded-2xl">
                <div className="text-4xl font-bold mb-1" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                {totalToursCount > 0 ? `${totalToursCount}+` : '300+'}
              </div>
              <div className="text-white/80 text-base" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                Экскурсий
              </div>
            </div>
              <div className="bg-black/25 backdrop-blur-sm px-5 py-4 rounded-2xl">
                <div className="text-4xl font-bold mb-1" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                {allCountriesFromApi.length}+
              </div>
              <div className="text-white/80 text-base" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                Стран
              </div>
            </div>
              <div className="bg-black/25 backdrop-blur-sm px-5 py-4 rounded-2xl">
                <div className="text-4xl font-bold mb-1" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                4.9 ⭐
              </div>
              <div className="text-white/80 text-base" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                Средний рейтинг
              </div>
            </div>
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

       {/* Топ направления - Страны */}
      {allCountriesFromApi.length > 0 && (
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Популярные направления 🌏
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Выберите страну и откройте для себя лучшие экскурсии
            </motion.p>
          </div>

          {topCountries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {topCountries.map((country: { name: string; description: string; image: string; tours: number; highlights: string[]; link: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8 }}
              >
                <Link to={country.link}>
                  <div className="group relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500">
                    <div className="relative h-full overflow-hidden">
                      <ImageWithFallback
                        src={country.image}
                        alt={country.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-300" />
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-airbnb-rausch transition-colors">
                          {country.name}
                        </h3>
                        <p className="text-white/90 text-base md:text-lg mb-3 leading-relaxed">
                          {country.description}
                        </p>
                        {country.highlights && (
                          <div className="flex gap-2 mb-4 flex-wrap">
                            {country.highlights.map((city: string, idx: number) => (
                              <span key={idx} className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white/90">
                                {city}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-base md:text-lg font-medium">
                            {country.tours} экскурсий
                          </span>
                          <motion.div
                            className="flex items-center gap-2 text-white group-hover:text-airbnb-rausch transition-colors"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <span className="text-base font-medium">Смотреть города</span>
                            <ArrowRight size={20} />
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>

                    <div className="absolute inset-0 border-4 border-airbnb-rausch rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          )}

          {/* Дополнительные страны */}
          {moreCountries.length > 0 && (
          <div className="mt-12">
            <motion.h3 
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ещё больше направлений
            </motion.h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {moreCountries.map((country: { name: string; description: string; image: string; tours: number; link: string }, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={country.link}>
                    <div className="group relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                      <ImageWithFallback
                        src={country.image}
                        alt={country.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h4 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-airbnb-rausch transition-colors">
                          {country.name}
                        </h4>
                        <p className="text-white/80 text-base mb-3 line-clamp-2">
                          {country.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-base">{country.tours} экскурсий</span>
                          <ArrowRight className="w-5 h-5 text-white group-hover:text-airbnb-rausch transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          )}

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/tours">
              <Button 
                size="lg" 
                variant="outline"
                className="rounded-full px-8 py-6 text-base font-semibold border-2 hover:border-airbnb-rausch hover:text-airbnb-rausch transition-all"
              >
                Смотреть все страны
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      )}

       {/* Популярные рубрики */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Популярные рубрики
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Выберите интересующую вас тему экскурсий
            </motion.p>
          </div>
          
          <DynamicNavigation 
            section="all"
            limit={8}
            showIcons={true}
          />

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="space-y-4">
              <p className="text-gray-600 text-base">
                Не нашли нужную категорию? Выберите страну и найдите экскурсии по всем темам
              </p>
              <Link to="/tours">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full px-8 py-6 text-base font-semibold border-2 hover:border-airbnb-rausch hover:text-airbnb-rausch transition-all"
                >
                  Выбрать направление
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
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
      <section className="py-12 md:py-20 bg-gray-100">
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

      {/* Свежие отзывы — только если есть реальные */}
      {reviews.length > 0 && (
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
            {reviews.map((review: any, idx: number) => (
              <motion.div
                key={idx}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-airbnb-rausch/10 flex items-center justify-center text-airbnb-rausch font-bold text-lg">
                    {review.name?.[0] || 'П'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating || 5 }).map((_: any, j: number) => (
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
                
                {review.tour && (
                <div className="text-base text-gray-600 mb-1">
                  <span className="font-medium">{review.tour}</span>
                      </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Email подписка */}
      <section className="py-12 md:py-16 bg-airbnb-rausch text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
              Экскурсии и туры от экспертов
            </h3>
            <p className="text-base mb-4 md:mb-6 text-white/90">
              Классные места, скидки и интересные события у вас в почте · 
              <a href="#" className="underline ml-1">Пример письма</a>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto px-4 sm:px-0">
              <input
                id="subscribe-email"
                type="email"
                placeholder="Эл. почта"
                className="w-full sm:flex-1 px-4 h-12 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-white/50 outline-none text-base"
              />
              <button 
                className="w-full sm:w-auto h-12 bg-gray-900 hover:bg-gray-800 text-white px-8 rounded-lg font-medium transition-colors whitespace-nowrap"
                onClick={() => {
                  const input = document.getElementById('subscribe-email') as HTMLInputElement
                  if (input?.value && input.value.includes('@')) {
                    api.post('/subscribe', { email: input.value }).catch(() => {})
                    input.value = ''
                    // Show inline success
                    input.placeholder = 'Вы подписаны!'
                    setTimeout(() => { input.placeholder = 'Эл. почта' }, 3000)
                  }
                }}
              >
                Подписаться
              </button>
            </div>
            <p className="text-sm text-white/70 mt-3">
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
              <div className="text-3xl md:text-4xl font-bold text-airbnb-rausch mb-2">{totalToursCount > 0 ? `${totalToursCount}+` : '300+'}</div>
              <div className="text-base text-gray-600">Экскурсий на платформе</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-airbnb-babu mb-2">{allCountriesFromApi.length}+</div>
              <div className="text-base text-gray-600">Стран Азии</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-airbnb-arches mb-2">4.9</div>
              <div className="text-base text-gray-600">Средний рейтинг</div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
