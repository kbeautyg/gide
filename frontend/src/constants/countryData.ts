/**
 * Данные стран и городов для отображения карточек
 * Все фото раздаются через CDN (cdn.inturex.pro)
 */

// Относительный путь бэкенда для статики стран (резолвится через getImageUrl)
const BACKEND_STATIC = '/static/countries'

// CDN для всех картинок
const CDN = 'https://cdn.inturex.pro'

// Хелпер — фото города через CDN (Wikipedia slug)
const C = (slug: string) => `${CDN}/static/cities/${slug}.jpg`

// Фото для стран через CDN
const COUNTRY_CDN: Record<string, string> = {
  'thailand':     C('bangkok'),
  'uae':          C('dubai'),
  'turkey':       C('istanbul'),
  'japan':        C('kyoto'),
  'south_korea':  C('seoul'),
  'indonesia':    C('bali'),
  'vietnam':      C('hanoi'),
  'singapore':    C('singapore'),
  'china':        C('beijing'),
  'india':        C('agra'),
  'malaysia':     C('kuala-lumpur'),
}

export const COUNTRY_DATA = {
  'Таиланд': {
    flag: '🇹🇭',
    image: `${BACKEND_STATIC}/thailand.jpg`,
    description: 'Золотые храмы, белоснежные пляжи, уличная еда и тропические острова',
    highlights: ['Бангкок', 'Пхукет', 'Паттайя'],
  },
  'ОАЭ': {
    flag: '🇦🇪',
    image: `${BACKEND_STATIC}/uae.jpg`,
    description: 'Футуристические небоскребы, бескрайние пустыни и восточная роскошь',
    highlights: ['Дубай', 'Абу-Даби', 'Шарджа'],
  },
  'Турция': {
    flag: '🇹🇷',
    image: `${BACKEND_STATIC}/turkey.jpg`,
    description: 'Каппадокия, Стамбул, море и античные руины',
    highlights: ['Стамбул', 'Каппадокия', 'Анталья'],
  },
  'Япония': {
    flag: '🇯🇵',
    image: `${BACKEND_STATIC}/japan.jpg`,
    description: 'Древние храмы, современные технологии, суши и цветущая сакура',
    highlights: ['Токио', 'Киото', 'Осака'],
  },
  'Южная Корея': {
    flag: '🇰🇷',
    image: `${BACKEND_STATIC}/south_korea.jpg`,
    description: 'K-pop культура, дворцы, уличная еда и неоновые улицы Сеула',
    highlights: ['Сеул', 'Пусан', 'Чеджу'],
  },
  'Индонезия': {
    flag: '🇮🇩',
    image: `${BACKEND_STATIC}/indonesia.jpg`,
    description: 'Рисовые террасы Бали, вулканы, серфинг и древние храмы',
    highlights: ['Бали', 'Ява', 'Ломбок'],
  },
  'Вьетнам': {
    flag: '🇻🇳',
    image: `${BACKEND_STATIC}/vietnam.jpg`,
    description: 'Бухта Халонг, традиционная кухня, древние города и рисовые поля',
    highlights: ['Ханой', 'Хошимин', 'Дананг'],
  },
  'Сингапур': {
    flag: '🇸🇬',
    image: `${BACKEND_STATIC}/singapore.jpg`,
    description: 'Город-сад с небоскребами, мультикультурность и уличная еда',
    highlights: ['Марина Бэй', 'Сентоза', 'Чайнатаун'],
  },
  'Китай': {
    flag: '🇨🇳',
    image: `${BACKEND_STATIC}/china.jpg`,
    description: 'Великая стена, Терракотовая армия, мегаполисы и древняя культура',
    highlights: ['Пекин', 'Шанхай', 'Гонконг'],
  },
  'Индия': {
    flag: '🇮🇳',
    image: `${BACKEND_STATIC}/india.jpg`,
    description: 'Тадж-Махал, йога, специи, духовные практики и красочные фестивали',
    highlights: ['Дели', 'Мумбаи', 'Гоа'],
  },
  'Малайзия': {
    flag: '🇲🇾',
    image: `${BACKEND_STATIC}/malaysia.jpg`,
    description: 'Башни Петронас, джунгли, острова и уличная еда',
    highlights: ['Куала-Лумпур', 'Пенанг', 'Лангкави'],
  },
} as const

