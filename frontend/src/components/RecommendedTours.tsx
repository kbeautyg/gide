import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TourCard } from './TourCard'
import { toursApi } from '@/lib/api'

interface RecommendedToursProps {
  currentTourId: number
  location: string
  category: string
}

export function RecommendedTours({ currentTourId, location, category }: RecommendedToursProps) {
  const { data: toursData } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList({ page: 1, page_size: 100 }).then(res => res.data),
  })

  const tours = toursData?.tours || []

  // Логика рекомендаций: location → category → популярные
  const recommended = useMemo(() => {
    if (!tours || tours.length === 0) return []

    const allTours = tours.filter((t: any) => t.id !== currentTourId)
    const result: any[] = []
    const used = new Set<number>()

    // 1. Туры из того же города
    const sameLocation = allTours.filter((t: any) => 
      t.location === location && !used.has(t.id)
    )
    
    sameLocation.forEach((t: any) => {
      if (result.length < 6) {
        result.push(t)
        used.add(t.id)
      }
    })

    // 2. Если мало - добавить из той же категории
    if (result.length < 6) {
      const sameCategory = allTours.filter((t: any) =>
        t.category === category && !used.has(t.id)
      )
      
      sameCategory.forEach((t: any) => {
        if (result.length < 6) {
          result.push(t)
          used.add(t.id)
        }
      })
    }

    // 3. Если всё еще мало - добавить популярные (по рейтингу)
    if (result.length < 6) {
      const popular = allTours
        .filter((t: any) => !used.has(t.id))
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
      
      popular.forEach((t: any) => {
        if (result.length < 6) {
          result.push(t)
          used.add(t.id)
        }
      })
    }

    return result.slice(0, 6)
  }, [tours, currentTourId, location, category])

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

