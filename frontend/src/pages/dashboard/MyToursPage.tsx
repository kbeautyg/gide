import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateTourDialog } from '@/components/CreateTourDialog'
import { PaymentDialog } from '@/components/PaymentDialog'
import { MapPin, Clock, Star, Edit, Trash2, Link as LinkIcon, Copy, CheckCircle, CreditCard, ExternalLink } from 'lucide-react'
import { toursApi } from '@/lib/api'
import { formatRUB } from '@/lib/utils'

export default function MyToursPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<any>(null)
  
  const { data: toursData, isLoading, refetch } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList(),
  })

  const tours = toursData?.data?.tours || []

  const copyTourLink = (tourId: number) => {
    const link = `${window.location.origin}/private-tour/${tourId}`
    navigator.clipboard.writeText(link)
    setCopiedId(tourId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handlePaymentClick = (tour: any) => {
    setSelectedTour(tour)
    setPaymentDialogOpen(true)
  }

  const handlePaymentSuccess = () => {
    refetch() // Обновляем список экскурсий
    // Обновляем статистику дашборда
    window.location.reload() // Простое решение для обновления всех данных
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Мои экскурсии</h1>
          <p className="text-gray-600">Управление вашими экскурсиями</p>
        </div>
        <CreateTourDialog />
      </div>

      {isLoading ? (
        <p className="text-center py-12 text-gray-600">Загрузка...</p>
      ) : tours.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">
              У вас пока нет экскурсий. Создайте первую!
            </p>
            <CreateTourDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="flex flex-col">
              <div className="relative">
                <img
                  src={tour.photos[0] || 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800'}
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
                  <Clock size={16} className="ml-auto" />
                  <span>{tour.duration} ч</span>
                </div>
                <CardTitle className="text-lg">{tour.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <span className="font-semibold">{tour.rating}</span>
                  <span className="text-gray-600">({tour.reviews_count} отзывов)</span>
                </div>

                {/* Ссылка на экскурсию */}
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon size={14} className="text-tropical-ocean" />
                    <span className="text-xs font-semibold text-gray-700">Ссылка на экскурсию</span>
                  </div>
                  <div className="text-xs text-gray-600 break-all mb-2">
                    {window.location.origin}/private-tour/{tour.id}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => copyTourLink(tour.id)}
                    >
                      {copiedId === tour.id ? (
                        <>
                          <CheckCircle size={14} className="mr-1" />
                          Скопировано!
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="mr-1" />
                          Копировать
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => window.open(`/private-tour/${tour.id}`, '_blank')}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </div>

                {/* Оплата */}
                <Button
                  variant="tropical"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handlePaymentClick(tour)}
                >
                  <CreditCard size={14} className="mr-1" />
                  Оплачено
                </Button>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit size={16} className="mr-1" />
                  Редактировать
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 size={16} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог оплаты */}
      {selectedTour && (
        <PaymentDialog
          tour={selectedTour}
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
