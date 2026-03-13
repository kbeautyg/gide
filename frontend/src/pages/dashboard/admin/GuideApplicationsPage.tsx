import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { adminApi } from '@/lib/api'
import { User, CheckCircle, XCircle, Phone, Mail } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function GuideApplicationsPage() {
  const queryClient = useQueryClient()

  // Загрузка заявок
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['guide-applications'],
    queryFn: async () => {
      const response = await adminApi.getGuideApplications()
      return response.data
    },
  })

  // Одобрение
  const approveMutation = useMutation({
    mutationFn: (userId: string) => adminApi.approveGuideApplication(userId),
    onSuccess: () => {
      toast.success('Заявка одобрена', 'Пользователь получил статус гида')
      queryClient.invalidateQueries({ queryKey: ['guide-applications'] })
    },
    onError: () => {
      toast.error('Ошибка', 'Не удалось одобрить заявку')
    }
  })

  // Отклонение
  const rejectMutation = useMutation({
    mutationFn: (userId: string) => adminApi.rejectGuideApplication(userId),
    onSuccess: () => {
      toast.success('Заявка отклонена')
      queryClient.invalidateQueries({ queryKey: ['guide-applications'] })
    },
    onError: () => {
      toast.error('Ошибка', 'Не удалось отклонить заявку')
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600">
        Ошибка загрузки заявок. Попробуйте обновить страницу.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Заявки гидов</h1>
        <p className="text-gray-500 mt-2">
          Пользователи, подавшие заявку на статус гида
        </p>
      </div>

      {!users || users.length === 0 ? (
        <Card className="bg-gray-50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Нет новых заявок</h3>
            <p className="text-gray-500 mt-1">
              На данный момент нет пользователей, ожидающих проверки.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">
                        {user.name?.[0] || user.phone?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name || 'Без имени'}
                      </h3>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {user.phone}
                        </div>
                        {user.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100">
                    <Button 
                      variant="outline" 
                      className="border-green-200 hover:bg-green-50 text-green-700 hover:text-green-800"
                      onClick={() => approveMutation.mutate(user.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Одобрить
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-200 hover:bg-red-50 text-red-700 hover:text-red-800"
                      onClick={() => rejectMutation.mutate(user.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <XCircle size={16} className="mr-2" />
                      Отклонить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
