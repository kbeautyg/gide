import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, Calendar, ArrowLeft } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { Button } from '@/components/ui/button'
import { TourCard } from '@/components/TourCard'
import { toursApi } from '@/lib/api'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()

  // База статей (та же что в JournalPage)
  const articlesDatabase: Record<string, any> = {
    'plyazhi-phuketa': {
      title: '10 лучших пляжей Пхукета: от Патонга до секретных бухт',
      preview: 'Откройте для себя райские уголки острова',
      photo: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1920&h=800&fit=crop',
      readTime: 12,
      publishedAt: '15 октября 2025',
      countryTag: 'Таиланд',
      location: 'Пхукет, Таиланд',
      content: `
Пхукет — крупнейший остров Таиланда, известный своими великолепными пляжами с белым песком и бирюзовой водой. В этом гиде мы расскажем о лучших пляжах острова.

## 1. Патонг — сердце ночной жизни

Самый популярный и оживлённый пляж Пхукета. Идеален для тех, кто любит активный отдых, шопинг и ночные развлечения.

**Что здесь делать:**
- Водные виды спорта
- Ночные клубы и бары
- Магазины и рестораны
- Наблюдать за закатами

## 2. Карон — для семейного отдыха

Более спокойная альтернатива Патонгу с чистым песком и пологим входом в море.

## 3. Ката Ной — для серфинга

Небольшая бухта с отличными волнами для серфинга в сезон дождей.

## 4. Freedom Beach — райский уголок

Секретный пляж, доступный только на лодке. Кристально чистая вода и никаких толп туристов.

**Как добраться:** на лонгтейл боте от Патонга (400-500 бат)

## 5. Най Харн — для снорклинга

Живописная бухта на юге острова с коралловыми рифами.

## Советы путешественникам

1. Лучшее время для посещения: ноябрь-апрель (сухой сезон)
2. Арендуйте байк для перемещения между пляжами
3. Используйте солнцезащитный крем — солнце очень активное
4. Пробуйте местную еду на пляжах — вкусно и недорого
      `
    },
    'ulichnaya-eda-bangkoka': {
      title: 'Уличная еда Бангкока: гид по лучшим рынкам',
      preview: 'Погружение в гастрономическую культуру столицы Таиланда',
      photo: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1920&h=800&fit=crop',
      readTime: 8,
      publishedAt: '12 октября 2025',
      countryTag: 'Таиланд',
      location: 'Бангкок, Таиланд',
      content: `
Бангкок — мировая столица уличной еды. Здесь можно попробовать сотни блюд традиционной тайской кухни за копейки.

## Yaowarat Road (Чайнатаун)

Легендарная улица с лучшей уличной едой в городе.

**Что попробовать:**
- Pad Thai от уличных поваров
- Свежие морепродукты на гриле
- Манго с липким рисом
- Жареные каштаны

## Or Tor Kor Market

Один из лучших продуктовых рынков Азии по версии CNN.

## Rot Fai Market

Винтажный ночной рынок с ретро-атмосферой и отличной едой.

## Khao San Road

Туристическая Мекка с огромным выбором еды на любой вкус.

## Советы

1. Ешьте там, где едят местные
2. Не бойтесь экспериментировать
3. Начинайте с небольших порций
4. Всегда имейте при себе наличные
5. Пик активности рынков — после 18:00
      `
    }
  }

  const article = articlesDatabase[slug || ''] || articlesDatabase['plyazhi-phuketa']

  // Загрузка туров по локации
  const { data: toursData } = useQuery({
    queryKey: ['related-tours', article.location],
    queryFn: async () => {
      if (!article.location) return { tours: [] }
      const response = await toursApi.getList({
        page: 1,
        page_size: 3,
        location: article.location.split(',')[0].trim(),
      })
      return response.data
    },
    enabled: !!article.location,
  })

  const relatedTours = toursData?.tours || []

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero с фото */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={article.photo}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4 pb-12">
            <Link to="/journal">
              <Button variant="secondary" size="sm" className="mb-6 bg-white/90 hover:bg-white">
                <ArrowLeft className="mr-2" size={16} />
                Назад к журналу
              </Button>
            </Link>
            
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 text-white/90 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>Читать {article.readTime} минут</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{article.publishedAt}</span>
                </div>
                <span>·</span>
                <span className="text-airbnb-babu">#{article.countryTag}</span>
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-4">
                {article.title}
              </h1>
              <p className="text-xl text-white/90">
                {article.preview}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Контент статьи */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n\n').map((paragraph: string, i: number) => {
              if (paragraph.startsWith('##')) {
                return (
                  <h2 key={i} className="text-3xl font-bold text-gray-900 mt-12 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                )
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <p key={i} className="font-semibold text-gray-900 my-4">
                    {paragraph.replace(/\*\*/g, '')}
                  </p>
                )
              }
              if (paragraph.startsWith('-')) {
                const items = paragraph.split('\n')
                return (
                  <ul key={i} className="space-y-2 my-6 ml-6">
                    {items.map((item: string, j: number) => (
                      <li key={j} className="text-gray-700">
                        {item.replace('- ', '')}
                      </li>
                    ))}
                  </ul>
                )
              }
              if (paragraph.match(/^\d+\./)) {
                const items = paragraph.split('\n')
                return (
                  <ol key={i} className="space-y-2 my-6 ml-6 list-decimal">
                    {items.map((item: string, j: number) => (
                      <li key={j} className="text-gray-700">
                        {item.replace(/^\d+\.\s/, '')}
                      </li>
                    ))}
                  </ol>
                )
              }
              return (
                <p key={i} className="text-gray-700 leading-relaxed my-6">
                  {paragraph}
                </p>
              )
            })}
          </div>

          {/* Связанные экскурсии */}
          {relatedTours.length > 0 && (
            <div className="mt-16 pt-16 border-t">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Экскурсии в {article.location?.split(',')[0]}
                </h2>
                <Link 
                  to={`/tours?location=${encodeURIComponent(article.location?.split(',')[0] || article.countryTag)}`}
                  className="text-airbnb-rausch hover:underline font-medium flex items-center gap-2"
                >
                  Смотреть все <ArrowLeft className="rotate-180" size={16} />
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedTours.map((tour: any) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}

