import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CreateTourDialog } from '@/components/CreateTourDialog'
import { MapPin, Clock, Star, Edit, Trash2, Link as LinkIcon, Copy, CheckCircle, Calendar as CalendarIcon, ShoppingBag, Plus } from 'lucide-react'
import { toursApi } from '@/lib/api'
import { formatRUB, getImageUrl } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

export default function MyToursPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; tour: any | null }>({ open: false, tour: null })
  
  // Автообновление данных через WebSocket + polling fallback
  useAutoRefresh({
    queryKeys: [['tours']],
    intervalMs: 15000,
  })

  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList({ include_private: true }),
  })

  const allTours = toursData?.data?.tours || []
  
  // Фильтруем архивные туры (скрываем после оплаты)
  const tours = allTours.filter((tour: any) => !tour.is_archived)

  // Mutation для удаления тура
  const deleteMutation = useMutation({
    mutationFn: (tourId: number) => toursApi.delete(tourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      toast.success('Экскурсия удалена')
      setDeleteConfirm({ open: false, tour: null })
    },
    onError: (error: any) => {
      toast.error('Ошибка при удалении', error.response?.data?.detail)
    }
  })

  const copyTourLink = (tourId: number, shareCode: string | number) => {
    const link = `${window.location.origin}/t/${shareCode}`
    navigator.clipboard.writeText(link)
    setCopiedId(tourId)
    toast.success('Ссылка скопирована!', 'Теперь можно отправить её клиенту')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleEdit = (tour: any) => {
    navigate(`/dashboard/tours/edit/${tour.id}`)
  }

  const handleDelete = (tour: any) => {
    setDeleteConfirm({ open: true, tour })
  }

  const confirmDelete = () => {
    if (deleteConfirm.tour) {
      deleteMutation.mutate(deleteConfirm.tour.id)
    }
  }

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Мои экскурсии</h1>
          <p className="text-sm text-gray-600">Управление вашим каталогом ({tours.length})</p>
        </div>
        <CreateTourDialog>
            <Button className="bg-airbnb-rausch hover:bg-airbnb-rausch/90 text-white gap-2 shadow-sm">
                <Plus size={18} />
                Создать экскурсию
            </Button>
        </CreateTourDialog>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-airbnb-rausch rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Загружаем ваши экскурсии...</p>
        </div>
      ) : tours.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Здесь пока пусто</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              У вас еще нет активных экскурсий. Создайте свою первую экскурсию или используйте конструктор из заявки.
            </p>
            <CreateTourDialog>
                <Button size="lg" className="bg-airbnb-rausch hover:bg-airbnb-rausch/90">
                    <Plus size={20} className="mr-2" />
                    Создать первую экскурсию
                </Button>
            </CreateTourDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} id={`tour-${tour.id}`} className="flex flex-col group hover:shadow-lg transition-all duration-300 border-gray-200">
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                {tour.photos?.[0] ? (
                <img
                    src={getImageUrl(tour.photos[0])}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <MapPin size={32} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/50 to-transparent"></div>
                <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-sm font-bold shadow-sm">
                        {formatRUB(tour.price)}
                    </span>
                </div>
                {tour.is_public && (
                     <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium shadow-sm">
                        Опубликован
                     </div>
                )}
              </div>

              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        {tour.location}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {tour.duration} ч
                    </div>
                </div>
                <CardTitle className="text-lg leading-snug line-clamp-2 group-hover:text-airbnb-rausch transition-colors cursor-pointer" onClick={() => handleEdit(tour)}>
                    {tour.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 p-4 pt-0 space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm border-b pb-3 pt-1">
                  <div className="flex items-center gap-1.5 text-yellow-500 font-medium">
                    <Star size={16} className="fill-yellow-500" />
                    {tour.rating || 'New'}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <ShoppingBag size={16} />
                    {tour.total_bookings || 0} продаж
                  </div>
                </div>

                {/* Dates if any */}
                {tour.start_date && (
                    <div className="bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-md flex items-center gap-2">
                        <CalendarIcon size={14} />
                        <span className="font-medium">
                            {new Date(tour.start_date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                )}
                
                {/* Link Box */}
                <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-between border">
                    <div className="flex items-center gap-2 text-xs text-gray-500 truncate mr-2">
                        <LinkIcon size={14} />
                        <span className="truncate">.../t/{tour.share_code || tour.id}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-gray-500 hover:text-airbnb-rausch hover:bg-white"
                      onClick={() => copyTourLink(tour.id, tour.share_code || tour.id)}
                      title="Копировать ссылку"
                    >
                       {copiedId === tour.id ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                    </Button>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => handleEdit(tour)}
                  >
                    <Edit size={14} className="mr-1.5" />
                    Ред.
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                    onClick={() => handleDelete(tour)}
                  >
                    <Trash2 size={14} className="mr-1.5" />
                    Удалить
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* ConfirmDialog для удаления */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, tour: open ? deleteConfirm.tour : null })}
        title="Удалить экскурсию?"
        description={
          deleteConfirm.tour ? (
            <div className="space-y-2">
              <p>Вы действительно хотите удалить экскурсию:</p>
              <p className="font-semibold text-gray-900">"{deleteConfirm.tour.title}"</p>
              <p className="text-sm text-red-600">Это действие нельзя отменить!</p>
            </div>
          ) : ''
        }
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
