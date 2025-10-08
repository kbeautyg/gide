import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Plus } from 'lucide-react'
import { toursApi } from '@/lib/api'

export function CreateTourDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    location: '',
    category: '',
    photos: '',
    start_date: '',
    end_date: '',
    is_public: false,
  })
  
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: (data: any) => toursApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours', 'public'] })
      queryClient.invalidateQueries({ queryKey: ['tours', 'public', 'popular'] })
      queryClient.invalidateQueries({ queryKey: ['tours', 'mine'] })
      setOpen(false)
      setFormData({
        title: '',
        description: '',
        price: '',
        duration: '',
        location: '',
        category: '',
        photos: '',
        start_date: '',
        end_date: '',
        is_public: false,
      })
      alert('✅ Экскурсия создана!')
    },
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const photos = formData.photos
      ? formData.photos.split('\n').filter(url => url.trim())
      : []
    
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      location: formData.location,
      category: formData.category,
      photos,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      is_public: formData.is_public,
    })
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="tropical">
          <Plus className="mr-2" size={18} />
          Создать экскурсию
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создание новой экскурсии</DialogTitle>
          <DialogDescription>
            Заполните информацию об экскурсии
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Обзорная экскурсия по Пхукету"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Подробное описание экскурсии..."
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Цена (₽) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Длительность (часы) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="6"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Локация *</Label>
              <select
                id="location"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              >
                <option value="">Выберите локацию</option>
                <option value="Пхукет">Пхукет</option>
                <option value="Паттайя">Паттайя</option>
                <option value="Бангкок">Бангкок</option>
                <option value="Краби">Краби</option>
                <option value="Самуи">Самуи</option>
                <option value="Пханган">Пханган</option>
                <option value="Чианг Май">Чианг Май</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="category">Категория *</Label>
              <select
                id="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Выберите категорию</option>
                <option value="Культура и история">Культура и история</option>
                <option value="Природа и пляжи">Природа и пляжи</option>
                <option value="Приключения">Приключения</option>
                <option value="Гастрономия">Гастрономия</option>
                <option value="Водные развлечения">Водные развлечения</option>
                <option value="Развлечения">Развлечения</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Дата начала</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">Дата окончания</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="photos">Фотографии (URL, каждая с новой строки)</Label>
            <Textarea
              id="photos"
              value={formData.photos}
              onChange={(e) => setFormData({ ...formData, photos: e.target.value })}
              placeholder="https://images.unsplash.com/photo-1589394815804-964ed0be2eb5"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_public"
              type="checkbox"
              className="h-4 w-4"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
            />
            <Label htmlFor="is_public" className="text-sm">
              Опубликовать экскурсию в каталоге (появится на главной и в разделе "Экскурсии")
            </Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="tropical" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Создание...' : 'Создать экскурсию'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
