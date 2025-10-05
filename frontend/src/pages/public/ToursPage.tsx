import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Star, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toursApi } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function ToursPage() {
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  })

  // Загрузка экскурсий
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours', filters],
    queryFn: () => toursApi.getList({
      location: filters.location || undefined,
      category: filters.category || undefined,
      min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
      max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    }),
  })

  const tours = toursData?.data?.tours || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gradient">
            ThaiGuide Pro
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/tours" className="text-tropical-ocean font-semibold">
              Экскурсии
            </Link>
            <Link to="/about" className="hover:text-tropical-ocean transition-colors">
              О нас
            </Link>
            <Link to="/contacts" className="hover:text-tropical-ocean transition-colors">
              Контакты
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-gradient-to-r from-tropical-turquoise to-tropical-ocean text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Экскурсии по всей Азии</h1>
          <p className="text-xl text-white/90">
            Выберите из {tours.length}+ незабываемых туров
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter size={20} />
                  Фильтры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Поиск</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Название экскурсии..."
                      className="pl-10"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Локация</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  >
                    <option value="">Все локации</option>
                    <option value="Пхукет">Пхукет</option>
                    <option value="Паттайя">Паттайя</option>
                    <option value="Бангкок">Бангкок</option>
                    <option value="Краби">Краби</option>
                    <option value="Самуи">Самуи</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Категория</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">Все категории</option>
                    <option value="Культура и история">Культура и история</option>
                    <option value="Природа и пляжи">Природа и пляжи</option>
                    <option value="Приключения">Приключения</option>
                    <option value="Гастрономия">Гастрономия</option>
                    <option value="Водные развлечения">Водные развлечения</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Цена</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="От"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="До"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setFilters({
                    location: '',
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                    search: '',
                  })}
                >
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Tours Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Загрузка экскурсий...</p>
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Экскурсии не найдены</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    Найдено экскурсий: <span className="font-semibold">{tours.length}</span>
                  </p>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tours.map((tour) => (
                    <Link to={`/tours/${tour.id}`} key={tour.id}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <div className="relative">
                          <img
                            src={tour.photos[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop'}
                            alt={tour.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                            {formatRUB(tour.price)}
                          </div>
                        </div>

                        <CardHeader>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin size={16} />
                            <span>{tour.location}</span>
                            <span className="ml-auto">{tour.duration} ч</span>
                          </div>
                          <CardTitle className="text-lg leading-tight">{tour.title}</CardTitle>
                        </CardHeader>

                        <CardFooter className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="fill-yellow-400 text-yellow-400" size={16} />
                            <span className="font-semibold">{tour.rating}</span>
                            <span className="text-gray-600 text-sm">({tour.reviews_count})</span>
                          </div>
                          <Button variant="tropical" size="sm">Подробнее</Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
