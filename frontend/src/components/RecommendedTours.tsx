import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TourCard } from './TourCard'
import { api } from '@/lib/api'

interface RecommendedToursProps {
  currentTourId: number
  location: string
  category: string
}

export function RecommendedTours({ currentTourId }: RecommendedToursProps) {
  // Используем новый endpoint для получения похожих туров
  const { data: recommendationsData } = useQuery({
    queryKey: ['tour-recommendations', currentTourId],
    queryFn: () => api.get(`/tours/${currentTourId}/recommendations`).then((res: any) => res.data),
  })

  const recommended = recommendationsData?.tours || []

  if (recommended.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Вам также может понравиться
        </h2>
        
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
          {recommended.map((tour: any) => (
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
      </div>
    </section>
  )
}

