import { Link } from 'react-router-dom'
import { Clock, Calendar, ArrowLeft } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { Button } from '@/components/ui/button'

export default function ArticlePage() {

  // Mock статья
  const article = {
    title: 'Как добраться до Китайской стены: поездка из Пекина',
    preview: 'Удобные маршруты к популярным участкам',
    photo: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&h=800&fit=crop',
    readTime: 10,
    publishedAt: '20 августа 2025',
    countryTag: 'Китай',
    content: `
      Великая Китайская стена — одна из самых известных достопримечательностей мира. 
      Это грандиозное сооружение протянулось на тысячи километров через горы и долины северного Китая.
      
      В этой статье мы расскажем о лучших способах добраться до самых популярных участков стены из Пекина.
      
      ## Участок Мутяньюй
      
      Мутяньюй — один из наиболее хорошо сохранившихся и живописных участков стены. 
      Он находится в 70 км от Пекина и идеально подходит для первого знакомства.
      
      **Как добраться:**
      - На автобусе: от станции Dongzhimen до Huairou (2 часа), затем такси
      - На туристическом автобусе: прямые рейсы от центра Пекина
      - На такси: ~600-800 юаней в обе стороны
      - С экскурсией: удобно и информативно
      
      ## Участок Бадалин
      
      Бадалин — самый популярный и доступный участок, но часто очень многолюдный.
      
      **Преимущества:**
      - Отличная транспортная доступность
      - Развитая инфраструктура
      - Можно совместить с посещением гробниц династии Мин
      
      ## Советы путешественникам
      
      1. Приезжайте рано утром (до 9:00), чтобы избежать толп
      2. Возьмите с собой воду и перекус
      3. Наденьте удобную обувь — будет много подъёмов
      4. Не забудьте солнцезащитный крем
      5. Лучшее время для посещения — весна и осень
    `
  }

  // Mock похожие туры
  const relatedTours = [
    { id: 1, title: 'Визитные карточки Пекина + Великая Китайская стена', location: 'Пекин' },
    { id: 2, title: 'Запретный город и чайная церемония', location: 'Пекин' },
  ]

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
            {article.content.split('\n\n').map((paragraph, i) => {
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
                    {items.map((item, j) => (
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
                    {items.map((item, j) => (
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
          <div className="mt-16 pt-16 border-t">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Экскурсии в {article.countryTag}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedTours.map((tour) => (
                <div key={tour.id} className="skeleton rounded-xl h-[360px]" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}