// Маппинг город → slug страны (для fallback)
const CITY_TO_COUNTRY: Record<string, string> = {
  // Таиланд
  'Бангкок': 'thailand', 'Пхукет': 'thailand', 'Паттайя': 'thailand',
  'Краби': 'thailand', 'Чиангмай': 'thailand', 'Самуи': 'thailand', 'Чианграй': 'thailand',
  // ОАЭ
  'Дубай': 'uae', 'Абу-Даби': 'uae', 'Шарджа': 'uae',
  // Япония
  'Токио': 'japan', 'Киото': 'japan', 'Осака': 'japan',
  'Нара': 'japan', 'Хиросима': 'japan', 'Окинава': 'japan', 'Хаконэ': 'japan', 'Хоккайдо': 'japan',
  // Корея
  'Сеул': 'south_korea', 'Пусан': 'south_korea', 'Чеджу': 'south_korea', 'Кёнджу': 'south_korea',
  // Индонезия
  'Бали': 'indonesia', 'Убуд': 'indonesia', 'Семиньяк': 'indonesia', 'Нуса-Дуа': 'indonesia',
  'Ява': 'indonesia', 'Ломбок': 'indonesia', 'Джокьякарта': 'indonesia',
  'Лабуханбаджо': 'indonesia', 'Сумбава': 'indonesia',
  // Вьетнам
  'Ханой': 'vietnam', 'Хошимин': 'vietnam', 'Нячанг': 'vietnam',
  'Дананг': 'vietnam', 'Фукуок': 'vietnam', 'Далат': 'vietnam', 'Сапа': 'vietnam',
  // Сингапур
  'Сингапур': 'singapore', 'Марина Бэй': 'singapore', 'Сентоза': 'singapore', 'Чайнатаун': 'singapore',
  // Китай
  'Пекин': 'china', 'Шанхай': 'china', 'Гонконг': 'china',
  'Чжанцзяцзе': 'china', 'Гуанчжоу': 'china', 'Гуйлинь': 'china',
  'Куньмин': 'china', 'Лоян': 'china', 'Сиань': 'china', 'Чэнду': 'china',
  'Чунцин': 'china', 'Харбин': 'china', 'Ханчжоу': 'china', 'Хуньчунь': 'china',
  // Индия
  'Дели': 'india', 'Мумбаи': 'india', 'Гоа': 'india', 'Ченнаи': 'india',
  'Кхаджурахо': 'india', 'Порт-Блэр': 'india', 'Кочин': 'india', 'Тирупати': 'india',
  'Варанаси': 'india', 'Агра': 'india', 'Джайпур': 'india', 'Варкала': 'india',
  'Индор': 'india', 'Тривандрум': 'india', 'Удайпур': 'india', 'Джодхпур': 'india',
  'Ришикеш': 'india', 'Амритсар': 'india', 'Ладакх': 'india', 'Праяградж': 'india', 'Читторгарх': 'india',
  // Малайзия
  'Куала-Лумпур': 'malaysia', 'Пенанг': 'malaysia', 'Лангкави': 'malaysia',
  // Турция
  'Стамбул': 'turkey', 'Каппадокия': 'turkey', 'Анталья': 'turkey',
  'Бодрум': 'turkey', 'Даламан': 'turkey', 'Фетхие': 'turkey', 'Кемер': 'turkey', 'Афьон': 'turkey',
}

