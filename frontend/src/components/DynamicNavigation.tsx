import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Loader2, MapPin, Tag, Compass, Grid, ArrowRight } from 'lucide-react'

interface NavigationItem {
  name: string
  count: number
  type: string
}

interface DynamicNavigationProps {
  section?: 'landmarks' | 'tags' | 'themes' | 'categories' | 'locations' | 'all'
  limit?: number
  showIcons?: boolean
}

export function DynamicNavigation({ 
  section = 'all', 
  limit = 12,
  showIcons = true
}: DynamicNavigationProps) {
  const { data: navigationData, isLoading } = useQuery({
    queryKey: ['dynamic-navigation'],
    queryFn: () => api.get('/tours/dynamic-navigation').then(res => res.data.data),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-airbnb-rausch" size={32} />
      </div>
    )
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'landmark':
        // Теперь landmark тоже отображается как рубрика с компасом
        return <Compass size={18} className="text-airbnb-rausch" />
      case 'tag':
        return <Tag size={18} className="text-blue-500" />
      case 'theme':
        return <Compass size={18} className="text-airbnb-rausch" />
      case 'category':
        return <Grid size={18} className="text-green-500" />
      case 'location':
        return <MapPin size={18} className="text-orange-500" />
      default:
        return <Grid size={18} className="text-gray-500" />
    }
  }

  const getSectionTitle = (type: string) => {
    switch (type) {
      case 'landmarks':
        return 'Рубрики'
      case 'tags':
        return 'Теги'
      case 'themes':
        return 'Рубрики'
      case 'categories':
        return 'Категории'
      case 'locations':
        return 'Направления'
      default:
        return ''
    }
  }

  const getFilterLink = (item: NavigationItem) => {
    const params = new URLSearchParams()
    
    switch (item.type) {
      case 'landmark':
        // Теперь достопримечательности тоже идут в themes (объединены с рубриками)
        params.append('themes', item.name)
        break
      case 'tag':
        params.append('tags', item.name)
        break
      case 'theme':
        params.append('themes', item.name)
        break
      case 'category':
        // Используем themes вместо category для единообразия
        params.append('themes', item.name)
        break
      case 'location':
        params.append('location', item.name.split(',')[0].trim())
        break
    }
    
    return `/tours?${params.toString()}`
  }

  const renderSection = (sectionName: string, items: NavigationItem[]) => {
    if (!items || items.length === 0) return null
    
    const displayItems = items.slice(0, limit)

    return (
      <div key={sectionName} className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          {showIcons && getSectionIcon(items[0]?.type)}
          {getSectionTitle(sectionName)}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ y: -4 }}
            >
              <Link to={getFilterLink(item)} className="block">
                <div className="group cursor-pointer bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-airbnb-rausch hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    {showIcons && (
                      <div className="flex-shrink-0 mt-0.5 transform scale-90">
                        {getSectionIcon(item.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm mb-1 group-hover:text-airbnb-rausch transition-colors line-clamp-2">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        Экскурсии по этой теме
                      </div>
                    </div>
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 text-airbnb-rausch opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight size={16} />
                    </motion.div>
                  </div>
                  <div className="mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-gray-600">
                        {item.count} {item.count === 1 ? 'экскурсия' : item.count < 5 ? 'экскурсии' : 'экскурсий'}
                      </div>
                      <div className="text-[10px] text-airbnb-rausch font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Смотреть →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (section === 'all') {
    // Показываем только themes (рубрики), landmarks показываем отдельно если нужно
    // Фильтруем только темы с хотя бы 1 туром
    const themesOnly = (navigationData?.themes || [])
      .filter((t: NavigationItem) => t.count > 0)
      .sort((a: NavigationItem, b: NavigationItem) => b.count - a.count)
    
    return (
      <div>
        {themesOnly.length > 0 && renderSection('themes', themesOnly)}
      </div>
    )
  }

  const sectionData = navigationData?.[section]
  if (!sectionData) return null

  return renderSection(section, sectionData)
}


