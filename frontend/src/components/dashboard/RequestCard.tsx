import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, Calendar, MapPin, Clock } from 'lucide-react'
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
  }
  onTake: () => void
}

export function RequestCard({ request, onTake }: RequestCardProps) {
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
        <div className="flex items-start justify-between mb-3">
          {getDurationBadge()}
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
        </div>
        
        <Button 
          onClick={onTake}
          className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch/90"
        >
          Взять заявку
        </Button>
      </CardContent>
    </Card>
  )
}

