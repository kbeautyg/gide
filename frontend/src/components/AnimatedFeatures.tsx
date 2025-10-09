import { motion } from 'framer-motion'
import { Shield, Clock, HeartHandshake, Award, MapPin, Sparkles } from 'lucide-react'

export function AnimatedFeatures() {
  const features = [
    {
      icon: Shield,
      title: 'Безопасность',
      description: 'Все гиды проверены и застрахованы',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Clock,
      title: 'Гибкое время',
      description: 'Выбирайте удобное время начала',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: HeartHandshake,
      title: 'Индивидуальный подход',
      description: 'Персональные маршруты под вас',
      color: 'text-airbnb-rausch',
      bgColor: 'bg-red-50',
    },
    {
      icon: Award,
      title: 'Лучшие гиды',
      description: 'Рейтинг 4.9+ от тысяч туристов',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: MapPin,
      title: 'Вся Азия',
      description: '50+ городов в 12 странах',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Sparkles,
      title: 'Только лучшее',
      description: 'Отобранные впечатления',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Почему выбирают Turex Pro
          </h2>
          <p className="text-xl text-gray-600">
            Мы создаем незабываемые впечатления каждый день
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative p-8 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all"
            >
              {/* Анимированная иконка */}
              <motion.div
                initial={{ rotate: 0, scale: 1 }}
                whileInView={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  repeat: 0,
                }}
                whileHover={{
                  rotate: 360,
                  transition: { duration: 0.6 },
                }}
                className={`inline-flex p-4 rounded-2xl ${feature.bgColor} ${feature.color} mb-4`}
              >
                <feature.icon size={32} strokeWidth={2} />
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-600">{feature.description}</p>

              {/* Декоративный элемент */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`absolute bottom-0 left-0 h-1 ${feature.color.replace('text', 'bg')}`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

