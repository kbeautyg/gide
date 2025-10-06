import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, Users, DollarSign, Send } from 'lucide-react'
import { api } from '@/lib/api'

export default function CreateRequestPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preferred_date: '',
    participants_count: '',
    budget: '',
    location: '',
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/requests/', data),
    onSuccess: () => {
      alert('✅ Заявка отправлена! Мы свяжемся с вами в ближайшее время.')
      setFormData({
        title: '',
        description: '',
        preferred_date: '',
        participants_count: '',
        budget: '',
        location: '',
      })
    },
    onError: () => {
      alert('❌ Ошибка при отправке заявки. Попробуйте еще раз.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      preferred_date: formData.preferred_date || null,
      participants_count: parseInt(formData.participants_count),
      budget: formData.budget ? parseFloat(formData.budget) : null,
      location: formData.location || null,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-tropical-turquoise to-tropical-ocean text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Не нашли подходящую экскурсию?
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Оставьте заявку, и мы создадим для вас индивидуальную программу
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Заявка на индивидуальную экскурсию</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Название экскурсии *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Например: Романтическая прогулка по Пхукету"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Подробное описание *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Расскажите, что именно вы хотите увидеть, какие места посетить, какие активности включить..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferred_date">Предпочтительная дата</Label>
                      <Input
                        id="preferred_date"
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="participants_count">Количество участников *</Label>
                      <Input
                        id="participants_count"
                        type="number"
                        min="1"
                        value={formData.participants_count}
                        onChange={(e) => setFormData({ ...formData, participants_count: e.target.value })}
                        placeholder="2"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Бюджет (₽)</Label>
                      <Input
                        id="budget"
                        type="number"
                        min="0"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="15000"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Предпочтительная локация</Label>
                      <select
                        id="location"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      >
                        <option value="">Выберите локацию</option>
                        <option value="Пхукет">Пхукет</option>
                        <option value="Паттайя">Паттайя</option>
                        <option value="Бангкок">Бангкок</option>
                        <option value="Краби">Краби</option>
                        <option value="Самуи">Самуи</option>
                        <option value="Пханган">Пханган</option>
                        <option value="Чианг Май">Чианг Май</option>
                        <option value="Другое">Другое</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-tropical-turquoise hover:bg-tropical-turquoise/90"
                    disabled={createMutation.isPending}
                  >
                    <Send className="mr-2" size={18} />
                    {createMutation.isPending ? 'Отправляем...' : 'Отправить заявку'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-tropical-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-tropical-turquoise" size={24} />
                  </div>
                  <CardTitle className="text-lg">Быстрый ответ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Мы ответим на вашу заявку в течение 2-4 часов в рабочее время
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-tropical-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-tropical-coral" size={24} />
                  </div>
                  <CardTitle className="text-lg">Индивидуальный подход</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Каждая экскурсия разрабатывается специально под ваши пожелания
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-tropical-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="text-tropical-gold" size={24} />
                  </div>
                  <CardTitle className="text-lg">Прозрачные цены</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Мы предоставим детальную смету без скрытых доплат
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
