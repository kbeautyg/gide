/**
 * Данные стран и городов для отображения карточек
 * Все фото раздаются через CDN (cdn.inturex.pro)
 */

// Относительный путь бэкенда для статики стран (резолвится через getImageUrl)
const BACKEND_STATIC = '/static/countries'

// Хелпер — все фото городов/стран через CDN
const CDN = 'https://cdn.inturex.pro'
const U = (photoId: string) => `${CDN}/static/cities/photo-${photoId}.jpg`

// Фото для стран через CDN
const COUNTRY_UNSPLASH: Record<string, string> = {
  'thailand':     U('1508009603885-50cf7c579365'),   // Golden temples Bangkok
  'uae':          U('1512453913616-7b1a5e3d22db'),   // Dubai Burj Khalifa
  'turkey':       U('1524231757912-21f4fe3a7200'),   // Istanbul Blue Mosque
  'japan':        U('1493976040374-85c8e12f0c0e'),   // Kyoto Fushimi Inari
  'south_korea':  U('1534274988757-a28bf1a57c17'),   // Seoul Bukchon
  'indonesia':    U('1537996194471-e657df975ab4'),   // Bali rice terraces
  'vietnam':      U('1509030450996-dd1a26dda07a'),   // Hanoi Old Quarter
  'singapore':    U('1525625293386-3f8f99389edd'),   // Marina Bay Sands
  'china':        U('1508804185872-d7badad00f7d'),   // Beijing Forbidden City
  'india':        U('1564507592957-7513f7da5f2c'),   // Agra Taj Mahal
  'malaysia':     U('1596422846543-75c6fc197f07'),   // KL Petronas towers
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

// Уникальные фото для КАЖДОГО города (Unsplash photo IDs)
// Каждый город ОБЯЗАН иметь свою уникальную фотографию
const CITY_PHOTO_MAP: Record<string, string> = {
  // ============ Таиланд ============
  'Бангкок':    U('1508009603885-50cf7c579365'),  // Bangkok skyline & temples
  'Пхукет':     U('1589394815804-964ed0be2eb5'),  // Phuket beach
  'Паттайя':    U('1565538810643-b5bdb714032a'),  // Pattaya coastline
  'Краби':      U('1552465011-98eb83df7e6c'),      // Krabi cliffs
  'Чиангмай':   U('1598935898006-7da752be5b53'),  // Chiang Mai temples
  'Самуи':      U('1537956965359-7573183d1f57'),  // Koh Samui beach
  'Чианграй':   U('1564596823821-79b97151055e'),  // White temple

  // ============ ОАЭ ============
  'Дубай':      U('1512453913616-7b1a5e3d22db'),  // Dubai Burj Khalifa
  'Абу-Даби':   U('1587162146766-e06b1189b907'),  // Abu Dhabi Grand Mosque
  'Шарджа':     U('1578895101408-1a36b834405b'),  // Sharjah architecture

  // ============ Япония ============
  'Токио':      U('1540959733332-eab4deabeeaf'),  // Tokyo neon streets
  'Киото':      U('1493976040374-85c8e12f0c0e'),  // Kyoto fushimi inari
  'Осака':      U('1590559899731-a382cb30fc94'),  // Osaka Dotonbori
  'Нара':       U('1528164344705-47542687000d'),  // Nara deer park
  'Хиросима':   U('1576675784201-0e142b423ad4'),  // Hiroshima peace memorial
  'Окинава':    U('1545569341-9eb8b30979d9'),     // Okinawa tropical beach
  'Хаконэ':     U('1490806843957-31f4c9a91c65'),  // Hakone Mt Fuji view
  'Хоккайдо':   U('1517352552916-2af651e13f02'),  // Hokkaido lavender fields

  // ============ Корея ============
  'Сеул':       U('1534274988757-a28bf1a57c17'),  // Seoul Bukchon hanok
  'Пусан':      U('1573832035917-1ced4dc5b94f'),  // Busan Haedong temple
  'Чеджу':      U('1596786232616-73cd7dca8c8a'),  // Jeju coast
  'Кёнджу':     U('1583428230955-a6e2b0e0c920'),  // Gyeongju ancient tombs

  // ============ Индонезия ============
  'Бали':       U('1537996194471-e657df975ab4'),  // Bali rice terraces
  'Убуд':       U('1555400038-63f5ba517a47'),     // Ubud jungle temple
  'Семиньяк':   U('1518509562904-e7ef99cdcc86'),  // Seminyak sunset beach
  'Нуса-Дуа':   U('1544644181-1484b3e4d66d'),     // Nusa Dua resort coast
  'Ява':        U('1588668214407-6ea9a6d8c272'),  // Java volcano
  'Ломбок':     U('1570789210967-589a4b5f9294'),  // Lombok beach
  'Джокьякарта': U('1596402184320-483e87abb69e'), // Borobudur temple
  'Лабуханбаджо': U('1516690561799-6eeb283234df'), // Labuan Bajo komodo
  'Сумбава':    U('1507525428034-b723cf961d3e'),  // Sumbawa surf waves

  // ============ Вьетнам ============
  'Ханой':      U('1509030450996-dd1a26dda07a'),  // Hanoi Old Quarter
  'Хошимин':    U('1583417319070-4a69db38a482'),  // Ho Chi Minh City
  'Нячанг':     U('1537953773345-d172ccf13cf4'),  // Nha Trang beach
  'Дананг':     U('1559592413-7cec4d0cae2b'),     // Da Nang Dragon Bridge
  'Фукуок':     U('1559628233-100c798642d4'),     // Phu Quoc island
  'Далат':      U('1571984405176-5958bd681e0c'),  // Dalat countryside
  'Сапа':       U('1528127269322-539152af5929'),  // Sapa rice terraces

  // ============ Сингапур ============
  'Сингапур':   U('1525625293386-3f8f99389edd'),  // Marina Bay Sands
  'Марина Бэй': U('1496939376851-89342e80ce5b'), // Gardens by the Bay
  'Сентоза':    U('1565967511849-76a60a516170'),  // Sentosa island
  'Чайнатаун':  U('1544984243-ec57ea16fe25'),     // Singapore Chinatown

  // ============ Китай ============
  'Пекин':      U('1508804185872-d7badad00f7d'),  // Beijing Forbidden City
  'Шанхай':     U('1538428494232-9c0d8a3ab403'),  // Shanghai Pudong skyline
  'Гонконг':    U('1536599018102-9f803c140fc1'),  // Hong Kong skyline night
  'Сиань':      U('1591018653801-c2e4d6dcf57e'),  // Xi'an terracotta army
  'Чэнду':      U('1564349683136-77e08dba1ef7'),  // Chengdu giant panda
  'Гуйлинь':   U('1537531535885-4ba98a36e816'),  // Guilin karst mountains
  'Чжанцзяцзе': U('1513415277900-a62401e19be4'),  // Zhangjiajie pillars
  'Гуанчжоу':   U('1583859966186-1e977ead86a5'),  // Guangzhou Canton Tower
  'Куньмин':    U('1558618666-fcd25c85f82e'),     // Kunming Stone Forest
  'Лоян':       U('1547981609-4b6bfe67ca0b'),     // Luoyang Longmen grottoes
  'Чунцин':     U('1567447067018-593e2a202b3a'),  // Chongqing night lights
  'Харбин':     U('1548199569-3e1c6aa8f21b'),     // Harbin ice festival
  'Ханчжоу':    U('1528795274-a4d37aedfd0c'),     // Hangzhou West Lake
  'Хуньчунь':   U('1506905925346-21bda4d32df4'),  // China border town nature

  // ============ Индия (ВСЕ города) ============
  'Дели':       U('1587474260584-136574528ed5'),  // Delhi India Gate
  'Мумбаи':     U('1570168007204-dfb528c6958f'),  // Mumbai Gateway of India
  'Гоа':        U('1512343879784-a4b7f0ef3d66'),  // Goa beach palms
  'Ченнаи':     U('1582510003544-4d93731a8aa0'),  // Chennai Kapaleeshwarar temple
  'Кхаджурахо':  U('1590050752117-238cb4180ab1'), // Khajuraho carved temples
  'Порт-Блэр':  U('1544551763-46a013bb70d5'),     // Port Blair Andaman sea
  'Кочин':      U('1590073242-e6d81b82b3c8'),     // Kochi Chinese fishing nets
  'Тирупати':   U('1566438480900-8015a0896531'),  // Tirupati Balaji temple
  'Варанаси':   U('1561361513-2d000a50f0dc'),     // Varanasi holy ghats
  'Агра':       U('1564507592957-7513f7da5f2c'),  // Agra Taj Mahal
  'Джайпур':    U('1477587458883-47145ed94245'),  // Jaipur Hawa Mahal pink
  'Варкала':    U('1590766455498-14c6b0f5a7e0'),  // Varkala cliff beach
  'Индор':      U('1585320806297-9794b3e4eeae'),  // Indore Rajwada palace
  'Тривандрум':  U('1602216056096-3b40cc0c9944'), // Thiruvananthapuram temple
  'Удайпур':    U('1524492412937-b28074a5d7da'),  // Udaipur lake palace
  'Джодхпур':   U('1590930649-81f7660d57e1'),     // Jodhpur blue city
  'Ришикеш':    U('1591018215163-9e3e7be5d094'),  // Rishikesh Laxman Jhula
  'Амритсар':   U('1514222134-b57cbb8ce073'),     // Amritsar Golden Temple
  'Ладакх':     U('1506461883276-594a12b811cf'),  // Ladakh Pangong lake
  'Праяградж':   U('1590402494587-44b71d7772f6'), // Prayagraj Sangam
  'Читторгарх':  U('1590050751803-1ced2e22de6d'), // Chittorgarh fort

  // ============ Малайзия ============
  'Куала-Лумпур': U('1596422846543-75c6fc197f07'), // KL Petronas towers
  'Пенанг':     U('1596986968403-1e8f70fcd3a7'),   // Penang street art
  'Лангкави':   U('1586523969610-3c1c261e9d8f'),   // Langkawi cable car

  // ============ Турция ============
  'Стамбул':    U('1524231757912-21f4fe3a7200'),  // Istanbul Blue Mosque
  'Каппадокия':  U('1641128324972-af3212f0e6a3'), // Cappadocia balloons
  'Анталья':    U('1568702846914-96b305d2aaeb'),  // Antalya old town harbor
  'Бодрум':     U('1568179088426-1476d03ca7b9'),  // Bodrum castle harbor
  'Даламан':    U('1566552881560-0be862a7c445'),  // Dalaman coast
  'Фетхие':     U('1570077188670-e3a8d69ac5ff'),  // Fethiye Oludeniz bay
  'Кемер':      U('1588854337236-6889891f7bde'),  // Kemer mountains coast
  'Афьон':      U('1590050752117-238cb4180ab1'),  // Afyon thermal springs
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
// Приоритет: Unsplash (надёжный CDN) → backend fallback
export function getCountryImage(countryName: string): string {
  const slug = COUNTRY_SLUG_MAP[countryName]
  if (!slug) return COUNTRY_UNSPLASH['thailand']
  return COUNTRY_UNSPLASH[slug] || `${BACKEND_STATIC}/${slug}.jpg`
}
