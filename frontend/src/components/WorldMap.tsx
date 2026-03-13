import { motion } from 'framer-motion'

interface City {
  name: string
  x: number // координаты в % (0-100)
  y: number
  tours: number
}

export function WorldMap() {
  // Азиатские города с их относительными координатами
  const cities: City[] = [
    { name: 'Тбилиси', x: 45, y: 42, tours: 48 },
    { name: 'Стамбул', x: 43, y: 41, tours: 124 },
    { name: 'Дубай', x: 55, y: 52, tours: 65 },
    { name: 'Бангкок', x: 67, y: 58, tours: 89 },
    { name: 'Токио', x: 85, y: 38, tours: 105 },
    { name: 'Сеул', x: 82, y: 37, tours: 76 },
    { name: 'Бали', x: 73, y: 68, tours: 54 },
    { name: 'Пхукет', x: 65, y: 62, tours: 72 },
  ]

  return (
    <section className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-airbnb-rausch rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Исследуйте Азию с нами
          </h2>
          <p className="text-xl text-gray-300">
            Более 500 уникальных туров в лучших городах континента
          </p>
        </motion.div>

        {/* Карта */}
        <div className="relative w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Сетка */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 grid-rows-8 h-full">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>

          {/* Города */}
          {cities.map((city, index) => (
            <motion.div
              key={city.name}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: 'spring',
              }}
              style={{
                position: 'absolute',
                left: `${city.x}%`,
                top: `${city.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="group cursor-pointer"
            >
              {/* Пульсирующий круг */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-airbnb-rausch rounded-full"
              />

              {/* Основная точка */}
              <div className="relative w-4 h-4 bg-airbnb-rausch rounded-full shadow-lg group-hover:scale-150 transition-transform" />

              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
              >
                <div className="text-sm font-semibold text-gray-900">
                  {city.name}
                </div>
                <div className="text-xs text-gray-600">{city.tours} туров</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
              </motion.div>
            </motion.div>
          ))}

          {/* Декоративные линии между городами */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.1 }}
          >
            {cities.map((city, i) =>
              cities.slice(i + 1, i + 3).map((nextCity, j) => (
                <motion.line
                  key={`${i}-${j}`}
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: (i + j) * 0.1 }}
                  x1={`${city.x}%`}
                  y1={`${city.y}%`}
                  x2={`${nextCity.x}%`}
                  y2={`${nextCity.y}%`}
                  stroke="white"
                  strokeWidth="1"
                />
              ))
            )}
          </svg>
        </div>
      </div>
    </section>
  )
}

