import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

interface CityHeroProps {
  city: string
  country: string
  toursCount: number
  image?: string
}

export function CityHero({ city, country, toursCount, image }: CityHeroProps) {
  // Маппинг городов на изображения (можно вынести в отдельный файл)
  const defaultImages: Record<string, string> = {
    'Бангкок': 'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=1920&h=600&fit=crop',
    'Пхукет': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1920&h=600&fit=crop',
    'Токио': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&h=600&fit=crop',
    'Дубай': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&h=600&fit=crop',
    'Киото': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=600&fit=crop',
    'Сеул': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1920&h=600&fit=crop',
    'Убуд': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&h=600&fit=crop',
    'Ханой': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&h=600&fit=crop',
    'Сингапур': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&h=600&fit=crop',
    'Осака': 'https://images.unsplash.com/photo-1590253230532-a67f6bc61c9e?w=1920&h=600&fit=crop',
    'Семиньяк': 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=1920&h=600&fit=crop',
    'Хошимин': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&h=600&fit=crop',
  }

  const heroImage = image || defaultImages[city] || 'https://images.unsplash.com/photo-1488646953014-85cb44e24d5e?w=1920&h=600&fit=crop'

  return (
    <section className="relative h-[400px] overflow-hidden">
      <motion.img
        src={heroImage}
        alt={city}
        className="w-full h-full object-cover"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0">
        <div className="container mx-auto px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-white/90 mb-3">
              <MapPin size={20} />
              <span className="text-lg">{country}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Экскурсии в {city}
            </h1>
            <p className="text-xl text-white/90">
              {toursCount} {toursCount === 1 ? 'экскурсия' : toursCount < 5 ? 'экскурсии' : 'экскурсий'} на русском языке
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

