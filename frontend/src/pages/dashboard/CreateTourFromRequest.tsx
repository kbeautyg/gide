import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, CheckCircle, Copy, ExternalLink, Sparkles, 
  Calendar, MapPin, Clock, Users, DollarSign, Zap, Star,
  ArrowRight, Gift
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'

export default function CreateTourFromRequest() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [shareLink, setShareLink] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showQR, setShowQR] = useState(false)

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
      const link = `${window.location.origin}/t/${response.data.share_code}`
      setShareLink(link)
      
      // Конфетти анимация!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF385C', '#00A699', '#FC642D', '#FFD700']
      })
      
      toast.success('Тур успешно создан!', 'Уникальная ссылка готова для отправки клиенту')
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['tours'] })
    },
    onError: (error: any) => {
      toast.error('Ошибка при создании тура', error.response?.data?.detail)
    }
  })

  const handleCreateTour = () => {
    setShowConfirm(true)
  }

  const confirmCreateTour = () => {
    createTourMutation.mutate()
    setShowConfirm(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success('Ссылка скопирована!', 'Теперь можно отправить её клиенту')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-airbnb-rausch border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Загрузка заявки...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>Заявка не найдена</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Защита: тур уже создан
  if (request.generated_tour_id && !shareLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="max-w-md mx-auto w-full"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-2xl overflow-hidden">
            <CardContent className="pt-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
              </motion.div>
              
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-blue-900 mb-3"
              >
                Тур уже создан вами
              </motion.h2>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-blue-700 mb-8 text-lg"
              >
                Эта экскурсия уже существует в вашем списке.
                Вы можете перейти к управлению туром.
              </motion.p>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <Button
                  onClick={() => navigate(`/dashboard/my-tours#tour-${request.generated_tour_id}`)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all text-lg py-6"
                  size="lg"
                >
                  <ExternalLink className="mr-2" />
                  Перейти к моим турам
                </Button>
                
                <Button
                  onClick={() => navigate('/dashboard/requests')}
                  variant="outline"
                  className="w-full border-2 border-blue-300 hover:bg-blue-50 text-lg py-6"
                  size="lg"
                >
                  Вернуться к заявкам
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Заголовок с градиентом */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-airbnb-rausch to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-airbnb-rausch via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3"
            >
              Создание тура из заявки
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg"
            >
              Данные будут автоматически заполнены из заявки клиента
            </motion.p>
          </div>

          {!shareLink ? (
            <>
              {/* Предупреждение с градиентом */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Alert className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <AlertDescription className="text-orange-900 pt-1">
                      <strong className="font-bold">Важно:</strong> Данные заполняются автоматически из заявки клиента. 
                      Не рекомендуется изменять цену, дату и описание после создания тура.
                    </AlertDescription>
                  </div>
                </Alert>
              </motion.div>

              {/* Предпросмотр данных заявки - Glassmorphism */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="mb-6 backdrop-blur-lg bg-white/80 border-2 border-white/50 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -z-10" />
                  
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      Данные заявки
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Название */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                    >
                      <label className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4" />
                        Название
                      </label>
                      <p className="text-xl font-semibold text-gray-900">{request.title}</p>
                    </motion.div>

                    {/* Описание */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                    >
                      <label className="text-sm font-bold text-purple-900 mb-2 block">Описание</label>
                      <p className="text-gray-700 leading-relaxed">{request.description}</p>
                    </motion.div>

                    {/* Детали в сетке */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-teal-900 uppercase">Локация</label>
                            <p className="text-lg font-semibold text-gray-900">{request.location || 'Не указана'}</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-orange-900 uppercase">Длительность</label>
                            <p className="text-lg font-semibold text-gray-900">{request.duration_hours} часов</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-pink-900 uppercase">Гостей</label>
                            <p className="text-lg font-semibold text-gray-900">{request.participants_count} чел.</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-green-900 uppercase">Бюджет</label>
                            <p className="text-lg font-semibold text-gray-900">
                              {request.budget ? `${request.budget.toLocaleString('ru')} ₽` : 'Не указан'}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {request.preferred_date && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-blue-900 uppercase">Предпочт. дата</label>
                              <p className="text-lg font-semibold text-gray-900">
                                {new Date(request.preferred_date).toLocaleDateString('ru')}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {request.telegram_username && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-violet-900 uppercase">Telegram</label>
                              <p className="text-lg font-semibold text-gray-900">{request.telegram_username}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Кнопки действий */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3"
              >
                <Button
                  onClick={handleCreateTour}
                  disabled={createTourMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all text-lg py-6 group"
                  size="lg"
                >
                  {createTourMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Создание...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 group-hover:rotate-12 transition-transform" />
                      Создать тур
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => navigate('/dashboard/requests')}
                  variant="outline"
                  className="border-2 hover:bg-gray-50 text-lg py-6"
                  size="lg"
                >
                  Отмена
                </Button>
              </motion.div>
            </>
          ) : (
            /* Карточка успеха с конфетти */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200/30 to-teal-200/30 rounded-full blur-3xl -z-10" />
                
                <CardContent className="pt-8">
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl"
                    >
                      <CheckCircle className="w-14 h-14 text-white" strokeWidth={3} />
                    </motion.div>

                    <motion.h3 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-bold text-green-900 mb-2"
                    >
                      Тур успешно создан!
                    </motion.h3>
                    
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-green-800 text-lg mb-6"
                    >
                      Уникальная ссылка на тур создана. Отправьте её клиенту:
                    </motion.p>

                    {/* QR код и ссылка */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white rounded-2xl p-6 shadow-lg mb-6"
                    >
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0">
                          <QRCodeSVG 
                            value={shareLink} 
                            size={150}
                            level="H"
                            includeMargin
                            className="rounded-lg"
                          />
                          <p className="text-xs text-gray-500 mt-2 text-center">Отсканируй меня</p>
                        </div>
                        
                        <div className="flex-1 w-full">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={shareLink}
                              readOnly
                              className="flex-1 px-4 py-3 bg-gray-50 border-2 border-green-200 rounded-lg text-gray-900 font-mono text-sm"
                            />
                            <Button
                              onClick={copyLink}
                              className="bg-green-600 hover:bg-green-700 shadow-lg"
                            >
                              <Copy size={18} />
                            </Button>
                            <Button
                              onClick={() => window.open(shareLink, '_blank')}
                              variant="outline"
                              className="border-2 border-green-600 text-green-700 hover:bg-green-50"
                            >
                              <ExternalLink size={18} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-3"
                    >
                      <Button
                        onClick={() => navigate('/dashboard/my-tours')}
                        className="w-full bg-gradient-to-r from-airbnb-rausch to-pink-600 hover:from-airbnb-rausch/90 hover:to-pink-600/90 shadow-xl text-lg py-6"
                        size="lg"
                      >
                        Перейти к моим турам
                      </Button>
                      
                      <Button
                        onClick={() => navigate('/dashboard/requests')}
                        variant="outline"
                        className="w-full border-2 border-green-300 hover:bg-green-50 text-lg py-6"
                        size="lg"
                      >
                        Вернуться к заявкам
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* ConfirmDialog для подтверждения создания тура */}
        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title="Создать тур из заявки?"
          description={
            <div className="space-y-3">
              <p>Данные будут заполнены автоматически из заявки клиента:</p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Название:</span> {request?.title}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold">Локация:</span> {request?.location || 'Не указана'}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold">Длительность:</span> {request?.duration_hours} часов
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Бюджет:</span> {request?.budget ? `${request.budget.toLocaleString('ru')} ₽` : 'Не указан'}
                </div>
              </div>
              <p className="text-sm font-semibold text-green-700 bg-green-50 p-3 rounded-lg mt-3">
                ✨ После создания будет сгенерирована уникальная ссылка для клиента
              </p>
            </div>
          }
          confirmText="Создать тур"
          cancelText="Отмена"
          onConfirm={confirmCreateTour}
          variant="default"
          loading={createTourMutation.isPending}
        />
      </div>
    </div>
  )
}
