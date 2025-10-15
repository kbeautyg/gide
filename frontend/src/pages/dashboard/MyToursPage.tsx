import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CreateTourDialog } from '@/components/CreateTourDialog'
import { MarkAsPaidDialog } from '@/components/MarkAsPaidDialog'
import { MapPin, Clock, Star, Edit, Trash2, Link as LinkIcon, Copy, CheckCircle, ExternalLink, Calendar as CalendarIcon, ShoppingBag, User, Phone, Mail, Info } from 'lucide-react'
import { toursApi } from '@/lib/api'
import { formatRUB } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

export default function MyToursPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
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

  // Mutation для обновления тура
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => toursApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      setEditOpen(false)
      setEditData(null)
      toast.success('Экскурсия обновлена')
    },
    onError: (error: any) => {
      toast.error('Ошибка при обновлении', error.response?.data?.detail)
    }
  })

  const copyTourLink = (tourId: number, shareCode: string | number) => {
    const link = `${window.location.origin}/t/${shareCode}`
    navigator.clipboard.writeText(link)
    setCopiedId(tourId)
    toast.success('Ссылка скопирована!', 'Теперь можно отправить её клиенту')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleMarkAsPaid = (tour: any) => {
    setSelectedTour(tour)
    setMarkPaidOpen(true)
  }

  const handleEdit = (tour: any) => {
    // Переходим на страницу полного редактирования
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

  const handleUpdate = () => {
    if (!editData) return
    updateMutation.mutate({ id: editData.id, data: editData })
  }

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
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
            <Card key={tour.id} id={`tour-${tour.id}`} className="flex flex-col scroll-mt-24">
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
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 flex-wrap">
                  <MapPin size={16} />
                  <span className="truncate">{tour.location}</span>
                  <Clock size={16} className="ml-auto" />
                  <span>{tour.duration} ч</span>
                </div>
                <div className="flex items-center gap-1 text-xs mb-2">
                  <CalendarIcon size={14} className={tour.start_date ? "text-blue-600" : "text-gray-400"} />
                  <span className={tour.start_date ? "text-blue-600 font-medium" : "text-gray-400 italic"}>
                    {tour.start_date ? (
                      <>
                        {new Date(tour.start_date + 'T00:00:00').toLocaleDateString('ru', { day: 'numeric', month: 'long', weekday: 'short' })}
                        {tour.end_date && tour.start_date !== tour.end_date && (
                          <> — {new Date(tour.end_date + 'T00:00:00').toLocaleDateString('ru', { day: 'numeric', month: 'long' })}</>
                        )}
                      </>
                    ) : (
                      'Дата не назначена'
                    )}
                  </span>
                </div>
                <CardTitle className="text-lg break-words">{tour.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <span className="font-semibold">{tour.rating}</span>
                  <span className="text-gray-600">({tour.reviews_count} отзывов)</span>
                </div>

                {/* Мини-статистика */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Просмотры</p>
                    <p className="text-lg font-bold text-blue-600">{tour.views_count || 0}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Брони</p>
                    <p className="text-lg font-bold text-green-600">{tour.total_bookings || 0}</p>
                  </div>
                </div>

                {/* Данные клиента */}
                {tour.is_custom && (tour.client_name || tour.client_phone || tour.client_email) && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <User size={14} />
                      Данные клиента
                    </h4>
                    <div className="space-y-1 text-xs">
                      {tour.client_name && (
                        <p className="flex items-center gap-1.5">
                          <User size={12} className="text-yellow-700" />
                          {tour.client_name}
                        </p>
                      )}
                      {tour.client_phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone size={12} className="text-yellow-700" />
                          {tour.client_phone}
                        </p>
                      )}
                      {tour.client_email && (
                        <p className="flex items-center gap-1.5">
                          <Mail size={12} className="text-yellow-700" />
                          {tour.client_email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Информация о туре из публичного */}
                {tour.is_custom && (tour.what_to_expect || tour.organizational_details || tour.max_guests || tour.difficulty_level) && (
                  <div className="space-y-2">
                    {tour.what_to_expect && (
                      <div className="bg-blue-50 rounded p-3">
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                          <Info size={14} className="text-blue-600" />
                          Что вас ожидает
                        </h4>
                        <p className="text-xs text-gray-700 line-clamp-3">{tour.what_to_expect}</p>
                      </div>
                    )}
                    
                    {tour.organizational_details && (
                      <div className="bg-green-50 rounded p-3">
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                          <Info size={14} className="text-green-600" />
                          Организационные детали
                        </h4>
                        <p className="text-xs text-gray-700 line-clamp-3">{tour.organizational_details}</p>
                      </div>
                    )}
                    
                    {(tour.max_guests || tour.difficulty_level) && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {tour.max_guests && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-semibold">Макс. группа:</span> {tour.max_guests}
                          </div>
                        )}
                        {tour.difficulty_level && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-semibold">Сложность:</span> {tour.difficulty_level}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Ссылка на экскурсию */}
                <div className="bg-airbnb-rausch/10 p-3 rounded-lg border-2 border-airbnb-rausch/30">
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon size={14} className="text-airbnb-rausch" />
                    <span className="text-xs font-semibold text-airbnb-rausch">Платёжная ссылка</span>
                  </div>
                  <div className="text-xs text-gray-700 break-all mb-2 bg-white p-2 rounded font-mono">
                    {window.location.origin}/t/{tour.share_code || tour.id}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => copyTourLink(tour.id, tour.share_code || tour.id)}
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
                      onClick={() => window.open(`/t/${tour.share_code || tour.id}`, '_blank')}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 pt-4">
                {/* Навигационные кнопки */}
                <div className="flex gap-2 w-full text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/dashboard/calendar?highlight=${tour.start_date || ''}&tour=${tour.id}`)}
                  >
                    <CalendarIcon size={14} className="mr-1" />
                    Календарь
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/dashboard/bookings?tour_id=${tour.id}`)}
                  >
                    <ShoppingBag size={14} className="mr-1" />
                    Заказы
                  </Button>
                </div>
                
                {/* Основные кнопки */}
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleMarkAsPaid(tour)}
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Оплачено
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(tour)}
                  >
                    <Edit size={16} className="mr-1" />
                    Редактировать
                  </Button>
                </div>
                
                {/* Кнопка удаления */}
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="w-full"
                  onClick={() => handleDelete(tour)}
                >
                  <Trash2 size={16} className="mr-1" />
                  Удалить
                </Button>
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

      {/* Edit Tour Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать экскурсию</DialogTitle>
          </DialogHeader>
          
          {editData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Цена (₽)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Длительность (часы)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={editData.duration}
                    onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Локация</Label>
                  <Input
                    id="location"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Input
                    id="category"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-airbnb-rausch hover:bg-airbnb-rausch/90"
                >
                  {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
          ) : (
            ''
          )
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
