import { motion } from 'framer-motion'
import { Users, MapPin, Star, TrendingUp } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'

export function LiveStats() {
  const stats = [
    {
      icon: Users,
      value: 10000,
      suffix: '+',
      label: 'Счастливых туристов',
      color: 'text-blue-500'
    },
    {
      icon: MapPin,
      value: 50,
      suffix: '+',
      label: 'Городов Азии',
      color: 'text-green-500'
    },
    {
      icon: Star,
      value: 4.9,
      decimals: 1,
      label: 'Средний рейтинг',
      color: 'text-yellow-500'
    },
    {
      icon: TrendingUp,
      value: 500,
      suffix: '+',
      label: 'Уникальных туров',
      color: 'text-airbnb-rausch'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Нам доверяют тысячи путешественников
          </h2>
          <p className="text-xl text-gray-600">
            Каждый день мы создаем незабываемые впечатления
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all"
            >
              <motion.div
                initial={{ rotate: 0 }}
                whileInView={{ rotate: 360 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`inline-block p-4 rounded-full bg-gray-50 mb-4 ${stat.color}`}
              >
                <stat.icon size={32} />
              </motion.div>

              <div className="text-5xl font-black text-gray-900 mb-2">
                <AnimatedCounter 
                  end={stat.value} 
                  suffix={stat.suffix || ''}
                  decimals={stat.decimals || 0}
                  duration={2.5}
                />
              </div>

              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

