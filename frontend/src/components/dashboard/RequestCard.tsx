import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, Calendar, MapPin, Clock, MessageCircle, CheckCircle, Link2, ExternalLink } from 'lucide-react'
import { formatRUB } from '@/lib/utils'

interface RequestCardProps {
  request: {
    id: number
    title: string
    description: string
    duration_hours: number
    participants_count: number
    budget?: number
    location?: string
    preferred_date?: string
    telegram_username?: string
    status?: string
    generated_tour_id?: number
    guide_id?: number | null
    assigned_date?: string
  }
  onTake?: () => void
  onAccept?: () => void
  onViewTour?: (tourId: number) => void
}

export function RequestCard({ request, onTake, onAccept, onViewTour }: RequestCardProps) {
  const getStatusBadge = () => {
    // Pending БЕЗ guide_id - новая заявка
    if (request.status === 'pending' && !request.guide_id) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          Новая заявка
        </Badge>
      )
    }
    // Pending С guide_id - принята, ждёт создания тура
    if (request.status === 'pending' && request.guide_id) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-300 gap-1">
          <CheckCircle size={12} />
          Принята вами
        </Badge>
      )
    }
    if (request.status === 'in_progress') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300 gap-1">
          <Link2 size={12} />
          Тур создан
        </Badge>
      )
    }
    if (request.status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300 gap-1">
          <CheckCircle size={12} />
          Завершена
        </Badge>
      )
    }
    return null
  }
  // Определяем тип по длительности
  const getDurationBadge = () => {
    if (request.duration_hours <= 2) {
      return (
        <Badge variant="new" className="gap-1">
          <Clock size={12} />
          {request.duration_hours}ч • Короткая
        </Badge>
      )
    }
    if (request.duration_hours >= 5) {
      return (
        <Badge variant="popular" className="gap-1">
          <Clock size={12} />
          {request.duration_hours}ч • Длинная
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="gap-1">
        <Clock size={12} />
        {request.duration_hours}ч
      </Badge>
    )
  }

  return (
    <Card className="hover:shadow-airbnb transition-all duration-200 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
          <div className="flex gap-2">
            {getStatusBadge()}
            {getDurationBadge()}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users size={14} />
            <span>{request.participants_count} чел.</span>
          </div>
        </div>
        
        <CardTitle className="text-xl line-clamp-2">{request.title}</CardTitle>
        
        {request.location && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
            <MapPin size={14} />
            <span>{request.location}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <p className="text-gray-700 mb-4 line-clamp-3 flex-1">{request.description}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
          {request.preferred_date && (
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar size={14} />
              <span>Предпочт.: {new Date(request.preferred_date).toLocaleDateString('ru')}</span>
            </div>
          )}
          
          {request.budget && (
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign size={14} />
              <span>до {formatRUB(request.budget)}</span>
            </div>
          )}
          
          {request.telegram_username && (
            <div className="flex items-center gap-1 text-gray-600">
              <MessageCircle size={14} />
              <span>{request.telegram_username}</span>
            </div>
          )}
        </div>
        
        {/* Новая заявка БЕЗ guide_id - показываем кнопку Принять */}
        {request.status === 'pending' && !request.guide_id && onAccept && (
          <Button 
            onClick={onAccept}
            className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Принять и создать тур
          </Button>
        )}

        {/* Принятая заявка С guide_id, но без тура - редирект на создание */}
        {request.status === 'pending' && request.guide_id && !request.generated_tour_id && onAccept && (
          <Button 
            onClick={onAccept}
            className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <Link2 size={16} />
            Создать тур
          </Button>
        )}

        {/* Заявка с созданным туром - показываем кнопку просмотра */}
        {request.generated_tour_id && onViewTour && (
          <Button 
            onClick={() => onViewTour(request.generated_tour_id!)}
            variant="outline"
            className="w-full flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <ExternalLink size={16} />
            Посмотреть тур
          </Button>
        )}

        {request.status === 'completed' && (
          <div className="text-sm text-gray-500 text-center py-2">
            ✓ Заявка выполнена
          </div>
        )}
      </CardContent>
    </Card>
  )
}

