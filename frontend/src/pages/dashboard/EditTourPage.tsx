import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toursApi } from '@/lib/api'

export default function EditTourPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState<any>({})
  const [activeTab, setActiveTab] = useState('basic')
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newIncludedItem, setNewIncludedItem] = useState('')
  const [newNotIncludedItem, setNewNotIncludedItem] = useState('')
  const [newLandmark, setNewLandmark] = useState('')
  const [newTag, setNewTag] = useState('')

  // Загрузка данных тура
  const { data: tourData, isLoading } = useQuery({
    queryKey: ['admin-tour', id],
    queryFn: () => toursApi.getFullDetails(Number(id)),
    enabled: !!id,
  })

  const tour = tourData?.data

  // Заполняем форму при загрузке
  useEffect(() => {
    if (tour) {
      setFormData(tour)
    }
  }, [tour])

  // Mutation для обновления
  const updateMutation = useMutation({
    mutationFn: (data: any) => toursApi.fullUpdate(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tour', id] })
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      alert('✅ Тур успешно обновлен!')
      navigate('/dashboard/my-tours')
    },
    onError: (error: any) => {
      alert(`❌ Ошибка: ${error.response?.data?.detail || 'Не удалось обновить тур'}`)
    },
  })

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.price) {
      alert('Пожалуйста, заполните обязательные поля: название, описание и цену')
      return
    }
    updateMutation.mutate(formData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  // Работа с массивами
  const addPhotoUrl = () => {
    if (newPhotoUrl.trim()) {
      handleChange('photos', [...(formData.photos || []), newPhotoUrl.trim()])
      setNewPhotoUrl('')
    }
  }

  const removePhoto = (index: number) => {
    handleChange('photos', formData.photos.filter((_: any, i: number) => i !== index))
  }

  const addIncludedItem = () => {
    if (newIncludedItem.trim()) {
      handleChange('included', [...(formData.included || []), newIncludedItem.trim()])
      setNewIncludedItem('')
    }
  }

  const removeIncludedItem = (index: number) => {
    handleChange('included', formData.included.filter((_: any, i: number) => i !== index))
  }

  const addNotIncludedItem = () => {
    if (newNotIncludedItem.trim()) {
      handleChange('not_included', [...(formData.not_included || []), newNotIncludedItem.trim()])
      setNewNotIncludedItem('')
    }
  }

  const removeNotIncludedItem = (index: number) => {
    handleChange('not_included', formData.not_included.filter((_: any, i: number) => i !== index))
  }

  const addLandmark = () => {
    if (newLandmark.trim()) {
      handleChange('landmarks', [...(formData.landmarks || []), newLandmark.trim()])
      setNewLandmark('')
    }
  }

  const removeLandmark = (index: number) => {
    handleChange('landmarks', formData.landmarks.filter((_: any, i: number) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim()) {
      handleChange('tags', [...(formData.tags || []), newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    handleChange('tags', formData.tags.filter((_: any, i: number) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-rausch mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/my-tours')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Редактирование тура</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-airbnb-rausch hover:bg-airbnb-rausch/90"
          >
            <Save size={16} className="mr-2" />
            {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        {/* Табы */}
        <div className="space-y-6">
          <div className="flex gap-2 border-b">
            {['basic', 'photos', 'details', 'params', 'seo'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === tab
                    ? 'border-b-2 border-airbnb-rausch text-airbnb-rausch'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'basic' && 'Основное'}
                {tab === 'photos' && 'Фото'}
                {tab === 'details' && 'Детали'}
                {tab === 'params' && 'Параметры'}
                {tab === 'seo' && 'SEO'}
              </button>
            ))}
          </div>

          {/* Основная информация */}
          {activeTab === 'basic' && (
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Название тура *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Например: Три главных храма Бангкока"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Описание *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Полное описание тура..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Цена (₽) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleChange('price', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Длительность (часы) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration || ''}
                      onChange={(e) => handleChange('duration', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Локация *</Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="Бангкок, Таиланд"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Категория *</Label>
                    <select
                      id="category"
                      value={formData.category || ''}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Выберите категорию</option>
                      <option value="Культура и история">Культура и история</option>
                      <option value="Природа">Природа</option>
                      <option value="Гастрономия">Гастрономия</option>
                      <option value="Развлечения">Развлечения</option>
                      <option value="Wellness и SPA">Wellness и SPA</option>
                      <option value="Приключения">Приключения</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Дата начала</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date || ''}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Дата окончания</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date || ''}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.active || false}
                      onChange={(e) => handleChange('active', e.target.checked)}
                      className="rounded"
                    />
                    <span>Активен</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_public || false}
                      onChange={(e) => handleChange('is_public', e.target.checked)}
                      className="rounded"
                    />
                    <span>Публичный</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Фотографии */}
          {activeTab === 'photos' && (
            <Card>
              <CardHeader>
                <CardTitle>Фотографии</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="URL фотографии"
                    onKeyPress={(e) => e.key === 'Enter' && addPhotoUrl()}
                  />
                  <Button onClick={addPhotoUrl} size="sm">
                    <Plus size={16} className="mr-1" />
                    Добавить
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {(formData.photos || []).map((photo: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Детали */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Что вас ожидает</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.what_to_expect || ''}
                    onChange={(e) => handleChange('what_to_expect', e.target.value)}
                    placeholder="• Встреча в центре города&#10;• Трансфер на комфортабельном автомобиле&#10;..."
                    rows={10}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Организационные детали</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.organizational_details || ''}
                    onChange={(e) => handleChange('organizational_details', e.target.value)}
                    placeholder="Информация о времени начала, дресс-коде, что взять с собой..."
                    rows={10}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Что включено</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newIncludedItem}
                      onChange={(e) => setNewIncludedItem(e.target.value)}
                      placeholder="Добавить пункт"
                      onKeyPress={(e) => e.key === 'Enter' && addIncludedItem()}
                    />
                    <Button onClick={addIncludedItem} size="sm">
                      <Plus size={16} className="mr-1" />
                      Добавить
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {(formData.included || []).map((item: string, index: number) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>• {item}</span>
                        <button
                          onClick={() => removeIncludedItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Что НЕ включено</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newNotIncludedItem}
                      onChange={(e) => setNewNotIncludedItem(e.target.value)}
                      placeholder="Добавить пункт"
                      onKeyPress={(e) => e.key === 'Enter' && addNotIncludedItem()}
                    />
                    <Button onClick={addNotIncludedItem} size="sm">
                      <Plus size={16} className="mr-1" />
                      Добавить
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {(formData.not_included || []).map((item: string, index: number) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>• {item}</span>
                        <button
                          onClick={() => removeNotIncludedItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Параметры */}
          {activeTab === 'params' && (
            <Card>
              <CardHeader>
                <CardTitle>Параметры тура</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meeting_point">Точка встречи</Label>
                  <Input
                    id="meeting_point"
                    value={formData.meeting_point || ''}
                    onChange={(e) => handleChange('meeting_point', e.target.value)}
                    placeholder="Станция BTS Siam или ваш отель"
                  />
                </div>

                <div>
                  <Label htmlFor="languages">Языки (через запятую)</Label>
                  <Input
                    id="languages"
                    value={(formData.languages || []).join(', ')}
                    onChange={(e) => handleChange('languages', e.target.value.split(',').map((l: string) => l.trim()))}
                    placeholder="Русский, Английский"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="max_group_size">Макс. размер группы</Label>
                    <Input
                      id="max_group_size"
                      type="number"
                      value={formData.max_group_size || ''}
                      onChange={(e) => handleChange('max_group_size', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_age">Мин. возраст</Label>
                    <Input
                      id="min_age"
                      type="number"
                      value={formData.min_age || ''}
                      onChange={(e) => handleChange('min_age', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty_level">Сложность</Label>
                    <select
                      id="difficulty_level"
                      value={formData.difficulty_level || ''}
                      onChange={(e) => handleChange('difficulty_level', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Выберите</option>
                      <option value="Лёгкая">Лёгкая</option>
                      <option value="Средняя">Средняя</option>
                      <option value="Сложная">Сложная</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO и метаданные */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Landmarks (Достопримечательности)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newLandmark}
                      onChange={(e) => setNewLandmark(e.target.value)}
                      placeholder="Добавить достопримечательность"
                      onKeyPress={(e) => e.key === 'Enter' && addLandmark()}
                    />
                    <Button onClick={addLandmark} size="sm">
                      <Plus size={16} className="mr-1" />
                      Добавить
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.landmarks || []).map((landmark: string, index: number) => (
                      <Badge key={index} className="gap-1 bg-gray-100 text-gray-700">
                        {landmark}
                        <button onClick={() => removeLandmark(index)}>
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags (Теги)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Добавить тег"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus size={16} className="mr-1" />
                      Добавить
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag: string, index: number) => (
                      <Badge key={index} className="gap-1 bg-gray-100 text-gray-700">
                        {tag}
                        <button onClick={() => removeTag(index)}>
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      value={formData.seo_title || ''}
                      onChange={(e) => handleChange('seo_title', e.target.value)}
                      placeholder="Оставьте пустым для автогенерации"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      value={formData.seo_description || ''}
                      onChange={(e) => handleChange('seo_description', e.target.value)}
                      placeholder="Краткое описание для поисковых систем"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="long_description">Подробное описание</Label>
                    <Textarea
                      id="long_description"
                      value={formData.long_description || ''}
                      onChange={(e) => handleChange('long_description', e.target.value)}
                      placeholder="Дополнительная информация о туре"
                      rows={8}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

