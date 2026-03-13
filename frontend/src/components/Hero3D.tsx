import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SearchBar } from './SearchBar'

// 3D объекты для случайного выбора
const OBJECTS_3D = [
  {
    emoji: '🍜',
    name: 'food',
    gradient: 'from-orange-400 to-red-500',
    size: 'text-9xl'
  },
  {
    emoji: '🗿',
    name: 'statue',
    gradient: 'from-gray-400 to-gray-600',
    size: 'text-9xl'
  },
  {
    emoji: '🗺️',
    name: 'map',
    gradient: 'from-blue-400 to-cyan-500',
    size: 'text-9xl'
  },
  {
    emoji: '🏯',
    name: 'temple',
    gradient: 'from-purple-400 to-pink-500',
    size: 'text-9xl'
  },
  {
    emoji: '🎭',
    name: 'mask',
    gradient: 'from-indigo-400 to-purple-500',
    size: 'text-9xl'
  },
  {
    emoji: '🏔️',
    name: 'mountain',
    gradient: 'from-green-400 to-emerald-600',
    size: 'text-9xl'
  },
]

export function Hero3D() {
  const [selectedObjects, setSelectedObjects] = useState<typeof OBJECTS_3D>([])

  // Случайный выбор 3 объектов при монтировании
  useEffect(() => {
    const shuffled = [...OBJECTS_3D].sort(() => Math.random() - 0.5)
    setSelectedObjects(shuffled.slice(0, 3))
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            borderRadius: ['30%', '50%', '30%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-airbnb-rausch/30 to-purple-500/30 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            borderRadius: ['50%', '30%', '50%']
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            y: [0, -100, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-orange-500/20 blur-3xl"
        />
      </div>

      {/* Search bar - sticky под header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <SearchBar variant="sticky" />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          {/* Left - 3D Objects */}
          <div className="relative h-full flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-lg">
              {selectedObjects.map((obj, index) => (
                <motion.div
                  key={obj.name}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: 0,
                  }}
                  transition={{ 
                    duration: 1, 
                    delay: index * 0.2,
                    type: 'spring',
                    stiffness: 100
                  }}
                  whileHover={{
                    scale: 1.2,
                    rotate: 15,
                    z: 50,
                    transition: { duration: 0.3 }
                  }}
                  className={`absolute ${obj.size} cursor-pointer`}
                  style={{
                    left: index === 0 ? '10%' : index === 1 ? '50%' : '70%',
                    top: index === 0 ? '20%' : index === 1 ? '60%' : '30%',
                    transform: 'translateZ(0)',
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                  }}
                >
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 4 + index,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    {obj.emoji}
                  </motion.div>
                </motion.div>
              ))}

              {/* Decorative circles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  className={`absolute w-32 h-32 rounded-full border-2 border-white/20`}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + i * 20}%`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right - Text content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white space-y-8"
          >
            <div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-2xl md:text-3xl font-semibold mb-4 text-white/90"
              >
                Путешествуйте как местный житель
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-lg md:text-xl text-white/80 leading-relaxed"
              >
                Авторские экскурсии по Азии от профессиональных гидов
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="grid grid-cols-3 gap-6"
            >
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-white/70">Туров</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-white/70">Городов</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="text-sm text-white/70">Рейтинг</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="flex gap-4"
            >
              <button className="px-8 py-4 bg-airbnb-rausch text-white rounded-full font-semibold hover:bg-airbnb-rausch/90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                Найти экскурсию
              </button>
              <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30">
                Стать гидом
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 2 },
          y: { duration: 1.5, repeat: Infinity }
        }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-sm flex flex-col items-center gap-2"
      >
        <div>Прокрутите вниз</div>
        <div className="w-6 h-10 border-2 border-white/40 rounded-full p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-white/60 rounded-full mx-auto"
          />
        </div>
      </motion.div>
    </div>
  )
}

