import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Save, X, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface Category {
  id: number
  name: string
  slug: string
  type: string
  icon?: string
  image_url?: string
  description?: string
  is_featured: boolean
  is_active: boolean
  tours_count?: number
  display_order: number
}

export default function CategoriesManagement() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('landmark')
  
  const queryClient = useQueryClient()

  // Загрузка категорий
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['admin-categories', selectedType],
    queryFn: () => api.get(`/categories?type=${selectedType}&with_counts=true`).then(res => res.data),
  })

  const categories: Category[] = categoriesData || []

  // Создание категории
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      alert('✅ Категория создана!')
      setIsCreating(false)
    },
    onError: () => {
      alert('❌ Ошибка создания категории')
    }
  })

  // Обновление категории
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.put(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      alert('✅ Категория обновлена!')
      setEditingCategory(null)
    },
    onError: () => {
      alert('❌ Ошибка обновления категории')
    }
  })

  // Удаление категории
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      alert('✅ Категория удалена!')
    },
    onError: () => {
      alert('❌ Ошибка удаления категории')
    }
  })

  const handleCreate = (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      type: selectedType,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      image_url: formData.get('image_url') as string,
      is_featured: formData.get('is_featured') === 'on',
      is_active: formData.get('is_active') === 'on',
      display_order: parseInt(formData.get('display_order') as string) || 0,
      filters: {},
      metadata: {}
    }
    createMutation.mutate(data)
  }

  const handleUpdate = (id: number, formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      image_url: formData.get('image_url') as string,
      is_featured: formData.get('is_featured') === 'on',
      is_active: formData.get('is_active') === 'on',
      display_order: parseInt(formData.get('display_order') as string) || 0,
    }
    updateMutation.mutate({ id, data })
  }

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      deleteMutation.mutate(id)
    }
  }

  const CategoryForm = ({ category, onSubmit, onCancel }: any) => {
    return (
      <motion.form
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-4"
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          onSubmit(formData)
        }}
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={category?.name}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
              placeholder="Храмы и святыни"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL) *
            </label>
            <input
              type="text"
              name="slug"
              defaultValue={category?.slug}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
              placeholder="temples-shrines"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            name="description"
            defaultValue={category?.description}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
            placeholder="Описание категории..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Иконка (emoji или lucide)
            </label>
            <input
              type="text"
              name="icon"
              defaultValue={category?.icon}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
              placeholder="🏛️ или MapPin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Порядок отображения
            </label>
            <input
              type="number"
              name="display_order"
              defaultValue={category?.display_order || 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL изображения
          </label>
          <input
            type="url"
            name="image_url"
            defaultValue={category?.image_url}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={category?.is_featured}
              className="rounded border-gray-300 text-airbnb-rausch focus:ring-airbnb-rausch"
            />
            <span className="text-sm text-gray-700">Показывать на главной</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={category?.is_active ?? true}
              className="rounded border-gray-300 text-airbnb-rausch focus:ring-airbnb-rausch"
            />
            <span className="text-sm text-gray-700">Активна</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="bg-airbnb-rausch hover:bg-airbnb-rausch/90">
            <Save size={16} className="mr-2" />
            Сохранить
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <X size={16} className="mr-2" />
            Отмена
          </Button>
        </div>
      </motion.form>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Управление категориями и рубриками
          </h1>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-airbnb-rausch hover:bg-airbnb-rausch/90"
          >
            <Plus size={20} className="mr-2" />
            Создать категорию
          </Button>
        </div>

        {/* Фильтр по типам */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            {['landmark', 'theme', 'format', 'collection'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedType === type
                    ? 'bg-airbnb-rausch text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'landmark' && '🏛️ Достопримечательности'}
                {type === 'theme' && '🎨 Темы'}
                {type === 'format' && '📋 Форматы'}
                {type === 'collection' && '📚 Коллекции'}
              </button>
            ))}
          </div>
        </div>

        {/* Форма создания */}
        {isCreating && (
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        )}

        {/* Список категорий */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-rausch mx-auto"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">Нет категорий этого типа</p>
            </div>
          ) : (
            categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {editingCategory?.id === category.id ? (
                  <CategoryForm
                    category={editingCategory}
                    onSubmit={(formData: FormData) => handleUpdate(category.id, formData)}
                    onCancel={() => setEditingCategory(null)}
                  />
                ) : (
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {category.icon && <span className="mr-2">{category.icon}</span>}
                            {category.name}
                          </h3>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {category.slug}
                          </span>
                          {category.is_featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              ⭐ Избранное
                            </span>
                          )}
                          {!category.is_active && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              <EyeOff size={12} className="inline mr-1" />
                              Неактивна
                            </span>
                          )}
                        </div>
                        
                        {category.description && (
                          <p className="text-gray-600 mb-2">{category.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📊 {category.tours_count || 0} туров</span>
                          <span>🔢 Порядок: {category.display_order}</span>
                          <span>📁 Тип: {category.type}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit size={16} className="mr-1" />
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


