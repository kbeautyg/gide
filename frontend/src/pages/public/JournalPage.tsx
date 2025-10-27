import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Calendar, TrendingUp, Sparkles } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'

export default function JournalPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  // Полные статьи про страны Азии
  const articles = [
    {
      id: 1,
      title: 'Таиланд: полный гид по стране улыбок',
      slug: 'tailand-polnyj-gid',
      preview: 'Откройте для себя удивительный Таиланд: от шумного Бангкока до райских пляжей Пхукета. Узнайте о лучших местах, традициях и секретах путешествия.',
      photo: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&h=800&fit=crop',
      readTime: 18,
      publishedAt: '15 окт 2024',
      countryTag: 'Таиланд',
      views: 12500,
      featured: true,
      category: 'Путеводители'
    },
    {
      id: 2,
      title: 'Япония: путешествие в страну восходящего солнца',
      slug: 'yaponiya-puteshestvie',
      preview: 'Древние храмы Киото, неоновые огни Токио и священная гора Фудзи. Погрузитесь в уникальную культуру Японии и откройте её секреты.',
      photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=800&fit=crop',
      readTime: 22,
      publishedAt: '10 окт 2024',
      countryTag: 'Япония',
      views: 15800,
      featured: true,
      category: 'Культура'
    },
    {
      id: 3,
      title: 'Бали: остров богов и бесконечного лета',
      slug: 'bali-ostrov-bogov',
      preview: 'Рисовые террасы Убуда, серферские волны Семиньяка и духовные церемонии. Узнайте, почему Бали называют раем на земле.',
      photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop',
      readTime: 16,
      publishedAt: '5 окт 2024',
      countryTag: 'Индонезия',
      views: 9200,
      featured: false,
      category: 'Пляжный отдых'
    },
    {
      id: 4,
      title: 'Вьетнам: от бухты Халонг до дельты Меконга',
      slug: 'vietnam-ot-halong-do-mekonga',
      preview: 'Изумрудные воды бухты Халонг, древний город Хойан и шумный Хошимин. Откройте многогранный Вьетнам во всей его красе.',
      photo: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=800&fit=crop',
      readTime: 20,
      publishedAt: '28 сен 2024',
      countryTag: 'Вьетнам',
      views: 8500,
      featured: false,
      category: 'Приключения'
    },
    {
      id: 5,
      title: 'ОАЭ: роскошь и традиции Востока',
      slug: 'oae-roskosh-i-tradicii',
      preview: 'Небоскрёбы Дубая, золотые пляжи и древние рынки. Узнайте, как современность сочетается с традициями в Эмиратах.',
      photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=800&fit=crop',
      readTime: 14,
      publishedAt: '20 сен 2024',
      countryTag: 'ОАЭ',
      views: 11200,
      featured: false,
      category: 'Роскошь'
    },
    {
      id: 6,
      title: 'Южная Корея: K-pop, кимчи и древние дворцы',
      slug: 'yuzhnaya-koreya-kpop',
      preview: 'Современный Сеул, традиционные ханбоки и вулканический остров Чеджу. Погрузитесь в динамичную культуру Кореи.',
      photo: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&h=800&fit=crop',
      readTime: 17,
      publishedAt: '12 сен 2024',
      countryTag: 'Корея',
      views: 7800,
      featured: false,
      category: 'Культура'
    },
    {
      id: 7,
      title: 'Сингапур: город будущего в тропиках',
      slug: 'singapur-gorod-budushchego',
      preview: 'Футуристические сады у залива, многокультурные кварталы и мишленовские хокер-центры. Откройте уникальный Сингапур.',
      photo: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=800&fit=crop',
      readTime: 12,
      publishedAt: '5 сен 2024',
      countryTag: 'Сингапур',
      views: 6500,
      featured: false,
      category: 'Городской туризм'
    },
    {
      id: 8,
      title: 'Малайзия: где встречаются культуры',
      slug: 'malayziya-gde-vstrechayutsya-kultury',
      preview: 'Башни Петронас, чайные плантации Камерон Хайлендс и пляжи Лангкави. Исследуйте разнообразную Малайзию.',
      photo: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=800&fit=crop',
      readTime: 15,
      publishedAt: '28 авг 2024',
      countryTag: 'Малайзия',
      views: 5200,
      featured: false,
      category: 'Природа'
    },
  ]

  const countries = Array.from(new Set(articles.map(a => a.countryTag)))
  
  const filteredArticles = selectedCountry
    ? articles.filter(a => a.countryTag === selectedCountry)
    : articles

  const featuredArticles = filteredArticles.filter(a => a.featured)
  const regularArticles = filteredArticles.filter(a => !a.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PublicHeader />

      {/* Hero - современный градиент */}
      <section className="relative bg-gradient-to-r from-airbnb-rausch via-pink-600 to-purple-600 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2LTIuNjkgNi02cy0yLjY5LTYtNi02LTYgMi42OS02IDYgMi42OSA2IDYgNnptMC00YzEuMSAwIDItLjkgMi0ycy0uOS0yLTItMi0yIC45LTIgMiAuOSAyIDIgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <Sparkles size={16} />
              <span>Вдохновляющие истории путешествий</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              Журнал путешествий
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Открывайте новые горизонты вместе с нами: гайды, советы и истории от местных экспертов по всей Азии
            </p>
          </motion.div>
        </div>

        {/* Декоративные элементы */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Фильтры по странам - улучшенный дизайн */}
      <div className="sticky top-24 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCountry(null)}
              className={`px-5 py-2.5 rounded-full shrink-0 transition-all font-medium ${
                !selectedCountry
                  ? 'bg-gradient-to-r from-airbnb-rausch to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Все статьи ({articles.length})
            </button>
            {countries.map((country) => {
              const count = articles.filter(a => a.countryTag === country).length
              return (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-5 py-2.5 rounded-full shrink-0 transition-all font-medium ${
                    selectedCountry === country
                      ? 'bg-gradient-to-r from-airbnb-rausch to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {country} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Featured статьи - крупные карточки */}
      {featuredArticles.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="text-airbnb-rausch" size={28} />
              <h2 className="text-3xl font-bold text-gray-900">Популярные статьи</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/journal/${article.slug}`}>
                    <article className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={article.photo}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Бейдж категории */}
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-900">
                            {article.category}
                          </span>
                        </div>

                        {/* Просмотры */}
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                            <TrendingUp size={12} />
                            {article.views.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Clock size={16} />
                            <span>{article.readTime} мин</span>
                          </div>
                          <span>·</span>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            <span>{article.publishedAt}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-airbnb-rausch transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-1">
                          {article.preview}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            #{article.countryTag}
                          </span>
                          <span className="text-airbnb-rausch font-semibold group-hover:gap-3 flex items-center gap-2 transition-all">
                            Читать далее
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Остальные статьи - компактная сетка */}
      {regularArticles.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Все статьи</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/journal/${article.slug}`}>
                    <article className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={article.photo}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{article.readTime} мин</span>
                          </div>
                          <span>·</span>
                          <span>{article.publishedAt}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-airbnb-rausch transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                          {article.preview}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-blue-700 font-medium">
                            #{article.countryTag}
                          </span>
                          <span className="text-xs text-gray-400">
                            {article.views.toLocaleString()} просмотров
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Пустое состояние */}
      {filteredArticles.length === 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Статей не найдено
              </h3>
              <p className="text-gray-600 mb-6">
                К сожалению, для выбранной страны пока нет статей. Попробуйте выбрать другую страну.
              </p>
              <button
                onClick={() => setSelectedCountry(null)}
                className="px-6 py-3 bg-airbnb-rausch text-white rounded-full font-semibold hover:bg-airbnb-rausch/90 transition-colors"
              >
                Показать все статьи
              </button>
            </div>
          </div>
        </section>
      )}

      <PublicFooter />
    </div>
  )
}
