import { motion } from 'framer-motion'
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs'
import { parseCountryFromLocation, parseCityFromLocation, isCityLocation, isCountryLocation } from '@/lib/navigationUtils'

interface CityHeroProps {
  location?: string // location из navigation state
  activeRubric?: string // активная рубрика (если выбрана)
  toursCount: number
  hasFilters?: boolean // есть ли фильтры (themes, landmarks, tags)
}

export function CityHero({ location, activeRubric, toursCount, hasFilters }: CityHeroProps) {
  // Парсим город и страну
  const city = location ? parseCityFromLocation(location) : null
  const country = location ? parseCountryFromLocation(location) : null
  const isCity = location ? isCityLocation(location) : false
  const isCountry = location ? isCountryLocation(location) : false
  
  // Формируем breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = []
  breadcrumbs.push({ label: 'Главная', href: '/' })
  
  // Если это город, добавляем страну
  if (country && isCity) {
    breadcrumbs.push({ 
      label: country, 
      href: `/tours?location=${encodeURIComponent(country)}` 
    })
  }
  
  // Добавляем город или страну как последний элемент (без ссылки)
  if (city && isCity) {
    breadcrumbs.push({ label: city })
  } else if (isCountry && location) {
    breadcrumbs.push({ label: location })
  } else if (location) {
    breadcrumbs.push({ label: location })
  }
  
  // Формируем заголовок
  let title = 'Все экскурсии'
  if (activeRubric && city) {
    title = `${activeRubric} экскурсии в ${city}`
  } else if (activeRubric && country) {
    title = `${activeRubric} экскурсии в ${country}`
  } else if (activeRubric && location) {
    title = `${activeRubric} экскурсии в ${location}`
  } else if (activeRubric && hasFilters) {
    title = `${activeRubric} экскурсии`
  } else if (city) {
    title = `Экскурсии в ${city}`
  } else if (country || isCountry) {
    title = `Экскурсии в ${location}`
  } else if (hasFilters) {
    title = 'Экскурсии по фильтрам'
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {breadcrumbs.length > 1 && <Breadcrumbs items={breadcrumbs} />}
        
          <motion.div
          initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {title}
                </h1>
          
          {toursCount > 0 && (
            <p className="text-gray-600">
                  {toursCount} {toursCount === 1 ? 'экскурсия' : toursCount < 5 ? 'экскурсии' : 'экскурсий'} на русском языке
                </p>
            )}
          </motion.div>
        </div>
      </div>
  )
}