// Уникальные фото для КАЖДОГО города через CDN (Wikipedia)
const CITY_PHOTO_MAP: Record<string, string> = {
  // ============ Таиланд ============
  'Бангкок':    C('bangkok'),
  'Пхукет':     C('phuket'),
  'Паттайя':    C('pattaya'),
  'Краби':      C('krabi'),
  'Чиангмай':   C('chiang-mai'),
  'Самуи':      C('koh-samui'),
  'Чианграй':   C('chiang-rai'),

  // ============ ОАЭ ============
  'Дубай':      C('dubai'),
  'Абу-Даби':   C('abu-dhabi'),
  'Шарджа':     C('sharjah'),

  // ============ Япония ============
  'Токио':      C('tokyo'),
  'Киото':      C('kyoto'),
  'Осака':      C('osaka'),
  'Нара':       C('nara'),
  'Хиросима':   C('hiroshima'),
  'Окинава':    C('okinawa'),
  'Хаконэ':     C('hakone'),
  'Хоккайдо':   C('hokkaido'),

  // ============ Корея ============
  'Сеул':       C('seoul'),
  'Пусан':      C('busan'),
  'Чеджу':      C('jeju'),
  'Кёнджу':     C('gyeongju'),

  // ============ Индонезия ============
  'Бали':       C('bali'),
  'Убуд':       C('ubud'),
  'Семиньяк':   C('seminyak'),
  'Нуса-Дуа':   C('nusa-dua'),
  'Ява':        C('java'),
  'Ломбок':     C('lombok'),
  'Джокьякарта': C('yogyakarta'),
  'Лабуханбаджо': C('labuan-bajo'),
  'Сумбава':    C('sumbawa'),

  // ============ Вьетнам ============
  'Ханой':      C('hanoi'),
  'Хошимин':    C('ho-chi-minh'),
  'Нячанг':     C('nha-trang'),
  'Дананг':     C('da-nang'),
  'Фукуок':     C('phu-quoc'),
  'Далат':      C('dalat'),
  'Сапа':       C('sapa'),

  // ============ Сингапур ============
  'Сингапур':   C('singapore'),
  'Марина Бэй': C('marina-bay'),
  'Сентоза':    C('sentosa'),
  'Чайнатаун':  C('chinatown-sg'),

  // ============ Китай ============
  'Пекин':      C('beijing'),
  'Шанхай':     C('shanghai'),
  'Гонконг':    C('hong-kong'),
  'Сиань':      C('xian'),
  'Чэнду':      C('chengdu'),
  'Гуйлинь':   C('guilin'),
  'Чжанцзяцзе': C('zhangjiajie'),
  'Гуанчжоу':   C('guangzhou'),
  'Куньмин':    C('kunming'),
  'Лоян':       C('luoyang'),
  'Чунцин':     C('chongqing'),
  'Харбин':     C('harbin'),
  'Ханчжоу':    C('hangzhou'),
  'Хуньчунь':   C('hunchun'),

  // ============ Индия ============
  'Дели':       C('delhi'),
  'Мумбаи':     C('mumbai'),
  'Гоа':        C('goa'),
  'Ченнаи':     C('chennai'),
  'Кхаджурахо':  C('khajuraho'),
  'Порт-Блэр':  C('port-blair'),
  'Кочин':      C('kochi'),
  'Тирупати':   C('tirupati'),
  'Варанаси':   C('varanasi'),
  'Агра':       C('agra'),
  'Джайпур':    C('jaipur'),
  'Варкала':    C('varkala'),
  'Индор':      C('indore'),
  'Тривандрум':  C('trivandrum'),
  'Удайпур':    C('udaipur'),
  'Джодхпур':   C('jodhpur'),
  'Ришикеш':    C('rishikesh'),
  'Амритсар':   C('amritsar'),
  'Ладакх':     C('ladakh'),
  'Праяградж':   C('prayagraj'),
  'Читторгарх':  C('chittorgarh'),

  // ============ Малайзия ============
  'Куала-Лумпур': C('kuala-lumpur'),
  'Пенанг':     C('penang'),
  'Лангкави':   C('langkawi'),

  // ============ Турция ============
  'Стамбул':    C('istanbul'),
  'Каппадокия':  C('cappadocia'),
  'Анталья':    C('antalya'),
  'Бодрум':     C('bodrum'),
  'Даламан':    C('dalaman'),
  'Фетхие':     C('fethiye'),
  'Кемер':      C('kemer'),
  'Афьон':      C('afyon'),
}

// Экспорт маппинга для HomePage
export const COUNTRY_SLUG_MAP: Record<string, string> = {
  'Таиланд': 'thailand', 'ОАЭ': 'uae', 'Япония': 'japan', 'Южная Корея': 'south_korea',
  'Индонезия': 'indonesia', 'Вьетнам': 'vietnam', 'Сингапур': 'singapore',
  'Китай': 'china', 'Индия': 'india', 'Турция': 'turkey', 'Малайзия': 'malaysia',
}

// Изображения городов — уникальное фото для каждого города
// Если города нет в CITY_PHOTO_MAP, фоллбэк на картинку страны
export const CITY_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(CITY_TO_COUNTRY).map(([city, countrySlug]) => [
    city,
    CITY_PHOTO_MAP[city] || `${BACKEND_STATIC}/${countrySlug}.jpg`
  ])
)

// Хелпер для получения картинки страны по имени
export function getCountryImage(countryName: string): string {
  const slug = COUNTRY_SLUG_MAP[countryName]
  if (!slug) return COUNTRY_CDN['thailand']
  return COUNTRY_CDN[slug] || `${BACKEND_STATIC}/${slug}.jpg`
}
