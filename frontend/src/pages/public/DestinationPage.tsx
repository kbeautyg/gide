import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CityHero } from '@/components/CityHero'
import { getCountryName } from '@/lib/urlSlugs'
import { buildExperienceUrl } from '@/lib/routing'
import { api } from '@/lib/api'

/**
 * Страница страны (DestinationPage)
 * URL: /destinations/:countrySlug
 * Пример: /destinations/thailand
 */
export default function DestinationPage() {
  const { countrySlug } = useParams<{ countrySlug: string }>()
  
  // Получаем название страны из slug
  const countryName = countrySlug ? getCountryName(countrySlug) : null
  
  // Загрузка информации о стране
  const { data: countryInfo } = useQuery({
    queryKey: ['country-info', countrySlug],
    queryFn: () => {
      if (!countrySlug) return null
      return api.get(`/destinations/${countrySlug}/info`).then(res => res.data)
    },
    enabled: !!countrySlug,
  })
  
  // Загрузка туров страны
  const { data: toursData } = useQuery({
    queryKey: ['country-tours', countryName],
    queryFn: () => {
      if (!countryName) return null
      return api.get(`/tours?location=${encodeURIComponent(countryName)}&page_size=12`).then(res => res.data)
    },
    enabled: !!countryName,
  })
  
  const cities = countryInfo?.cities || []
  const tours = toursData?.tours || []
  
  if (!countryName) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Страна не найдена</h1>
        </div>
        <PublicFooter />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <PublicHeader />
      
      {/* CityHero для страны */}
      <CityHero 
        country={countryName}
        toursCount={countryInfo?.tours_count || 0}
      />
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: countryName }]} />
      
      {/* Основной контент */}
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Экскурсии в {countryName}
          </h1>
          <p className="text-gray-600">
            {countryInfo?.tours_count || 0} {countryInfo?.tours_count === 1 ? 'экскурсия' : countryInfo?.tours_count < 5 ? 'экскурсии' : 'экскурсий'} • {cities.length} {cities.length === 1 ? 'город' : cities.length < 5 ? 'города' : 'городов'}
          </p>
        </div>
        
        {/* Список городов */}
        {cities.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Города</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cities.map((city: any, index: number) => (
                <motion.div
                  key={city.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={buildExperienceUrl(city.name)}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-[4/3] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl">🏙️</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-airbnb-rausch transition-colors">
                          {city.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {city.tours_count} {city.tours_count === 1 ? 'экскурсия' : city.tours_count < 5 ? 'экскурсии' : 'экскурсий'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
        
        {/* Популярные туры */}
        {tours.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Популярные экскурсии</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.slice(0, 6).map((tour: any) => (
                <Link
                  key={tour.id}
                  to={`/tours/${tour.id}`}
                  className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    {tour.photos && tour.photos.length > 0 ? (
                      <img
                        src={tour.photos[0]}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                        <span className="text-4xl">📸</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {tour.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-airbnb-rausch font-bold">
                        {tour.discount_price ? (
                          <>
                            <span className="line-through text-gray-400 text-sm mr-2">{tour.price}₽</span>
                            {tour.discount_price}₽
                          </>
                        ) : (
                          `${tour.price}₽`
                        )}
                      </span>
                      {tour.rating && (
                        <span className="text-sm text-gray-600">
                          ⭐ {tour.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      
      <PublicFooter />
    </div>
  )
}
