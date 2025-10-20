import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { TourCard } from './TourCard'
import { TourCardSkeleton } from './TourCardSkeleton'
import { Sparkles, Users } from 'lucide-react'

interface SmartRecommendationsProps {
  tourId?: number
  userId?: number
  location?: string
  limit?: number
  title?: string
  showAlgorithm?: boolean
}

export function SmartRecommendations({ 
  tourId, 
  userId, 
  location, 
  limit = 6,
  title,
  showAlgorithm = false
}: SmartRecommendationsProps) {
  // Умные рекомендации
  const { data: smartData, isLoading: smartLoading } = useQuery({
    queryKey: ['smart-recommendations', tourId, userId, location, limit],
    queryFn: () => {
      const params = new URLSearchParams()
      if (tourId) params.append('tour_id', tourId.toString())
      if (userId) params.append('user_id', userId.toString())
      if (location) params.append('location', location)
      params.append('limit', limit.toString())
      
      return api.get(`/tours/smart-recommendations?${params.toString()}`).then(res => res.data)
    },
  })

  // Collaborative filtering (если указан tourId)
  const { data: collaborativeData, isLoading: collaborativeLoading } = useQuery({
    queryKey: ['collaborative-recommendations', tourId, limit],
    queryFn: () => api.get(`/tours/collaborative-recommendations/${tourId}?limit=${limit}`).then(res => res.data),
    enabled: !!tourId,
  })

  const smartTours = smartData?.tours || []
  const collaborativeTours = collaborativeData?.tours || []
  
  // Комбинируем рекомендации (убираем дубликаты)
  const allTours = tourId 
    ? [...smartTours, ...collaborativeTours.filter((ct: any) => !smartTours.find((st: any) => st.id === ct.id))]
    : smartTours
  
  const displayTours = allTours.slice(0, limit)

  if (smartLoading || (tourId && collaborativeLoading)) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {title || 'Рекомендуем для вас'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <TourCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (displayTours.length === 0) {
    return null
  }

  const getTitle = () => {
    if (title) return title
    if (tourId) return 'Похожие экскурсии'
    if (userId) return 'Персональные рекомендации'
    if (location) return `Популярное в ${location}`
    return 'Рекомендуем для вас'
  }

  const getIcon = () => {
    if (collaborativeTours.length > 0) {
      return <Users className="text-airbnb-rausch" size={28} />
    }
    return <Sparkles className="text-airbnb-rausch" size={28} />
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          {getIcon()}
          <h2 className="text-3xl font-bold text-gray-900">
            {getTitle()}
          </h2>
        </div>
        
        {showAlgorithm && (
          <p className="text-sm text-gray-600 mb-6">
            {smartData?.algorithm === 'smart_recommendations' && '🧠 На основе умного алгоритма подбора'}
            {collaborativeData && ' • 👥 Что заказывали другие пользователи'}
          </p>
        )}
        
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {displayTours.map((tour: any, index: number) => (
            <motion.div
              key={tour.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <TourCard tour={tour} />
            </motion.div>
          ))}
        </motion.div>

        {collaborativeTours.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 italic">
              💡 {collaborativeData?.message || 'Пользователи, которые заказывали похожие туры, также интересовались этими'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}


