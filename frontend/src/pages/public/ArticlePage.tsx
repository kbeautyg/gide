import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Clock, Calendar, ArrowLeft, Share2, Bookmark, TrendingUp, Eye, Sparkles, Loader2, ChevronRight } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { api } from '@/lib/api'
import ReactMarkdown from 'react-markdown'

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
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(false)

        // Загружаем статью
        const response = await api.get(`/articles/${slug}`)
        setArticle(response.data)

        // Загружаем похожие статьи (по той же стране)
        if (response.data.country_tag) {
          const relatedResponse = await api.get('/articles/', {
            params: {
              country_tag: response.data.country_tag,
              limit: 4
            }
          })
          // Исключаем текущую статью
          const filtered = relatedResponse.data.articles.filter(
            (a: Article) => a.slug !== slug
          ).slice(0, 3)
          setRelatedArticles(filtered)
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('Error fetching article:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-airbnb-rausch" size={48} />
        </div>
        <PublicFooter />
      </div>
    )
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-airbnb-rausch to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles className="text-white" size={48} />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Статья не найдена
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                К сожалению, статья, которую вы ищете, не существует или была удалена.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/journal">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-airbnb-rausch to-pink-600 text-white hover:from-airbnb-rausch/90 hover:to-pink-600/90 font-semibold px-8 py-6"
                  >
                    <ArrowLeft className="mr-2" size={20} />
                    Вернуться к журналу
                  </Button>
                </Link>
                <Link to="/tours">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-gray-900 font-semibold px-8 py-6"
                  >
                    Смотреть экскурсии
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        <PublicFooter />
      </div>
    )
  }

  // Очистка markdown от типичных ошибок ChatGPT
  const cleanMarkdown = (content: string): string => {
    let cleaned = content

    // Убираем цифры/символы перед заголовками: "3 ### Title" -> "### Title"
    cleaned = cleaned.replace(/^\d+\.?\s*(#{1,6})\s/gm, '$1 ')

    // Убираем лишние пробелы перед #
    cleaned = cleaned.replace(/^\s+(#{1,6})\s/gm, '$1 ')

    // Исправляем двойные ## ## -> ##
    cleaned = cleaned.replace(/#{2,}\s*#{2,}/g, '##')

    // Убираем одинокие # в начале строки без текста
    cleaned = cleaned.replace(/^#\s*$/gm, '')

    // Убираем артефакты вроде "### " без текста после
    cleaned = cleaned.replace(/^#{1,6}\s*$/gm, '')

    // Убираем символы --- (горизонтальная линия, если не нужна)
    // Оставляем только если это markdown hr (три и более дефисов на отдельной строке)
    // Удаляем одинокие дефисы и пунктирные линии, не являющиеся hr
    cleaned = cleaned.replace(/^-{1,2}$/gm, '')

    // Убираем лишние звёздочки: *** или ** без парного закрытия
    cleaned = cleaned.replace(/^\*{2,}\s*$/gm, '')

    // Нормализуем переносы строк (множественные -> двойные)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

    // Убираем пробелы в конце строк
    cleaned = cleaned.replace(/[ \t]+$/gm, '')

    return cleaned
  }

  // Компоненты для ReactMarkdown
  const MarkdownComponents = {
    // H1 -> H2 style (обычно в контенте H1 не нужен, так как есть заголовок статьи)
    h1: ({ children }: any) => (
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-gray-900 mt-12 mb-6 flex items-center gap-3"
      >
        <span className="w-1.5 h-8 bg-gradient-to-b from-airbnb-rausch to-pink-600 rounded-full" />
        {children}
      </motion.h2>
    ),
    h2: ({ children }: any) => (
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-gray-900 mt-12 mb-6 flex items-center gap-3"
      >
        <span className="w-1.5 h-8 bg-gradient-to-b from-airbnb-rausch to-pink-600 rounded-full" />
        {children}
      </motion.h2>
    ),
    h3: ({ children }: any) => (
      <motion.h3
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-2xl font-bold text-gray-800 mt-8 mb-4"
      >
        {children}
      </motion.h3>
    ),
    p: ({ children }: any) => {
      // Проверяем, если параграф содержит только жирный текст - делаем его акцентным
      // Но с ReactMarkdown это сложнее проверить "на лету" без глубокого анализа children
      // Поэтому просто рендерим красивый параграф
      return (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gray-700 text-lg leading-relaxed my-6"
        >
          {children}
        </motion.p>
      )
    },
    ul: ({ children }: any) => (
      <motion.ul
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-3 my-6 ml-4"
      >
        {children}
      </motion.ul>
    ),
    ol: ({ children }: any) => (
      <motion.ol
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-3 my-6 ml-4 list-decimal list-inside"
      >
        {children}
      </motion.ol>
    ),
    li: ({ children, ordered }: any) => {
      if (ordered) {
        return (
          <li className="text-gray-700 text-lg leading-relaxed pl-2">
            {children}
          </li>
        )
      }
      return (
        <li className="text-gray-700 text-lg leading-relaxed flex items-start gap-3">
          <span className="w-2 h-2 bg-gradient-to-br from-airbnb-rausch to-pink-500 rounded-full mt-2.5 flex-shrink-0" />
          <span>{children}</span>
        </li>
      )
    },
    strong: ({ children }: any) => (
      <strong className="font-bold text-gray-900">{children}</strong>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{article.title} | Журнал Inturex</title>
        <meta name="description" content={article.preview_text} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.preview_text} />
        <meta property="og:image" content={article.photo_url} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://inturex.pro/journal/${article.slug}`} />
      </Helmet>

      <PublicHeader />

      {/* Hero с фото */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <img
          src={article.photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=1920&h=1080&fit=crop'}
          alt={article.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Кнопка назад */}
        <div className="absolute top-8 left-4 md:left-8 z-10">
          <Link to="/journal">
            <Button variant="secondary" size="lg" className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg">
              <ArrowLeft className="mr-2" size={20} />
              Журнал
            </Button>
          </Link>
        </div>

        {/* Действия */}
        <div className="absolute top-8 right-4 md:right-8 z-10 flex gap-3">
          <button
            className="p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="Поделиться"
          >
            <Share2 size={20} className="text-gray-900" />
          </button>
          <button
            className="p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="Сохранить"
          >
            <Bookmark size={20} className="text-gray-900" />
          </button>
        </div>

        {/* Контент Hero */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              {/* Мета-информация */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-3 md:gap-4 text-white/90 text-sm mb-4 md:mb-6"
              >
                {article.country_tag && (
                  <span className="px-4 py-2 bg-gradient-to-r from-airbnb-rausch to-pink-600 rounded-full font-semibold">
                    #{article.country_tag}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{article.read_time} мин чтения</span>
                </div>
                <span className="hidden md:inline">·</span>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                <span className="hidden md:inline">·</span>
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span>{article.views_count.toLocaleString()} просмотров</span>
                </div>
              </motion.div>

              {/* Заголовок */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight"
              >
                {article.title}
              </motion.h1>

              {/* Превью */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl"
              >
                {article.preview_text}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-airbnb-rausch transition-colors">Главная</Link>
            <ChevronRight size={14} />
            <Link to="/journal" className="hover:text-airbnb-rausch transition-colors">Журнал</Link>
            <ChevronRight size={14} />
            {article.country_tag && (
              <>
                <Link
                  to={`/journal?country=${article.country_tag}`}
                  className="hover:text-airbnb-rausch transition-colors"
                >
                  {article.country_tag}
                </Link>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Контент статьи */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            {/* Основной контент */}
            <article className="prose prose-lg max-w-none">
              <ReactMarkdown components={MarkdownComponents}>
                {cleanMarkdown(article.content)}
              </ReactMarkdown>
            </article>

            {/* Теги */}
            {article.country_tag && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">Теги:</span>
                  <Link
                    to={`/journal?country=${article.country_tag}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
                  >
                    #{article.country_tag}
                  </Link>
                </div>
              </div>
            )}

            {/* Разделитель */}
            <div className="my-12 md:my-16 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <Sparkles className="text-airbnb-rausch" size={24} />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>

            {/* Призыв к действию */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-airbnb-rausch to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Готовы отправиться в путешествие?
              </h3>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Найдите идеальную экскурсию {article.country_tag ? `в ${article.country_tag}` : 'по Азии'} с местными гидами
              </p>
              <Link to={article.country_tag ? `/tours?location=${article.country_tag}` : '/tours'}>
                <Button size="lg" variant="secondary" className="bg-white text-airbnb-rausch hover:bg-gray-50 font-semibold text-lg px-8 py-6">
                  Смотреть экскурсии {article.country_tag ? `в ${article.country_tag}` : ''}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Похожие статьи */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="text-airbnb-rausch" size={28} />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Похожие статьи</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle, index) => (
                <Link to={`/journal/${relatedArticle.slug}`} key={relatedArticle.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden h-full flex flex-col group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedArticle.photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=800'}
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-airbnb-rausch transition-colors">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                        {relatedArticle.preview_text}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{relatedArticle.read_time} мин</span>
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

      <PublicFooter />
    </div>
  )
}
