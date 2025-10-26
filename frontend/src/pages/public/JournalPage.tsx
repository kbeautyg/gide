import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'

export default function JournalPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  // Азиатские статьи с реальным контентом
  const articles = [
    {
      id: 1,
      title: '10 лучших пляжей Пхукета: от Патонга до секретных бухт',
      slug: 'plyazhi-phuketa',
      preview: 'Откройте для себя райские уголки острова: от знаменитого Патонга до уединённых бухт для романтического отдыха',
      photo: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&h=800&fit=crop',
      readTime: 12,
      publishedAt: '15 окт 2025',
      countryTag: 'Таиланд',
      featured: true,
      size: 'large'
    },
    {
      id: 2,
      title: 'Уличная еда Бангкока: гид по лучшим рынкам',
      slug: 'ulichnaya-eda-bangkoka',
      preview: 'Погружение в гастрономическую культуру столицы Таиланда',
      photo: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
      readTime: 8,
      publishedAt: '12 окт 2025',
      countryTag: 'Таиланд',
      size: 'medium'
    },
    {
      id: 3,
      title: 'Храмы Чиангмая: духовное сердце Таиланда',
      slug: 'hramy-chiangmaya',
      preview: 'Древние святыни в горах северного Таиланда',
      photo: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&h=600&fit=crop',
      readTime: 10,
      publishedAt: '8 окт 2025',
      countryTag: 'Таиланд',
      size: 'small'
    },
    {
      id: 4,
      title: 'Сакура в Токио: лучшие места для ханами',
      slug: 'sakura-v-tokio',
      preview: 'Где увидеть цветение сакуры в японской столице',
      photo: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=600&fit=crop',
      readTime: 11,
      publishedAt: '5 окт 2025',
      countryTag: 'Япония',
      size: 'medium'
    },
    {
      id: 5,
      title: 'Онсэны Киото: традиционные термальные источники',
      slug: 'onseny-kioto',
      preview: 'Японская культура купания в горячих источниках',
      photo: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&h=600&fit=crop',
      readTime: 9,
      publishedAt: '1 окт 2025',
      countryTag: 'Япония',
      size: 'small'
    },
    {
      id: 6,
      title: 'Уличная культура Осаки: гастрономический рай',
      slug: 'osaка-gastronomiya',
      preview: 'Кухня Осаки — лучшая в Японии',
      photo: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=600&fit=crop',
      readTime: 7,
      publishedAt: '28 сен 2025',
      countryTag: 'Япония',
      size: 'small'
    },
    {
      id: 7,
      title: 'Дубай за 3 дня: маршрут по главным достопримечательностям',
      slug: 'dubai-za-3-dnya',
      preview: 'От Бурдж-Халифа до традиционных рынков',
      photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
      readTime: 14,
      publishedAt: '25 сен 2025',
      countryTag: 'ОАЭ',
      size: 'large'
    },
    {
      id: 8,
      title: 'Пустынное сафари в ОАЭ: что нужно знать',
      slug: 'pustynnoe-safari-oae',
      preview: 'Приключения в песчаных дюнах и бедуинский ужин',
      photo: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&h=600&fit=crop',
      readTime: 6,
      publishedAt: '20 сен 2025',
      countryTag: 'ОАЭ',
      size: 'small'
    },
    {
      id: 9,
      title: 'Убуд: йога, рисовые террасы и балийская культура',
      slug: 'ubud-bali',
      preview: 'Духовный центр острова Бали',
      photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
      readTime: 13,
      publishedAt: '15 сен 2025',
      countryTag: 'Индонезия',
      size: 'medium'
    },
    {
      id: 10,
      title: 'Серфинг на Бали: лучшие споты для новичков',
      slug: 'serfing-na-bali',
      preview: 'Где научиться ловить волны на острове богов',
      photo: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
      readTime: 8,
      publishedAt: '10 сен 2025',
      countryTag: 'Индонезия',
      size: 'small'
    },
    {
      id: 11,
      title: 'Бухта Халонг: круиз по изумрудным водам',
      slug: 'buhta-halong',
      preview: 'Величественные известняковые скалы Вьетнама',
      photo: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
      readTime: 10,
      publishedAt: '5 сен 2025',
      countryTag: 'Вьетнам',
      size: 'medium'
    },
    {
      id: 12,
      title: 'Ночной рынок Ханоя: атмосфера старого города',
      slug: 'nochnoy-rynok-hanoya',
      preview: 'Колорит вьетнамской столицы после заката',
      photo: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop',
      readTime: 7,
      publishedAt: '1 сен 2025',
      countryTag: 'Вьетнам',
      size: 'small'
    },
  ]

  const countries = Array.from(new Set(articles.map(a => a.countryTag)))
  
  const filteredArticles = selectedCountry
    ? articles.filter(a => a.countryTag === selectedCountry)
    : articles

  const featuredArticle = articles.find(a => a.featured)
  
  // Цветовая кодировка стран
  const countryColors: Record<string, string> = {
    'Таиланд': 'bg-blue-500',
    'Япония': 'bg-pink-500',
    'ОАЭ': 'bg-amber-500',
    'Индонезия': 'bg-green-500',
    'Вьетнам': 'bg-red-500',
    'Корея': 'bg-purple-500',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <PublicHeader />

      {/* Hero с featured статьёй */}
      {featuredArticle && !selectedCountry && (
        <section className="relative h-[600px] overflow-hidden">
          <img
            src={featuredArticle.photo}
            alt={featuredArticle.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                    <Sparkles size={16} />
                    <span className="text-sm font-semibold">Рекомендуем</span>
                  </div>
                  <span className={`px-4 py-2 ${countryColors[featuredArticle.countryTag]} text-white rounded-full text-sm font-semibold`}>
                    {featuredArticle.countryTag}
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  {featuredArticle.title}
                </h1>
                <p className="text-xl text-white/90 mb-8">
                  {featuredArticle.preview}
                </p>
                <div className="flex items-center gap-6 text-white/80 mb-8">
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>{featuredArticle.readTime} мин</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{featuredArticle.publishedAt}</span>
                  </div>
                </div>
                <Link to={`/journal/${featuredArticle.slug}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all"
                  >
                    Читать статью
                    <ArrowRight size={20} />
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Заголовок журнала (если featured скрыт) */}
      {(!featuredArticle || selectedCountry) && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4 text-gray-900">
              Журнал путешествий
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Вдохновляем на путешествия: советы, гайды и истории от местных экспертов
            </p>
          </div>
        </section>
      )}

      {/* Фильтры по странам - Sticky */}
      <div className="sticky top-[80px] z-40 bg-white/90 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCountry(null)}
              className={`px-6 py-2.5 rounded-full shrink-0 transition-all font-medium ${
                !selectedCountry
                  ? 'bg-gradient-to-r from-airbnb-rausch to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Все статьи
            </motion.button>
            {countries.map((country) => (
              <motion.button
                key={country}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCountry(country)}
                className={`px-6 py-2.5 rounded-full shrink-0 transition-all font-medium ${
                  selectedCountry === country
                    ? `${countryColors[country]} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {country}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry Layout - Pinterest Style */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredArticles
              .filter(a => !a.featured || selectedCountry) // Скрываем featured из списка если она показана сверху
              .map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid"
              >
                <Link to={`/journal/${article.slug}`}>
                  <article className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 mb-6">
                    {/* Изображение с разной высотой */}
                    <div className={`relative overflow-hidden ${
                      article.size === 'large' ? 'h-96' : 
                      article.size === 'medium' ? 'h-64' : 
                      'h-48'
                    }`}>
                      <img
                        src={article.photo}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Overlay градиент */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Тег страны */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1.5 ${countryColors[article.countryTag]} text-white rounded-full text-xs font-bold shadow-lg`}>
                          {article.countryTag}
                        </span>
                      </div>
                    </div>
                    
                    {/* Контент */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-airbnb-rausch transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {article.preview}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{article.readTime} мин</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{article.publishedAt}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Призыв к действию */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12">
              <Sparkles className="mx-auto mb-4 text-airbnb-rausch" size={48} />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Готовы к путешествию?
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Найдите идеальную экскурсию с местным гидом
              </p>
              <Link to="/tours">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-airbnb-rausch to-pink-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Смотреть экскурсии
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

