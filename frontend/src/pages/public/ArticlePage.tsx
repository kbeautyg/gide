import { useParams, Link } from 'react-router-dom'
import { Clock, Calendar, ArrowLeft, Share2, Bookmark, TrendingUp, Eye, Sparkles } from 'lucide-react'
import { PublicHeader } from '@/components/PublicHeader'
import { PublicFooter } from '@/components/PublicFooter'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()

  // База статей (должна совпадать с JournalPage)
  const articlesDatabase: Record<string, any> = {
    'tailand-polnyj-gid': {
      title: 'Таиланд: полный гид по стране улыбок',
      preview: 'Откройте для себя удивительный Таиланд: от шумного Бангкока до райских пляжей Пхукета',
      photo: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1920&h=1080&fit=crop',
      readTime: 18,
      publishedAt: '15 октября 2024',
      countryTag: 'Таиланд',
      views: 12500,
      category: 'Путеводители',
      content: `
Таиланд — это страна контрастов, где древние храмы соседствуют с современными небоскрёбами, а тропические джунгли граничат с белоснежными пляжами. Эта удивительная страна в Юго-Восточной Азии привлекает миллионы туристов ежегодно своей уникальной культурой, вкусной кухней и гостеприимством местных жителей.

## Бангкок: сердце Таиланда

Столица Таиланда — это мегаполис, который никогда не спит. Здесь вы найдёте величественные храмы, шумные рынки и современные торговые центры.

**Главные достопримечательности:**
- Большой королевский дворец — жемчужина тайской архитектуры
- Храм Ват Арун — храм рассвета с потрясающими видами
- Плавучий рынок Дамноен Садуак — аутентичный опыт тайской торговли
- Улица Каосан Роуд — центр бэкпекерской жизни

Бангкок также известен своей уличной едой. Обязательно попробуйте пад тай, том ям и манговый рис с кокосовым молоком.

## Пхукет: тропический рай

Крупнейший остров Таиланда славится своими пляжами и ночной жизнью. Пхукет предлагает развлечения на любой вкус — от спокойного пляжного отдыха до активных водных видов спорта.

**Лучшие пляжи:**
- Патонг — для любителей вечеринок
- Карон — идеален для семейного отдыха
- Ката — отличные условия для сёрфинга
- Камала — тихий и уединённый

Не пропустите экскурсию на острова Пхи-Пхи — одно из самых красивых мест в мире.

## Чиангмай: культурная столица

Город на севере Таиланда известен своими древними храмами и традициями. Здесь более спокойный ритм жизни по сравнению с Бангкоком.

**Что посмотреть:**
- Храм Дой Сутхеп на горе с панорамным видом
- Старый город с сотнями храмов
- Ночной базар — рай для шопинга
- Деревни горных племён

Чиангмай также известен своими кулинарными курсами, где можно научиться готовить традиционные тайские блюда.

## Практические советы

**Лучшее время для посещения:**
Ноябрь-февраль — прохладный сезон с минимумом дождей. Это идеальное время для путешествия по всей стране.

**Виза:**
Граждане России могут находиться в Таиланде без визы до 30 дней при въезде по воздуху.

**Валюта:**
Тайский бат (THB). 1 USD ≈ 35 бат. Обменивайте деньги в официальных обменниках, а не в аэропорту.

**Транспорт:**
- Внутри городов: тук-туки, такси Grab, мотобайки
- Между городами: автобусы, поезда, внутренние рейсы
- Острова: паромы и скоростные катера

**Безопасность:**
Таиланд — безопасная страна для туристов. Соблюдайте стандартные меры предосторожности и уважайте местные традиции.

## Тайская кухня

Кулинария — это отдельная причина посетить Таиланд. Тайская кухня известна своим балансом вкусов: острого, сладкого, кислого и солёного.

**Обязательно попробуйте:**
- Том ям — острый суп с креветками
- Пад тай — жареная лапша с арахисом
- Массаман карри — мягкое карри с картофелем
- Сом там — острый салат из папайи
- Манго стики райс — десерт из манго и клейкого риса

Уличная еда в Таиланде не только вкусная, но и безопасная. Выбирайте места, где много местных жителей.

## Культура и традиции

Тайцы — очень дружелюбный и улыбчивый народ. Уважение к королевской семье и буддизму — основа тайского общества.

**Правила этикета:**
- Снимайте обувь при входе в храмы и дома
- Не прикасайтесь к голове тайцев — это священная часть тела
- Одевайтесь скромно при посещении храмов
- Не повышайте голос и не проявляйте агрессию

## Заключение

Таиланд — это страна, которая влюбляет в себя с первого визита. Здесь каждый найдёт что-то своё: любители пляжного отдыха, ценители культуры, гурманы или искатели приключений. Страна улыбок ждёт вас!
      `
    },
    'yaponiya-puteshestvie': {
      title: 'Япония: путешествие в страну восходящего солнца',
      preview: 'Древние храмы Киото, неоновые огни Токио и священная гора Фудзи',
      photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=1080&fit=crop',
      readTime: 22,
      publishedAt: '10 октября 2024',
      countryTag: 'Япония',
      views: 15800,
      category: 'Культура',
      content: `
Япония — это страна, где тысячелетние традиции гармонично сочетаются с передовыми технологиями. От священных храмов Киото до неоновых улиц Токио, от снежных вершин Хоккайдо до тропических пляжей Окинавы — Япония предлагает невероятное разнообразие впечатлений.

## Токио: город будущего

Столица Японии — это мегаполис, который поражает воображение своими масштабами и контрастами. Здесь футуристические небоскрёбы соседствуют с традиционными святилищами.

**Главные районы:**
- Синдзюку — деловой центр с небоскрёбами
- Сибуя — молодёжная мода и знаменитый перекрёсток
- Акихабара — рай для любителей аниме и электроники
- Асакуса — традиционный район с храмом Сэнсо-дзи

Не пропустите рыбный рынок Тоёсу и смотровую площадку Tokyo Skytree.

## Киото: душа Японии

Древняя столица Японии — это город храмов, садов и гейш. Здесь сохранилась атмосфера старой Японии.

**Обязательно посетите:**
- Золотой павильон Кинкаку-дзи
- Бамбуковую рощу Арасияма
- Храм тысячи ворот Фусими Инари
- Район гейш Гион

Киото особенно прекрасен весной во время цветения сакуры и осенью, когда листья клёнов окрашиваются в красный цвет.

## Гора Фудзи

Священная гора Фудзи — символ Японии. Её идеальный конус виден за сотни километров в ясную погоду.

**Лучшие места для просмотра:**
- Озеро Кавагути — классический вид с отражением
- Пагода Чурейто — знаменитая открыточная композиция
- Хаконе — горячие источники с видом на Фудзи

Сезон восхождения: июль-сентябрь. Подъём занимает 5-8 часов.

## Японская кухня

Японская кухня — это искусство. Здесь важны не только вкус, но и презентация.

**Что попробовать:**
- Суши и сашими — свежайшая рыба
- Рамен — горячий суп с лапшой
- Темпура — овощи и морепродукты в кляре
- Окономияки — японская пицца
- Вагю — мраморная говядина

Обязательно посетите суши-бар с конвейерной лентой и попробуйте настоящий японский рамен.

## Культура и этикет

Японцы известны своей вежливостью и уважением к традициям.

**Важные правила:**
- Снимайте обувь при входе в дома и некоторые рестораны
- Не оставляйте чаевых — это может быть воспринято как оскорбление
- Говорите тихо в общественном транспорте
- Не ешьте на ходу
- Кланяйтесь при приветствии

## Практическая информация

**Лучшее время:**
- Весна (март-май) — цветение сакуры
- Осень (сентябрь-ноябрь) — красные клёны

**Транспорт:**
JR Pass — безлимитный проездной на поезда. Покупайте до приезда в Японию.

**Язык:**
Английский знают немногие, но японцы очень помогают туристам. Скачайте переводчик офлайн.

**Интернет:**
Арендуйте карманный Wi-Fi роутер в аэропорту.

Япония — это страна, которая меняет восприятие мира. Здесь каждая деталь продумана, каждый момент особенный. Добро пожаловать в страну восходящего солнца!
      `
    },
  }

  const article = slug ? articlesDatabase[slug] : null

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PublicHeader />
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Статья не найдена</h1>
          <Link to="/journal">
            <Button>Вернуться к журналу</Button>
          </Link>
        </div>
        <PublicFooter />
      </div>
    )
  }

  // Функция для обработки жирного текста внутри строки
  const processBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  // Разбиваем контент на параграфы
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, i) => {
      // Заголовки H2
      if (paragraph.startsWith('##')) {
        return (
          <motion.h2
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 mt-12 mb-6 flex items-center gap-3"
          >
            <span className="w-2 h-8 bg-gradient-to-b from-airbnb-rausch to-pink-600 rounded-full" />
            {paragraph.replace('## ', '')}
          </motion.h2>
        )
      }
      
      // Жирный текст (целый параграф)
      if (paragraph.startsWith('**') && paragraph.endsWith('**') && !paragraph.includes('\n')) {
        return (
          <p key={i} className="font-bold text-xl text-gray-900 my-6">
            {paragraph.replace(/\*\*/g, '')}
          </p>
        )
      }
      
      // Списки
      if (paragraph.startsWith('-')) {
        const items = paragraph.split('\n')
        return (
          <motion.ul
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3 my-6 ml-6"
          >
            {items.map((item, j) => (
              <li key={j} className="text-gray-700 text-lg leading-relaxed flex items-start gap-3">
                <span className="w-2 h-2 bg-airbnb-rausch rounded-full mt-2.5 flex-shrink-0" />
                <span>{processBoldText(item.replace('- ', ''))}</span>
              </li>
            ))}
          </motion.ul>
        )
      }
      
      // Обычный параграф (с поддержкой жирного текста внутри)
      return (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gray-700 text-lg leading-relaxed my-6"
        >
          {processBoldText(paragraph)}
        </motion.p>
      )
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero с фото - улучшенный дизайн */}
      <div className="relative h-[600px] overflow-hidden">
        <img
          src={article.photo}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Кнопка назад */}
        <div className="absolute top-8 left-8 z-10">
          <Link to="/journal">
            <Button variant="secondary" size="lg" className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg">
              <ArrowLeft className="mr-2" size={20} />
              Назад к журналу
            </Button>
          </Link>
        </div>

        {/* Действия */}
        <div className="absolute top-8 right-8 z-10 flex gap-3">
          <button className="p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110">
            <Share2 size={20} className="text-gray-900" />
          </button>
          <button className="p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all hover:scale-110">
            <Bookmark size={20} className="text-gray-900" />
          </button>
        </div>
        
        {/* Контент Hero */}
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              {/* Мета-информация */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 text-white/90 text-sm mb-6"
              >
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold">
                  {article.category}
                </span>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{article.readTime} минут чтения</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{article.publishedAt}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span>{article.views.toLocaleString()} просмотров</span>
                </div>
              </motion.div>
              
              {/* Заголовок */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
              >
                {article.title}
              </motion.h1>
              
              {/* Превью */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/90 leading-relaxed"
              >
                {article.preview}
              </motion.p>

              {/* Тег страны */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/90 backdrop-blur-sm text-white rounded-full font-semibold">
                  <TrendingUp size={16} />
                  #{article.countryTag}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Контент статьи - улучшенная типографика */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Основной контент */}
          <article className="prose prose-lg max-w-none">
            {renderContent(article.content)}
          </article>

          {/* Разделитель */}
          <div className="my-16 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <Sparkles className="text-airbnb-rausch" size={24} />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Призыв к действию */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-airbnb-rausch to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center"
          >
            <h3 className="text-3xl font-bold mb-4">
              Готовы отправиться в путешествие?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Найдите идеальную экскурсию в {article.countryTag} с местными гидами
            </p>
            <Link to={`/tours?location=${article.countryTag}`}>
              <Button size="lg" variant="secondary" className="bg-white text-airbnb-rausch hover:bg-gray-50 font-semibold text-lg px-8 py-6">
                Смотреть экскурсии в {article.countryTag}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
