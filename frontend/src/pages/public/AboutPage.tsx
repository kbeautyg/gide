import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Users, MapPin, Star, Heart, Shield, Rocket, Target, Zap, Globe, TrendingUp, Sparkles, Award, Lock, Clock, HeadphonesIcon, BadgeCheck, FileCheck, CreditCard, Phone } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { TiltCard } from '@/components/TiltCard'

export default function AboutPage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3])

  // Timeline данные
  const timeline = [
    { year: '2020', title: 'Основание', description: 'Началось с мечты показать Азию по-новому', icon: Rocket, color: 'text-blue-500', bg: 'bg-blue-50' },
    { year: '2021', title: 'Рост', description: '100+ гидов присоединились к платформе', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { year: '2023', title: 'Экспансия', description: 'Охват 50+ городов по всей Азии', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-50' },
    { year: '2025', title: 'Лидерство', description: '10,000+ счастливых путешественников', icon: Sparkles, color: 'text-airbnb-rausch', bg: 'bg-red-50' },
  ]

  // Команда
  const team = [
    { name: 'Анна Иванова', role: 'CEO & Founder', photo: 'https://i.pravatar.cc/300?img=1', bio: 'Создала Turex Pro после 10 лет работы в туризме' },
    { name: 'Михаил Петров', role: 'Head of Operations', photo: 'https://i.pravatar.cc/300?img=33', bio: 'Обеспечивает безупречную работу платформы' },
    { name: 'Елена Сидорова', role: 'Community Manager', photo: 'https://i.pravatar.cc/300?img=5', bio: 'Заботится о счастье наших гидов и туристов' },
  ]

  // Ценности
  const values = [
    { icon: Star, title: 'Качество превыше всего', description: 'Мы не идем на компромиссы', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { icon: Heart, title: 'Любовь к путешествиям', description: 'Это наша страсть', color: 'text-red-500', bg: 'bg-red-50' },
    { icon: Shield, title: 'Безопасность', description: 'Ваше спокойствие - наша гарантия', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Target, title: 'Фокус на клиенте', description: 'Вы в центре всего', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Zap, title: 'Инновации', description: 'Всегда идем вперед', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Users, title: 'Командная работа', description: 'Вместе мы сильнее', color: 'text-pink-500', bg: 'bg-pink-50' },
  ]

  // Гарантии и преимущества
  const guarantees = [
    { icon: Shield, title: 'Проверенные гиды', description: 'Все гиды проходят верификацию и имеют лицензии', color: 'text-blue-600' },
    { icon: CreditCard, title: 'Безопасные платежи', description: 'Защищенные транзакции и гарантия возврата', color: 'text-green-600' },
    { icon: HeadphonesIcon, title: 'Поддержка 24/7', description: 'Всегда на связи в любое время суток', color: 'text-purple-600' },
    { icon: BadgeCheck, title: 'Гарантия качества', description: 'Возврат денег, если тур не оправдал ожиданий', color: 'text-airbnb-rausch' },
    { icon: Lock, title: 'Защита данных', description: 'Ваши личные данные под надежной защитой', color: 'text-orange-600' },
    { icon: Clock, title: 'Гибкая отмена', description: 'Бесплатная отмена за 24 часа до начала тура', color: 'text-teal-600' },
  ]

  // Сертификаты и лицензии
  const certifications = [
    { title: 'Лицензия туроператора', number: 'РТО 123456', year: '2020' },
    { title: 'Член Российского союза туриндустрии', number: 'РСТ-7890', year: '2021' },
    { title: 'Сертификат ISO 9001', number: 'ISO-2023-456', year: '2023' },
    { title: 'Страхование ответственности', number: 'СО-2024-789', year: '2024' },
  ]

  // Партнеры
  const partners = [
    'Visa', 'Mastercard', 'МИР', 'PayPal', 'Сбербанк', 'Тинькофф'
  ]

  // Отзывы клиентов
  const testimonials = [
    { name: 'Мария К.', city: 'Москва', rating: 5, text: 'Незабываемый опыт! Гид показал такие места, которые я никогда не нашла бы сама. Профессионально, интересно, безопасно.', tour: 'Бангкок: секретные места' },
    { name: 'Дмитрий П.', city: 'Санкт-Петербург', rating: 5, text: 'Отличная организация! Все четко, вовремя, гид был очень компетентным. Рекомендую всем!', tour: 'Токио: культурное погружение' },
    { name: 'Анна С.', city: 'Екатеринбург', rating: 5, text: 'Лучший сервис! Поддержка помогла даже ночью, когда возникли вопросы. Чувствовала себя в безопасности.', tour: 'Пхукет: островные приключения' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero - Parallax эффект */}
      <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920')] bg-cover bg-center opacity-20" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center text-white px-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Sparkles size={64} className="text-airbnb-rausch" />
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-airbnb-rausch to-white bg-clip-text text-transparent">
            Turex Pro
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 max-w-3xl mx-auto font-light mb-8">
            Мы не просто продаем туры.<br />
            Мы создаем воспоминания на всю жизнь.
          </p>
          
          {/* Бейджи доверия */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <BadgeCheck size={20} className="text-green-400" />
              <span className="text-sm">Лицензированный туроператор</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Shield size={20} className="text-blue-400" />
              <span className="text-sm">Застрахованная ответственность</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Award size={20} className="text-yellow-400" />
              <span className="text-sm">Сертификат ISO 9001</span>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-white/60 rounded-full mx-auto"
            />
          </div>
        </motion.div>
      </section>

      {/* Гарантии и преимущества */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Почему нам доверяют</h2>
            <p className="text-xl text-gray-600">Ваша безопасность и комфорт - наш приоритет</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guarantees.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 bg-gray-50 rounded-2xl hover:shadow-xl transition-all"
              >
                <div className={`inline-flex p-4 rounded-xl bg-white shadow-md mb-4 ${item.color}`}>
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats - Анимированные счетчики */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-airbnb-rausch/20 rounded-full blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            В цифрах
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { end: 10000, suffix: '+', label: 'Счастливых туристов', icon: Users },
              { end: 500, suffix: '+', label: 'Уникальных туров', icon: MapPin },
              { end: 50, suffix: '+', label: 'Городов Азии', icon: Globe },
              { end: 4.9, decimals: 1, label: 'Средний рейтинг', icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                <stat.icon size={48} className="mx-auto mb-4 text-airbnb-rausch" />
                <div className="text-6xl font-black mb-2">
                  <AnimatedCounter 
                    end={stat.end} 
                    suffix={stat.suffix || ''} 
                    decimals={stat.decimals || 0}
                  />
                </div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Сертификаты и лицензии */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Лицензии и сертификаты</h2>
            <p className="text-xl text-gray-600">Официально зарегистрированная и сертифицированная компания</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center"
              >
                <FileCheck size={48} className="mx-auto mb-4 text-green-600" />
                <h3 className="font-bold text-gray-900 mb-2">{cert.title}</h3>
                <p className="text-sm text-gray-600 mb-1">№ {cert.number}</p>
                <p className="text-xs text-gray-500">С {cert.year} года</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Отзывы клиентов */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Что говорят наши клиенты</h2>
            <p className="text-xl text-gray-600">Реальные отзывы реальных людей</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-bold text-gray-900">{review.name}</p>
                  <p className="text-sm text-gray-600">{review.city}</p>
                  <p className="text-xs text-airbnb-rausch mt-1">{review.tour}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline - История компании */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 360, 0]
              }}
              transition={{
                duration: 10 + i,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="absolute w-2 h-2 bg-airbnb-rausch rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Наша история</h2>
            <p className="text-xl text-gray-600">От мечты до реальности</p>
          </motion.div>

          <div className="max-w-5xl mx-auto relative">
            {/* Вертикальная линия */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-airbnb-rausch to-purple-500" />

            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative flex items-center mb-20 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="inline-block"
                  >
                    <div className={`p-8 rounded-2xl ${item.bg} shadow-lg hover:shadow-2xl transition-all`}>
                      <div className="flex items-center gap-4 justify-center mb-4">
                        <item.icon size={32} className={item.color} />
                        <div className="text-4xl font-black text-gray-900">{item.year}</div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Центральная точка */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                  className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-airbnb-rausch rounded-full shadow-lg z-10"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values - Ценности с 3D tilt */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-16 text-gray-900"
          >
            Что делает нас особенными
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <TiltCard>
                  <div className={`p-8 rounded-2xl ${value.bg} hover:shadow-2xl transition-shadow h-full`}>
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`inline-flex p-4 rounded-2xl ${value.color} bg-white mb-4`}
                    >
                      <value.icon size={32} />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 text-lg">{value.description}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team - Команда */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Наша команда</h2>
            <p className="text-xl text-gray-600">Люди, которые делают магию возможной</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -10 }}
                className="text-center group"
              >
                <div className="relative mb-6 inline-block">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-48 h-48 rounded-full overflow-hidden border-4 border-airbnb-rausch shadow-2xl"
                  >
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </motion.div>
                  
                  {/* Декоративное кольцо */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-4 border-2 border-dashed border-airbnb-rausch/30 rounded-full"
                  />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-airbnb-rausch font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Партнеры */}
      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Наши партнеры</h3>
            <p className="text-gray-600">Мы работаем с ведущими платежными системами</p>
          </motion.div>

          <div className="flex flex-wrap justify-center items-center gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="px-6 py-3 bg-gray-50 rounded-xl font-bold text-gray-700 text-lg"
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Контакты и поддержка */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Остались вопросы?</h2>
              <p className="text-xl text-gray-600 mb-8">Наша команда поддержки всегда готова помочь</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <Phone size={32} className="mx-auto mb-4 text-airbnb-rausch" />
                  <h3 className="font-bold text-gray-900 mb-2">Телефон поддержки</h3>
                  <p className="text-2xl font-bold text-airbnb-rausch">8 (800) 123-45-67</p>
                  <p className="text-sm text-gray-600 mt-2">Бесплатно по России, 24/7</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <HeadphonesIcon size={32} className="mx-auto mb-4 text-airbnb-rausch" />
                  <h3 className="font-bold text-gray-900 mb-2">Онлайн-чат</h3>
                  <p className="text-gray-600 mb-3">Средн время ответа: 2 минуты</p>
                  <button className="px-6 py-2 bg-airbnb-rausch text-white rounded-full font-semibold hover:bg-airbnb-rausch/90 transition-colors">
                    Начать чат
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-airbnb-rausch via-purple-600 to-blue-600" />
        
        {/* Анимированные частицы */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -1000],
              x: [0, Math.random() * 200 - 100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute bottom-0 w-2 h-2 bg-white rounded-full"
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Готовы к приключениям?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам путешественников, которые уже открыли для себя Азию с Turex Pro
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.a
                href="/tours"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="px-10 py-5 bg-white text-airbnb-rausch rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all">
                  🗺️ Найти экскурсию
                </button>
              </motion.a>
              
              <motion.a
                href="/become-guide"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-airbnb-rausch transition-all">
                  ⭐ Стать гидом
                </button>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
