import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Calendar } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'

export default function JournalPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  // Mock статьи
  const articles = [
    {
      id: 1,
      title: 'Как добраться до Китайской стены: поездка из Пекина',
      slug: 'kak-dobratsya-do-kitayskoy-steny',
      preview: 'Удобные маршруты к популярным участкам',
      photo: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop',
      readTime: 10,
      publishedAt: '20 авг',
      countryTag: 'Китай'
    },
    {
      id: 2,
      title: 'Древние храмы Египта: где увидеть наследие фараонов',
      slug: 'drevnie-hramy-egipta',
      preview: 'От монументального Карнака до затерянного в песках Абу-Симбела',
      photo: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&h=600&fit=crop',
      readTime: 14,
      publishedAt: '10 сен',
      countryTag: 'Египет'
    },
    {
      id: 3,
      title: 'Плёс: всё о городе живописных пейзажей',
      slug: 'plyos-gorod',
      preview: 'Где искать лучшие виды, попробовать деликатесы и узнать о прошлом',
      photo: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop',
      readTime: 15,
      publishedAt: '22 авг',
      countryTag: 'Россия'
    },
    {
      id: 4,
      title: 'Уральские горы: всё о каменном поясе России',
      slug: 'uralskie-gory',
      preview: 'Где искать высочайшие вершины и что выбрать для первого знакомства',
      photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      readTime: 12,
      publishedAt: '27 авг',
      countryTag: 'Россия'
    },
    {
      id: 5,
      title: 'Пляжи Стамбула: лучшие места для отдыха',
      slug: 'plyazhi-stambula',
      preview: 'Городские и пригородные локации на Чёрном и Мраморном морях',
      photo: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop',
      readTime: 11,
      publishedAt: '14 авг',
      countryTag: 'Турция'
    },
    {
      id: 6,
      title: 'Едем в Марокко: чем удивит эта страна',
      slug: 'edem-v-marokko',
      preview: 'Старинные мечети, дюны Сахары и бескрайнее побережье Атлантики',
      photo: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&h=600&fit=crop',
      readTime: 24,
      publishedAt: '4 сен',
      countryTag: 'Марокко'
    },
  ]

  const countries = Array.from(new Set(articles.map(a => a.countryTag)))
  
  const filteredArticles = selectedCountry
    ? articles.filter(a => a.countryTag === selectedCountry)
    : articles

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero - минималистичный */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Журнал путешествий
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Вдохновляем на путешествия: советы, гайды и истории от местных экспертов
          </p>
        </div>
      </section>

      {/* Фильтры по странам */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCountry(null)}
              className={`px-4 py-2 rounded-full shrink-0 transition-all ${
                !selectedCountry
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Все статьи
            </button>
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-4 py-2 rounded-full shrink-0 transition-all ${
                  selectedCountry === country
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                #{country}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Популярные статьи */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Популярные статьи</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/journal/${article.slug}`}>
                  <article className="group cursor-pointer">
                    <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4">
                      <img
                        src={article.photo}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-airbnb-rausch transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {article.preview}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>Читать {article.readTime} минут</span>
                      </div>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{article.publishedAt}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="inline-block text-sm text-airbnb-babu">
                        #{article.countryTag}
                      </span>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

