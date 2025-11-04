import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getCityName, getCountryName, getCategoryName } from '@/lib/urlSlugs'
import { buildExperienceUrl, buildDestinationUrl, buildCategoryUrl } from '@/lib/routing'

/**
 * Компонент для редиректов со старых URL на новые (обратная совместимость)
 * Используется в ToursPage для обработки старых query параметров
 */
export function LegacyRedirects() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  useEffect(() => {
    const location = searchParams.get('location')
    const themes = searchParams.get('themes')
    const category = searchParams.get('category') // Старый параметр
    
    // Если нет location, ничего не делаем (остаемся на /tours)
    if (!location) return
    
    // Определяем тип локации (город или страна)
    const KNOWN_CITIES = [
      'Бангкок', 'Пхукет', 'Паттайя', 'Краби', 'Чиангмай', 'Ко Тао', 'Ко Самуи', 'Хуа Хин',
      'Дубай', 'Абу-Даби', 'Шарджа', 'Аджман',
      'Токио', 'Киото', 'Осака', 'Хиросима', 'Нара', 'Фукуока', 'Саппоро',
      'Сеул', 'Пусан', 'Чеджу', 'Инчхон',
      'Убуд', 'Семиньяк', 'Нуса-Дуа', 'Джакарта', 'Джокьякарта', 'Ломбок',
      'Ханой', 'Хошимин', 'Халонг', 'Нячанг', 'Далат', 'Хойан', 'Хюэ',
      'Сингапур',
      'Пекин', 'Шанхай', 'Сиань', 'Гуанчжоу', 'Ченду', 'Гонконг',
      'Дели', 'Мумбаи', 'Джайпур', 'Агра', 'Гоа', 'Варанаси', 'Удайпур',
      'Куала-Лумпур', 'Пенанг', 'Лангкави', 'Малакка'
    ]
    
    const locationParts = location.split(',')
    const firstLocation = locationParts[0].trim()
    const isCity = KNOWN_CITIES.includes(firstLocation)
    
    // Строим новый URL
    let newUrl = ''
    
    if (isCity) {
      // Это город
      const categoryParam = themes || category
      if (categoryParam) {
        // Если есть категория, переходим на страницу категории
        newUrl = buildCategoryUrl(firstLocation, categoryParam)
      } else {
        // Переходим на страницу города
        newUrl = buildExperienceUrl(firstLocation)
      }
    } else {
      // Это страна
      newUrl = buildDestinationUrl(firstLocation)
    }
    
    // Копируем остальные параметры (цена, длительность, рейтинг и т.д.)
    const otherParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      if (!['location', 'themes', 'category'].includes(key)) {
        otherParams.append(key, value)
      }
    })
    
    const queryString = otherParams.toString()
    const finalUrl = queryString ? `${newUrl}?${queryString}` : newUrl
    
    // Выполняем редирект
    navigate(finalUrl, { replace: true })
  }, [searchParams, navigate])
  
  return null
}

