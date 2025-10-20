import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Loader2, MapPin, Tag, Compass, Grid } from 'lucide-react'

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
        return <MapPin size={18} className="text-airbnb-rausch" />
      case 'tag':
        return <Tag size={18} className="text-blue-500" />
      case 'theme':
        return <Compass size={18} className="text-purple-500" />
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
        return 'Достопримечательности'
      case 'tags':
        return 'Теги'
      case 'themes':
        return 'Темы'
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
        params.append('landmarks', item.name)
        break
      case 'tag':
        params.append('tags', item.name)
        break
      case 'theme':
        params.append('themes', item.name)
        break
      case 'category':
        params.append('category', item.name)
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Link to={getFilterLink(item)}>
                <div className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-airbnb-rausch hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-airbnb-rausch transition-colors line-clamp-2">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.count} {item.count === 1 ? 'экскурсия' : item.count < 5 ? 'экскурсии' : 'экскурсий'}
                      </div>
                    </div>
                    {showIcons && (
                      <div className="ml-2">
                        {getSectionIcon(item.type)}
                      </div>
                    )}
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
    return (
      <div className="space-y-8">
        {navigationData?.landmarks && renderSection('landmarks', navigationData.landmarks)}
        {navigationData?.themes && renderSection('themes', navigationData.themes)}
        {navigationData?.categories && renderSection('categories', navigationData.categories)}
        {navigationData?.tags && renderSection('tags', navigationData.tags)}
        {navigationData?.locations && renderSection('locations', navigationData.locations)}
      </div>
    )
  }

  const sectionData = navigationData?.[section]
  if (!sectionData) return null

  return renderSection(section, sectionData)
}


