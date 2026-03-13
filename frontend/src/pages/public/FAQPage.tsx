import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, ChevronUp, MessageCircle, Mail, MapPin, Clock } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    category: 'Бронирование',
    question: 'Как забронировать экскурсию?',
    answer: 'Для бронирования экскурсии выберите интересующую вас экскурсию на сайте, нажмите кнопку "Забронировать" и заполните форму с вашими данными. После этого вы получите подтверждение на указанный email и телефон. Оплата производится онлайн или наличными при встрече с гидом.',
  },
  {
    category: 'Бронирование',
    question: 'Можно ли отменить или изменить бронирование?',
    answer: 'Да, вы можете отменить или изменить бронирование не позднее чем за 24 часа до начала экскурсии без штрафных санкций. При отмене менее чем за 24 часа возврат составит 50% от стоимости. Для изменения бронирования свяжитесь с нами по телефону или email.',
  },
  {
    category: 'Бронирование',
    question: 'Что входит в стоимость экскурсии?',
    answer: 'В стоимость экскурсии включены: услуги профессионального гида, трансфер (если указано в описании), входные билеты в музеи и достопримечательности (если указано), страховка. Питание, личные расходы и дополнительные услуги оплачиваются отдельно, если не указано иное.',
  },
  {
    category: 'Оплата',
    question: 'Какие способы оплаты вы принимаете?',
    answer: 'Мы принимаем оплату банковскими картами (Visa, MasterCard, МИР), электронными кошельками, банковским переводом, а также наличными при встрече с гидом (только в рублях). Для онлайн-оплаты доступны рубли, доллары США и тайские баты.',
  },
  {
    category: 'Оплата',
    question: 'Нужно ли платить предоплату?',
    answer: 'Да, для подтверждения бронирования требуется предоплата в размере 30% от стоимости экскурсии. Оставшуюся сумму можно оплатить онлайн или наличными в день экскурсии. Предоплата гарантирует ваше место в группе или индивидуальную экскурсию.',
  },
  {
    category: 'Оплата',
    question: 'Можно ли получить счет для юридических лиц?',
    answer: 'Да, мы работаем с юридическими лицами и предоставляем все необходимые документы: договор, счет на оплату, акт выполненных работ. Для оформления корпоративного заказа свяжитесь с нами по email или телефону.',
  },
  {
    category: 'Экскурсии',
    question: 'Сколько человек в группе?',
    answer: 'Стандартные групповые экскурсии проводятся для групп от 10 до 20 человек. Мы также предлагаем мини-группы (4-8 человек) и индивидуальные экскурсии для 1-3 человек. Размер группы всегда указан в описании конкретной экскурсии.',
  },
  {
    category: 'Экскурсии',
    question: 'Можно ли организовать индивидуальную экскурсию?',
    answer: 'Конечно! Мы с удовольствием организуем индивидуальную экскурсию с учетом ваших пожеланий по маршруту, времени и интересам. Стоимость индивидуальной экскурсии рассчитывается отдельно. Для заказа заполните форму "Заказать индивидуальную экскурсию" на сайте.',
  },
  {
    category: 'Экскурсии',
    question: 'Есть ли экскурсии на русском языке?',
    answer: 'Да, все наши гиды говорят на русском языке. Также доступны экскурсии на английском, немецком, французском и тайском языках. При бронировании укажите предпочитаемый язык экскурсии.',
  },
  {
    category: 'Экскурсии',
    question: 'Что делать, если погода плохая?',
    answer: 'В случае неблагоприятных погодных условий (сильный дождь, шторм) экскурсия может быть перенесена на другой день по согласованию с вами или отменена с полным возвратом средств. Мы заранее мониторим погоду и предупреждаем клиентов о возможных изменениях.',
  },
  {
    category: 'Логистика',
    question: 'Как добраться до места встречи?',
    answer: 'Место встречи всегда указано в подтверждении бронирования. Мы можем организовать трансфер от вашего отеля за дополнительную плату. Также вы можете воспользоваться такси (рекомендуем Grab или Bolt) или общественным транспортом.',
  },
  {
    category: 'Логистика',
    question: 'Предоставляете ли вы трансфер?',
    answer: 'Да, трансфер включен в некоторые экскурсии. Для других экскурсий трансфер можно заказать дополнительно. Мы предоставляем комфортабельные автомобили с кондиционером и англоговорящими водителями.',
  },
  {
    category: 'Безопасность',
    question: 'Застрахованы ли туристы во время экскурсии?',
    answer: 'Да, все участники наших экскурсий застрахованы на время проведения экскурсии. Страховка покрывает несчастные случаи и медицинские расходы. Мы работаем с проверенными страховыми компаниями.',
  },
  {
    category: 'Безопасность',
    question: 'Можно ли брать с собой детей?',
    answer: 'Да, большинство наших экскурсий подходят для детей. Для детей до 6 лет многие экскурсии бесплатны, для детей 6-12 лет предоставляются скидки. В описании каждой экскурсии указаны возрастные ограничения и рекомендации.',
  },
  {
    category: 'Гиды',
    question: 'Как стать гидом в вашей компании?',
    answer: 'Мы всегда рады сотрудничеству с профессиональными гидами! Для того чтобы стать нашим гидом, перейдите на страницу "Стать гидом", заполните анкету и прикрепите ваше резюме. Мы свяжемся с вами в течение 3-5 рабочих дней.',
  },
  {
    category: 'Гиды',
    question: 'Какие требования к гидам?',
    answer: 'Наши требования: опыт работы гидом от 1 года, свободное владение русским языком (+ дополнительные языки приветствуются), глубокие знания истории и культуры региона, коммуникабельность и пунктуальность. Также необходимо иметь лицензию гида (если требуется в вашей стране).',
  },
  {
    category: 'Контакты',
    question: 'Как с вами связаться?',
    answer: 'Свяжитесь с нами по email help@inturex.pro. Время работы: 🇹🇭 Пхукет 10-19, 🇰🇬 Бишкек 9-19, 🇷🇺 Москва 9-19. Поддержка доступна 24/7.',
  },
  {
    category: 'Контакты',
    question: 'Где вы находитесь?',
    answer: 'У нас есть офисы в трёх странах: 🇹🇭 Пхукет, Таиланд; 🇰🇬 Бишкек, Кыргызстан; 🇷🇺 Москва, Россия.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('Все')

  const categories = ['Все', ...Array.from(new Set(faqData.map((item) => item.category)))]

  const filteredFAQ = selectedCategory === 'Все' 
    ? faqData 
    : faqData.filter((item) => item.category === selectedCategory)

  // JSON-LD для FAQ страницы (помогает в выдаче Google)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>FAQ — Часто задаваемые вопросы об экскурсиях | Inturex</title>
        <meta name="description" content="Ответы на популярные вопросы о бронировании экскурсий, оплате, отмене, безопасности. Как забронировать тур? Какие способы оплаты? Можно ли отменить?" />
        <meta name="keywords" content="FAQ экскурсии, вопросы о турах, как забронировать экскурсию, отмена бронирования, оплата тура, безопасность экскурсий" />
        <link rel="canonical" href="https://inturex.pro/faq" />
        <meta property="og:title" content="FAQ — Часто задаваемые вопросы | Inturex" />
        <meta property="og:description" content="Ответы на популярные вопросы о бронировании экскурсий, оплате, отмене, безопасности." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://inturex.pro/faq" />
        <meta property="og:image" content="https://inturex.pro/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
      </Helmet>
      
      <PublicHeader />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-airbnb-rausch/10 rounded-full mb-4">
            <MessageCircle size={48} className="text-airbnb-rausch" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Часто задаваемые вопросы
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ответы на популярные вопросы о наших экскурсиях, бронировании и услугах
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-airbnb-rausch text-white shadow-airbnb'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4 mb-12">
          {filteredFAQ.map((item, index) => (
            <Card 
              key={index}
              className={`border-2 transition-all cursor-pointer shadow-airbnb-sm hover:shadow-airbnb ${
                openIndex === index ? 'border-airbnb-rausch' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-airbnb-rausch mb-2 block">
                      {item.category}
                    </span>
                    <CardTitle className="text-lg text-gray-900">{item.question}</CardTitle>
                  </div>
                  <div className="ml-4">
                    {openIndex === index ? (
                      <ChevronUp className="text-airbnb-rausch" size={24} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={24} />
                    )}
                  </div>
                </div>
              </CardHeader>
              {openIndex === index && (
                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-airbnb-rausch to-airbnb-arches" />
          <Card className="relative z-10 border-0 bg-transparent text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Не нашли ответ на свой вопрос?</CardTitle>
              <CardDescription className="text-white/95">
                Свяжитесь с нами любым удобным способом
              </CardDescription>
            </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="text-white mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold mb-1">Email</p>
                  <p className="text-white/90 text-sm">help@inturex.pro</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-white mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold mb-1">Офисы</p>
                  <p className="text-white/90 text-sm">🇹🇭 Пхукет · 🇰🇬 Бишкек · 🇷🇺 Москва</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-white mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold mb-1">Время работы</p>
                  <p className="text-white/90 text-sm">🇹🇭 10–19 · 🇰🇬 9–19 · 🇷🇺 9–19</p>
                  <p className="text-white/90 text-sm mt-1">📧 24/7</p>
                </div>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
