import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Landmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { buildToursLink } from '@/lib/navigationUtils'
import { useRef, useState, useEffect } from 'react'

interface LandmarksSectionProps {
  location?: string
}

export function LandmarksSection({ location }: LandmarksSectionProps) {
  // Загружаем достопримечательности с реальным подсчетом из API
  // Если location не указан, загружаем все достопримечательности (ранжированные)
  const { data: landmarksData, isLoading } = useQuery({
    queryKey: ['landmarks', location || 'all'],
    queryFn: () => {
      const url = location 
        ? `/destinations/landmarks-with-counts?location=${encodeURIComponent(location)}`
        : '/destinations/landmarks-with-counts'
      return api.get(url).then(res => res.data)
    },
  })

  const landmarks = landmarksData?.landmarks || []
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current
    if (!container) return
    
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollButtons()
    container.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)

    return () => {
      container.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [landmarks])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 400 // Прокрутка на 400px
    const scrollTo = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    })
  }

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Достопримечательности
          </h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[200px]">
                <div className="aspect-[4/3] rounded-xl bg-gray-200 animate-pulse mb-3" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!landmarks.length) {
    return null
  }

  // Маппинг достопримечательностей на изображения (можно расширить)
  const landmarkImages: Record<string, string> = {
    'Храм Ват Арун': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&h=300&fit=crop',
    'Плавучий рынок': 'https://images.unsplash.com/photo-1604935371878-e8e3a3c6f6b7?w=400&h=300&fit=crop',
    'Большой дворец': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&h=300&fit=crop',
    'Пляж Патонг': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=300&fit=crop',
    'Храм Ват Чалонг': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop',
    'Золотой павильон': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
    'Бамбуковый лес': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop',
    'Храм Фусими Инари': 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop',
    'Рисовые террасы Тегаллаланг': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop',
    'Лес обезьян': 'https://images.unsplash.com/photo-1558005530-a7958896e52f?w=400&h=300&fit=crop',
  }

  const getDefaultImage = (name: string) => {
    return landmarkImages[name] || 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=400&h=300&fit=crop'
  }

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Landmark className="text-airbnb-rausch" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Достопримечательности{location ? ` в ${location}` : ''}
          </h2>
        </div>

        <div className="relative">
          {/* Кнопка прокрутки влево */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Прокрутить влево"
            >
              <ChevronLeft size={24} className="text-gray-900" />
            </button>
          )}

          {/* Кнопка прокрутки вправо */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Прокрутить вправо"
            >
              <ChevronRight size={24} className="text-gray-900" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {landmarks.slice(0, 12).map((landmark: any, i: number) => (
              <motion.div
                key={landmark.name}
                className="shrink-0 w-[200px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={buildToursLink({ location, landmarks: landmark.name })}>
                  <div className="group cursor-pointer">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow bg-gray-100">
                      <img
                        src={getDefaultImage(landmark.name)}
                        alt={landmark.name}
                        className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-airbnb-rausch transition-colors">
                      {landmark.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {landmark.tours_count} {landmark.tours_count === 1 ? 'экскурсия' : landmark.tours_count < 5 ? 'экскурсии' : 'экскурсий'}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {/* Градиент справа для индикации прокрутки */}
          <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}