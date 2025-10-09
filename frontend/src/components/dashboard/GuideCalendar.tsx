import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, addMonths, subMonths, isSameMonth, isPast,
  startOfWeek, endOfWeek
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface GuideCalendarProps {
  schedules: Array<{ date: string, booked_hours: number, available_hours?: number }>
  requests: Array<any>
  onReschedule?: (requestId: number, newDate: string) => void
  onCancel?: (requestId: number) => void
  mode?: 'view' | 'select'
  onDateSelect?: (date: Date) => void
  showHoursAvailability?: boolean
  disabledDates?: Date[]
  selectedDate?: Date | null
  enableDragDrop?: boolean
}

export function GuideCalendar({ 
  schedules, 
  requests,
  onReschedule,
  onCancel,
  mode = 'view',
  onDateSelect,
  showHoursAvailability = false,
  disabledDates = [],
  selectedDate,
  enableDragDrop = false
}: GuideCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [expandedDate, setExpandedDate] = useState<Date | null>(null)
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !onReschedule) return
    
    const requestId = Number(active.id)
    const newDate = over.id as string
    
    onReschedule(requestId, newDate)
  }
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  const getScheduleForDate = (date: Date) => {
    return schedules.find(s => isSameDay(new Date(s.date), date))
  }
  
  const getRequestsForDate = (date: Date) => {
    return requests.filter(r => r.assigned_date && isSameDay(new Date(r.assigned_date), date))
  }
  
  const isDateDisabled = (date: Date) => {
    if (isPast(date) && !isSameDay(date, new Date())) return true
    return disabledDates.some(d => isSameDay(d, date))
  }
  
  const calendarContent = (
    <div className="bg-white rounded-xl shadow-airbnb p-6">
      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-xl font-bold text-gray-900 capitalize">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </h3>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Сетка дней */}
      <div className="grid grid-cols-7 gap-2">
        {/* Заголовки дней недели */}
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2 text-sm">
            {day}
          </div>
        ))}
        
        {/* Дни календаря */}
        {daysInCalendar.map(day => {
          const schedule = getScheduleForDate(day)
          const bookedHours = schedule?.booked_hours || 0
          const requestsOnDay = getRequestsForDate(day)
          const disabled = isDateDisabled(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          
          return (
            <DayCell
              key={day.toString()}
              day={day}
              bookedHours={bookedHours}
              availableHours={schedule?.available_hours ?? (8 - bookedHours)}
              requests={requestsOnDay}
              disabled={disabled || false}
              isSelected={isSelected || false}
              isCurrentMonth={isCurrentMonth}
              showHours={showHoursAvailability || false}
              onClick={() => mode === 'select' && !disabled && onDateSelect?.(day)}
              onCancel={onCancel}
            />
          )
        })}
      </div>
    </div>
  )
  
  // Оборачиваем в DndContext если включен Drag & Drop
  if (enableDragDrop && mode === 'view') {
    return (
      <DndContext onDragEnd={handleDragEnd}>
        {calendarContent}
      </DndContext>
    )
  }
  
  return calendarContent
}

interface DayCellProps {
  day: Date
  bookedHours: number
  availableHours: number
  requests: any[]
  disabled?: boolean
  isSelected?: boolean
  isCurrentMonth?: boolean
  showHours?: boolean
  onClick: () => void
  onCancel?: (requestId: number) => void
}

function DayCell({ 
  day, 
  bookedHours, 
  availableHours,
  requests, 
  disabled, 
  isSelected, 
  isCurrentMonth,
  showHours, 
  onClick,
  onCancel
}: DayCellProps) {
  const bgColor = 
    disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
    isSelected ? 'bg-airbnb-rausch text-white border-airbnb-rausch' :
    !isCurrentMonth ? 'bg-gray-50 text-gray-400' :
    bookedHours === 0 ? 'bg-white hover:bg-gray-50 border-gray-200' :
    bookedHours < 4 ? 'bg-green-50 border-green-200 hover:bg-green-100' :
    bookedHours < 8 ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' :
    'bg-red-50 border-red-200'
  
  const percentage = (bookedHours / 8) * 100
  
  return (
    <div 
      className={cn(
        "min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all",
        bgColor,
        !disabled && isCurrentMonth && "hover:shadow-sm"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className={cn(
        "font-bold text-sm mb-1", 
        isSelected ? "text-white" : !isCurrentMonth ? "text-gray-400" : "text-gray-900"
      )}>
        {day.getDate()}
      </div>
      
      {isCurrentMonth && showHours && (
        <div className={cn(
          "text-xs mb-1", 
          isSelected ? "text-white/90" : "text-gray-600"
        )}>
          {availableHours}/8ч свободно
        </div>
      )}
      
      {isCurrentMonth && !showHours && bookedHours > 0 && (
        <div className={cn(
          "text-xs mb-1", 
          isSelected ? "text-white/90" : "text-gray-600"
        )}>
          {bookedHours}/8ч
        </div>
      )}
      
      {/* Прогресс-бар */}
      {isCurrentMonth && bookedHours > 0 && (
        <div className={cn(
          "w-full h-1 rounded mb-2",
          isSelected ? "bg-white/30" : "bg-gray-200"
        )}>
          <div 
            className={cn(
              "h-full rounded transition-all",
              isSelected ? "bg-white" :
              bookedHours >= 8 ? 'bg-red-500' : 
              bookedHours >= 4 ? 'bg-yellow-500' : 
              'bg-green-500'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      
      {/* Мини-список заявок (только в режиме view) */}
      {isCurrentMonth && requests.length > 0 && !showHours && (
        <div className="space-y-1 mt-1">
          {requests.slice(0, 2).map(req => (
            <div key={req.id} className="bg-white rounded px-2 py-1 text-xs shadow-sm group/card relative">
              <div className="font-semibold line-clamp-1 text-gray-900">{req.title}</div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500">{req.duration_hours}ч</div>
                {onCancel && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Отменить "${req.title}"? Это освободит ${req.duration_hours}ч`)) {
                        onCancel(req.id)
                      }
                    }}
                    className="opacity-0 group-hover/card:opacity-100 text-red-600 hover:text-red-700 p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {requests.length > 2 && (
            <div className="text-xs text-gray-500 text-center">+{requests.length - 2}</div>
          )}
        </div>
      )}
    </div>
  )
}

