import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { TourCard } from '@/components/TourCard'
import { toursApi } from '@/lib/api'

export default function DestinationPage() {
  const { city } = useParams<{ city: string }>()

  // Mock данные для направления
  const destination = {
    name: city || 'Тбилиси',
    country: 'Грузия',
    photo: 'https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=1920&h=600&fit=crop',
    description: 'Столица Грузии — это город с богатой историей',
    toursCount: 480,
  }

  // Mock достопримечательности
  const landmarks = [
    { name: 'Серные бани', photo: 'https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300&h=200&fit=crop', count: 77 },
    { name: 'Крепость Нарикала', photo: 'https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300&h=200&fit=crop', count: 53 },
    { name: 'Площадь Свободы', photo: 'https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300&h=200&fit=crop', count: 50 },
    { name: 'Мост Мира', photo: 'https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300&h=200&fit=crop', count: 50 },
    { name: 'Военно-Грузинская дорога', photo: 'https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300&h=200&fit=crop', count: 47 },
    { name: 'Крепость Ананури', photo: 'https://images.unsplash.com/photo-1597079858949-19881cff2e1d?w=300&h=200&fit=crop', count: 43 },
  ]

  // Mock гиды
  const guides = [
    { name: 'Мария', photo: 'https://i.pravatar.cc/150?img=1', rating: 4.95, toursCount: 24 },
    { name: 'Арчи', photo: 'https://i.pravatar.cc/150?img=33', rating: 4.98, toursCount: 18 },
    { name: 'Тамара', photo: 'https://i.pravatar.cc/150?img=5', rating: 4.92, toursCount: 31 },
    { name: 'Георгий', photo: 'https://i.pravatar.cc/150?img=12', rating: 4.99, toursCount: 15 },
  ]

  // Загрузка туров
  const { data: toursData } = useQuery({
    queryKey: ['tours', city],
    queryFn: () => toursApi.getList({ location: city, page: 1, page_size: 8 }),
  })

  const tours = toursData?.data?.tours || []

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={destination.photo}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4 pb-12">
            <h1 className="text-5xl font-bold text-white mb-3">
              Экскурсии в {destination.name}
            </h1>
            <p className="text-xl text-white/90">
              {destination.toursCount} необычных экскурсий на русском языке
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <Link to="/" className="hover:underline">Главная</Link>
            {' > '}
            <span className="text-gray-900 font-medium">{destination.country}</span>
            {' > '}
            <span className="text-gray-900 font-medium">{destination.name}</span>
          </div>
        </div>
      </div>

      {/* Достопримечательности */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Достопримечательности в {destination.name}
          </h2>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {landmarks.slice(landmarkIndex, landmarkIndex + 6).map((landmark, i) => (
                <motion.div
                  key={i}
                  className="shrink-0 w-[200px]"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/tours?landmark=${landmark.name}`}>
                    <div className="group cursor-pointer">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                        <img
                          src={landmark.photo}
                          alt={landmark.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">{landmark.name}</div>
                      <div className="text-xs text-gray-600">{landmark.count} экскурсий</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Экскурсии */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Популярные экскурсии
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>

          {tours.length === 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton rounded-xl h-[380px]" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Частные гиды */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Частные гиды в {destination.name}
            </h2>
            <Link to={`/guides/${city}`}>
              <Button variant="outline" className="rounded-full">
                Все гиды
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-xl p-6 shadow-airbnb hover:shadow-airbnb-hover transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <img
                  src={guide.photo}
                  alt={guide.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <div className="text-center">
                  <div className="font-semibold text-gray-900 mb-2">{guide.name}</div>
                  <div className="flex items-center justify-center gap-1 text-sm mb-1">
                    <Star size={14} className="fill-gray-900 text-gray-900" />
                    <span className="font-semibold">{guide.rating}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {guide.toursCount} экскурсий
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO блок */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Экскурсии в {destination.name}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {destination.description} — это город с богатой историей, о которой наши гиды 
              в {destination.name} с удовольствием расскажут. Экскурсии, представленные на нашем сайте, — 
              это прогулки с местными жителями, творческими и разносторонними людьми, 
              что делает их экскурсии по-настоящему интересными.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Люди, живущие здесь, с любовью и трепетом относятся к городу, поэтому во время 
              экскурсии в {destination.name} вы не услышите сухих заученных фактов. 
              Вас ждут искренние истории о жизни города, его традициях и культуре.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

