import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateTourDialog } from '@/components/CreateTourDialog'
import { MarkAsPaidDialog } from '@/components/MarkAsPaidDialog'
import { MapPin, Clock, Star, Edit, Trash2, Link as LinkIcon, Copy, CheckCircle, ExternalLink } from 'lucide-react'
import { toursApi } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function MyToursPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<any>(null)
  
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours', 'mine'],
    queryFn: () => toursApi.getMine(),
  })

  const tours = toursData?.data?.tours || []

  const copyTourLink = (tourId: number, shareCode: string | number) => {
    const link = `${window.location.origin}/t/${shareCode}`
    navigator.clipboard.writeText(link)
    setCopiedId(tourId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleMarkAsPaid = (tour: any) => {
    setSelectedTour(tour)
    setMarkPaidOpen(true)
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Мои экскурсии</h1>
          <p className="text-sm md:text-base text-gray-600">Управление вашими экскурсиями</p>
        </div>
        <CreateTourDialog />
      </div>

      {isLoading ? (
        <p className="text-center py-8 md:py-12 text-sm md:text-base text-gray-600">Загрузка...</p>
      ) : tours.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 md:py-12">
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
              У вас пока нет экскурсий. Создайте первую!
            </p>
            <CreateTourDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="flex flex-col">
              <div className="relative">
                <img
                  src={tour.photos[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800'}
                  alt={tour.title}
                  className="w-full h-40 md:h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                  {formatRUB(tour.price)}
                </div>
              </div>

              <CardHeader className="pb-2 md:pb-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                  <MapPin size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">{tour.location}</span>
                  <Clock size={14} className="ml-auto md:w-4 md:h-4 flex-shrink-0" />
                  <span>{tour.duration} ч</span>
                </div>
                <CardTitle className="text-base md:text-lg line-clamp-2">{tour.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Star className="fill-yellow-400 text-yellow-400" size={14} />
                  <span className="font-semibold">{tour.rating}</span>
                  <span className="text-gray-600">({tour.reviews_count})</span>
                </div>

                {/* Мини-статистика */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-[10px] md:text-xs text-gray-600">Оплат</p>
                    <p className="text-base md:text-lg font-bold text-blue-600">{tour.bookings_count || 0}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-[10px] md:text-xs text-gray-600">Заработано</p>
                    <p className="text-base md:text-lg font-bold text-green-600">{formatRUB(tour.total_revenue || 0)}</p>
                  </div>
                </div>

                {/* Ссылка на экскурсию */}
                <div className="bg-gradient-to-r from-tropical-ocean/10 to-tropical-turquoise/10 p-2 md:p-3 rounded-lg border-2 border-tropical-ocean/30">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                    <LinkIcon size={12} className="text-tropical-ocean md:w-3.5 md:h-3.5" />
                    <span className="text-[10px] md:text-xs font-semibold text-tropical-ocean">Платёжная ссылка</span>
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-700 break-all mb-1 md:mb-2 bg-white p-1.5 md:p-2 rounded font-mono">
                    {window.location.origin}/t/{tour.share_code || tour.id}
                  </div>
                  <div className="flex gap-1 md:gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-[10px] md:text-xs h-7 md:h-8"
                      onClick={() => copyTourLink(tour.id, tour.share_code || tour.id)}
                    >
                      {copiedId === tour.id ? (
                        <>
                          <CheckCircle size={12} className="mr-1" />
                          Скопировано!
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="mr-1" />
                          Копировать
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 md:h-8 px-2 md:px-3"
                      onClick={() => window.open(`/t/${tour.share_code || tour.id}`, '_blank')}
                    >
                      <ExternalLink size={12} />
                    </Button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-2 pt-3 md:pt-4">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-xs md:text-sm h-8 md:h-9"
                  onClick={() => handleMarkAsPaid(tour)}
                >
                  <CheckCircle size={14} className="mr-1" />
                  Оплачено
                </Button>
                <div className="flex gap-2 w-full sm:flex-1">
                  <Button variant="outline" size="sm" className="flex-1 text-xs md:text-sm h-8 md:h-9">
                    <Edit size={14} className="mr-1" />
                    <span className="hidden sm:inline">Редактировать</span>
                    <span className="sm:hidden">Ред.</span>
                  </Button>
                  <Button variant="destructive" size="sm" className="px-2 md:px-3 h-8 md:h-9">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Mark As Paid Dialog */}
      {selectedTour && (
        <MarkAsPaidDialog
          open={markPaidOpen}
          onOpenChange={setMarkPaidOpen}
          tour={selectedTour}
        />
      )}
    </div>
  )
}
