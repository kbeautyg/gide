import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'

export default function CreateTourFromRequest() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const [shareLink, setShareLink] = useState<string>('')

  // Загрузка заявки
  const { data: request, isLoading } = useQuery({
    queryKey: ['request', requestId],
    queryFn: () => api.get(`/requests/${requestId}`).then(res => res.data),
    enabled: !!requestId,
  })

  // Создание тура из заявки
  const createTourMutation = useMutation({
    mutationFn: () => api.post(`/custom-tours/from-request/${requestId}`),
    onSuccess: (response) => {
      const link = `${window.location.origin}/tours/${response.data.share_code}`
      setShareLink(link)
    },
    onError: (error: any) => {
      alert(`❌ ${error.response?.data?.detail || 'Ошибка при создании тура'}`)
    }
  })

  const handleCreateTour = () => {
    if (confirm('Создать тур из этой заявки? Данные будут заполнены автоматически.')) {
      createTourMutation.mutate()
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    alert('✅ Ссылка скопирована!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-rausch mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка заявки...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Заявка не найдена</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Создание тура из заявки</h1>
        <p className="text-gray-600 mb-8">
          Данные будут автоматически заполнены из заявки клиента
        </p>

        {/* Предупреждение */}
        <Alert className="mb-6 bg-orange-50 border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Важно:</strong> Данные заполняются автоматически из заявки клиента. 
            Не рекомендуется изменять цену, дату и описание после создания тура.
          </AlertDescription>
        </Alert>

        {/* Предпросмотр данных заявки */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Данные заявки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Название</label>
              <p className="mt-1 text-gray-900">{request.title}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Описание</label>
              <p className="mt-1 text-gray-700">{request.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Локация</label>
                <p className="mt-1 text-gray-900">{request.location || 'Не указана'}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Длительность</label>
                <p className="mt-1 text-gray-900">{request.duration_hours} часов</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Количество гостей</label>
                <p className="mt-1 text-gray-900">{request.participants_count} чел.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Бюджет</label>
                <p className="mt-1 text-gray-900">
                  {request.budget ? `${request.budget.toLocaleString('ru')} ₽` : 'Не указан'}
                </p>
              </div>

              {request.preferred_date && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Предпочтительная дата</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(request.preferred_date).toLocaleDateString('ru')}
                  </p>
                </div>
              )}

              {request.telegram_username && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Telegram</label>
                  <p className="mt-1 text-gray-900">{request.telegram_username}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Результат создания */}
        {shareLink ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-bold text-green-900">Тур успешно создан!</h3>
                </div>

                <p className="text-green-800 mb-4">
                  Уникальная ссылка на тур создана. Отправьте её клиенту:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg text-gray-900"
                  />
                  <Button
                    onClick={copyLink}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    onClick={() => window.open(shareLink, '_blank')}
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50"
                  >
                    <ExternalLink size={16} />
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate('/dashboard/my-tours')}
                      className="flex-1 bg-airbnb-rausch hover:bg-airbnb-rausch/90"
                    >
                      Перейти к моим турам
                    </Button>
                    <Button
                      onClick={() => navigate('/dashboard/calendar')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Открыть календарь
                    </Button>
                  </div>
                  <Button
                    onClick={() => navigate('/dashboard/requests')}
                    variant="outline"
                    className="w-full"
                  >
                    Вернуться к заявкам
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleCreateTour}
              disabled={createTourMutation.isPending}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              {createTourMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Создание...
                </>
              ) : (
                'Создать тур'
              )}
            </Button>
            <Button
              onClick={() => navigate('/dashboard/requests')}
              variant="outline"
            >
              Отмена
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

