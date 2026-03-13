import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MapPin, Star, ArrowRight } from 'lucide-react'
import { toursApi } from '@/lib/api'
import { formatRUB, getImageUrl } from '@/lib/utils'
import { useFavorites } from '@/lib/favorites'

// Re-export для обратной совместимости (если кто-то ещё импортирует отсюда)
export { useFavorites, useFavoritesStore } from '@/lib/favorites'

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites()

  // Загружаем ВСЕ туры, чтобы отфильтровать избранные
  // page_size=500 — бэкенд ограничен le=500
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours', 'all-for-favorites', favorites],
    queryFn: async () => {
      // Загружаем несколько страниц если нужно
      const firstPage = await toursApi.getList({ page_size: 100, page: 1 })
      const total = firstPage.data.total
      const allTours = [...firstPage.data.tours]

      // Если есть ещё страницы, догружаем
      if (total > 100) {
        const pages = Math.ceil(total / 100)
        const promises = []
        for (let p = 2; p <= pages; p++) {
          promises.push(toursApi.getList({ page_size: 100, page: p }))
        }
        const results = await Promise.all(promises)
        for (const res of results) {
          allTours.push(...res.data.tours)
        }
      }

      return allTours
    },
    enabled: favorites.length > 0,
  })

  const allTours = toursData || []
  const favoriteTours = allTours.filter((tour: any) => favorites.includes(tour.id))

  if (isLoading && favorites.length > 0) {
    return <div className="text-center py-20 text-gray-500">Загрузка...</div>
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Избранное</h1>
          <p className="text-sm text-gray-600">Сохраненные экскурсии ({favoriteTours.length})</p>
        </div>
      </div>

      {favoriteTours.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Heart size={32} className="text-pink-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Список избранного пуст</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Сохраняйте понравившиеся экскурсии, чтобы не потерять их и вернуться к бронированию позже.
            </p>
            <Link to="/tours">
              <Button className="bg-airbnb-rausch hover:bg-airbnb-rausch/90 gap-2">
                Перейти в каталог <ArrowRight size={16} />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteTours.map((tour: any) => (
            <Card key={tour.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <Link to={`/tours/${tour.id}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  {tour.photos?.[0] ? (
                    <img
                      src={getImageUrl(tour.photos[0])}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                      <MapPin size={32} className="text-pink-400" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleFavorite(tour.id)
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm text-pink-500 hover:text-pink-600"
                  >
                    <Heart size={18} className="fill-current" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                    {formatRUB(tour.price)}
                  </div>
                </div>
              </Link>

              <CardContent className="p-4">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <MapPin size={12} />
                  {tour.location}
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {tour.title}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-sm text-yellow-500 font-medium">
                    <Star size={16} className="fill-current" />
                    {tour.rating || 'New'}
                    <span className="text-gray-400 text-xs font-normal ml-1">({tour.reviews_count})</span>
                  </div>
                  <Link to={`/tours/${tour.id}`}>
                    <Button size="sm" variant="outline" className="h-8">
                      Подробнее
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
