/**
 * Утилиты для работы со slug (URL-friendly строки)
 * Преобразование названий в slug и обратно
 */

/**
 * Преобразует название в slug (URL-friendly строку)
 * Пример: "Санкт-Петербург" -> "saint-petersburg"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Убираем диакритические знаки
    .replace(/[^a-z0-9\s-]/g, '') // Убираем спецсимволы
    .replace(/\s+/g, '-') // Пробелы в дефисы
    .replace(/-+/g, '-') // Множественные дефисы в один
    .replace(/^-|-$/g, '') // Убираем дефисы в начале и конце
}

/**
 * Преобразует slug обратно в название (для отображения)
 * Использует маппинг для точного соответствия
 */
export function slugToName(slug: string): string | null {
  return slugToNameMap[slug] || null
}

/**
 * Маппинг городов: slug -> название
 */
const citySlugMap: Record<string, string> = {
  'bangkok': 'Бангкок',
  'phuket': 'Пхукет',
  'pattaya': 'Паттайя',
  'krabi': 'Краби',
  'chiangmai': 'Чиангмай',
  'ko-tao': 'Ко Тао',
  'ko-samui': 'Ко Самуи',
  'hua-hin': 'Хуа Хин',
  'dubai': 'Дубай',
  'abu-dhabi': 'Абу-Даби',
  'sharjah': 'Шарджа',
  'ajman': 'Аджман',
  'tokyo': 'Токио',
  'kyoto': 'Киото',
  'osaka': 'Осака',
  'hiroshima': 'Хиросима',
  'nara': 'Нара',
  'fukuoka': 'Фукуока',
  'sapporo': 'Саппоро',
  'seoul': 'Сеул',
  'busan': 'Пусан',
  'jeju': 'Чеджу',
  'incheon': 'Инчхон',
  'ubud': 'Убуд',
  'seminyak': 'Семиньяк',
  'nusa-dua': 'Нуса-Дуа',
  'jakarta': 'Джакарта',
  'yogyakarta': 'Джокьякарта',
  'lombok': 'Ломбок',
  'hanoi': 'Ханой',
  'ho-chi-minh': 'Хошимин',
  'halong': 'Халонг',
  'nha-trang': 'Нячанг',
  'dalat': 'Далат',
  'hoi-an': 'Хойан',
  'hue': 'Хюэ',
  'singapore': 'Сингапур',
  'beijing': 'Пекин',
  'shanghai': 'Шанхай',
  'xian': 'Сиань',
  'guangzhou': 'Гуанчжоу',
  'chengdu': 'Ченду',
  'hong-kong': 'Гонконг',
  'delhi': 'Дели',
  'mumbai': 'Мумбаи',
  'jaipur': 'Джайпур',
  'agra': 'Агра',
  'goa': 'Гоа',
  'varanasi': 'Варанаси',
  'udaipur': 'Удайпур',
  'kuala-lumpur': 'Куала-Лумпур',
  'penang': 'Пенанг',
  'langkawi': 'Лангкави',
  'malacca': 'Малакка',
}

/**
 * Маппинг стран: slug -> название
 */
const countrySlugMap: Record<string, string> = {
  'thailand': 'Таиланд',
  'uae': 'ОАЭ',
  'japan': 'Япония',
  'south-korea': 'Корея',
  'indonesia': 'Индонезия',
  'vietnam': 'Вьетнам',
  'singapore': 'Сингапур',
  'china': 'Китай',
  'india': 'Индия',
  'malaysia': 'Малайзия',
}

/**
 * Маппинг категорий: slug -> название
 */
const categorySlugMap: Record<string, string> = {
  'museums-art': 'Музеи и искусство',
  'historical': 'Исторические',
  'architecture': 'Архитектура',
  'nature': 'Природа',
  'gastronomy': 'Гастрономия',
  'active-rest': 'Активный отдых',
  'discount': 'Со скидкой',
  'new': 'Новые',
  'best': 'Лучшие',
}

/**
 * Обратный маппинг: название -> slug
 */
const nameToSlugMap: Record<string, string> = {}

// Создаем обратный маппинг из citySlugMap
Object.entries(citySlugMap).forEach(([slug, name]) => {
  nameToSlugMap[name] = slug
})

// Создаем обратный маппинг из countrySlugMap
Object.entries(countrySlugMap).forEach(([slug, name]) => {
  nameToSlugMap[name] = slug
})

// Создаем обратный маппинг из categorySlugMap
Object.entries(categorySlugMap).forEach(([slug, name]) => {
  nameToSlugMap[name] = slug
})

/**
 * Универсальный маппинг для всех типов
 */
const slugToNameMap: Record<string, string> = {
  ...citySlugMap,
  ...countrySlugMap,
  ...categorySlugMap,
}

/**
 * Получить slug города по названию
 */
export function getCitySlug(cityName: string): string {
  return nameToSlugMap[cityName] || nameToSlug(cityName)
}

/**
 * Получить название города по slug
 */
export function getCityName(citySlug: string): string | null {
  return citySlugMap[citySlug] || null
}

/**
 * Получить slug страны по названию
 */
export function getCountrySlug(countryName: string): string {
  return nameToSlugMap[countryName] || nameToSlug(countryName)
}

/**
 * Получить название страны по slug
 */
export function getCountryName(countrySlug: string): string | null {
  return countrySlugMap[countrySlug] || null
}

/**
 * Получить slug категории по названию
 */
export function getCategorySlug(categoryName: string): string {
  return nameToSlugMap[categoryName] || nameToSlug(categoryName)
}

/**
 * Получить название категории по slug
 */
export function getCategoryName(categorySlug: string): string | null {
  return categorySlugMap[categorySlug] || null
}

