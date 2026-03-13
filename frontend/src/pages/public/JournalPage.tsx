import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Clock, Calendar, TrendingUp, Sparkles, BookOpen, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { api } from '@/lib/api'

interface Article {
  id: number
  title: string
  slug: string
  preview_text: string
  content: string
  photo_url: string
  read_time: number
  country_tag: string
  views_count: number
  published_at: string
  created_at: string
}

const ARTICLES_PER_PAGE = 12

export default function JournalPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const filtersContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Получаем параметры из URL
  const selectedCountry = searchParams.get('country') || null
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  // Загружаем ВСЕ статьи один раз (без фильтра по стране) - фильтруем локально
  const { data: articlesData } = useQuery<{ articles: Article[], total: number }>({
    queryKey: ['all-articles'], // Один ключ для всех статей
    queryFn: async () => {
      const response = await api.get('/articles/', {
        params: { limit: 1000 }
      })
      return response.data
    },
    staleTime: 1000 * 60 * 30, // 30 минут - данные считаются свежими
    gcTime: 1000 * 60 * 60, // 1 час в кэше
  })

  // Фильтруем статьи по стране локально
  const allArticles: Article[] = articlesData?.articles || []
  const articles = selectedCountry 
    ? allArticles.filter(a => a.country_tag === selectedCountry)
    : allArticles
  const totalArticles = articles.length

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Debounce поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Фильтрация по поиску
  const searchedArticles = debouncedSearch
    ? articles.filter(a => 
        a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        a.preview_text.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        a.country_tag?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : articles

  // Пагинация
  const totalPages = Math.ceil(searchedArticles.length / ARTICLES_PER_PAGE)
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
  const paginatedArticles = searchedArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE)

  // Первые 3 статьи — featured (только на первой странице без поиска)
  const showFeatured = currentPage === 1 && !debouncedSearch
  const featuredArticles = showFeatured ? paginatedArticles.slice(0, 3) : []
  const regularArticles = showFeatured ? paginatedArticles.slice(3) : paginatedArticles

  // Уникальные страны
  const countries = Array.from(new Set(articles.map(a => a.country_tag).filter(Boolean)))

  // Обновление URL параметров
  const updateParams = (updates: { country?: string | null; page?: number }) => {
    const newParams = new URLSearchParams(searchParams)
    
    if (updates.country !== undefined) {
      if (updates.country) {
        newParams.set('country', updates.country)
      } else {
        newParams.delete('country')
      }
      newParams.delete('page') // Сбрасываем страницу при смене страны
    }
    
    if (updates.page !== undefined) {
      if (updates.page > 1) {
        newParams.set('page', updates.page.toString())
      } else {
        newParams.delete('page')
      }
    }
    
    setSearchParams(newParams)
  }

  const goToPage = (page: number) => {
    updateParams({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Автоцентрирование выбранной страны при прокрутке (только на мобиле)
  useEffect(() => {
    if (!filtersContainerRef.current || !isMobile) return

    const buttons = filtersContainerRef.current.querySelectorAll('button')
    let selectedButton: HTMLElement | null = null

    if (selectedCountry) {
      buttons.forEach(button => {
        if (button.textContent?.includes(selectedCountry!)) {
          selectedButton = button as HTMLElement
        }
      })
    } else {
      selectedButton = buttons[0] as HTMLElement
    }

    if (selectedButton) {
      selectedButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [selectedCountry, isMobile])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Генерация страниц пагинации
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PublicHeader />

      {/* Hero - современный градиент */}
      <section className="relative bg-gradient-to-r from-airbnb-rausch via-pink-600 to-purple-600 py-24 md:py-32 overflow-hidden">
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
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Открывайте новые горизонты вместе с нами: гайды, советы и истории от местных экспертов по всей Азии
            </p>

            {/* Поиск */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Поиск статей..."
                  aria-label="Поиск статей"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen size={18} />
                <span>{totalArticles} статей</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} />
                <span>{countries.length} стран</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Фильтры по странам */}
      <div className="sticky top-24 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div 
            ref={filtersContainerRef}
            className={`flex items-center gap-3 ${
              isMobile 
                ? 'overflow-x-auto scrollbar-hide scroll-smooth' 
                : 'flex-wrap'
            }`}
            style={isMobile ? { scrollSnapType: 'x mandatory' } : undefined}
          >
            <button
              onClick={() => updateParams({ country: null })}
              className={`px-5 py-2.5 rounded-full shrink-0 transition-all font-medium ${!selectedCountry
                  ? 'bg-gradient-to-r from-airbnb-rausch to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={isMobile ? { scrollSnapAlign: 'center' } : undefined}
            >
              Все статьи ({articles.length})
            </button>
            {countries.map((country) => {
              const count = articles.filter(a => a.country_tag === country).length
              return (
                <button
                  key={country}
                  onClick={() => updateParams({ country })}
                  className={`px-5 py-2.5 rounded-full shrink-0 transition-all font-medium ${selectedCountry === country
                      ? 'bg-gradient-to-r from-airbnb-rausch to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                  style={isMobile ? { scrollSnapAlign: 'center' } : undefined}
                >
                  {country} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Результат поиска */}
      {debouncedSearch && (
        <div className="container mx-auto px-4 py-4">
          <p className="text-gray-600">
            Найдено <strong>{searchedArticles.length}</strong> статей по запросу "{debouncedSearch}"
          </p>
        </div>
      )}

      {/* Featured статьи */}
      {featuredArticles.length > 0 && (
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="text-airbnb-rausch" size={28} />
              <h2 className="text-3xl font-bold text-gray-900">Популярные статьи</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article, index) => (
                <Link to={`/journal/${article.slug}`} key={article.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden h-full flex flex-col group"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={article.photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=1200&h=800&fit=crop'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                          <TrendingUp size={12} />
                          <span className="text-xs font-semibold text-gray-700">
                            {(article.views_count || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {article.country_tag && (
                          <span className="px-3 py-1 bg-airbnb-rausch/10 text-airbnb-rausch text-xs font-semibold rounded-full">
                            {article.country_tag}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-airbnb-rausch transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-1">
                        {article.preview_text}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Clock size={16} />
                            <span>{article.read_time} мин</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            <span>{formatDate(article.published_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Все статьи */}
      {regularArticles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {showFeatured ? 'Все статьи' : `Статьи (стр. ${currentPage})`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article, index) => (
                <Link to={`/journal/${article.slug}`} key={article.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden h-full flex flex-col group border border-gray-100"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=1200&h=800&fit=crop'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {article.country_tag && (
                          <span className="px-2.5 py-1 bg-airbnb-rausch/10 text-airbnb-rausch text-xs font-semibold rounded-full">
                            {article.country_tag}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-airbnb-rausch transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                        {article.preview_text}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{article.read_time} мин</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(article.published_at)}</span>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {(article.views_count || 0).toLocaleString()} просмотров
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  {/* Предыдущая */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Номера страниц */}
                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <button
                        key={index}
                        onClick={() => goToPage(page)}
                        className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-airbnb-rausch text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="px-2 text-gray-400">...</span>
                    )
                  ))}

                  {/* Следующая */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Инфо о пагинации */}
            {totalPages > 1 && (
              <p className="text-center text-gray-500 mt-4">
                Страница {currentPage} из {totalPages} · Всего {searchedArticles.length} статей
              </p>
            )}
          </div>
        </section>
      )}

      {/* Пустое состояние */}
      {paginatedArticles.length === 0 && (
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <Sparkles size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Статьи не найдены</h3>
            <p className="text-gray-600 mb-6">
              {debouncedSearch 
                ? `По запросу "${debouncedSearch}" ничего не найдено. Попробуйте другой запрос.`
                : 'К сожалению, для выбранной страны пока нет статей. Попробуйте выбрать другую страну.'
              }
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                updateParams({ country: null })
              }}
              className="px-6 py-3 bg-airbnb-rausch text-white rounded-full font-medium hover:bg-airbnb-rausch/90 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        </section>
      )}

      {/* CTA секция */}
      <section className="py-16 bg-gradient-to-r from-airbnb-rausch to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Готовы к новым открытиям?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Найдите идеальную экскурсию с русскоговорящим гидом в любой стране Азии
            </p>
            <Link to="/tours">
              <button className="px-8 py-4 bg-white text-airbnb-rausch rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Смотреть экскурсии
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
