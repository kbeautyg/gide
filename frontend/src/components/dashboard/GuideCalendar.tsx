import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, GripVertical } from 'lucide-react'
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, addMonths, subMonths, isSameMonth, isPast,
  startOfWeek, endOfWeek
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { 
  DndContext, 
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragOverlay,
  closestCenter
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'

interface GuideCalendarProps {
  schedules: Array<{ date: string, booked_hours: number, available_hours?: number }>
  requests: Array<any>
  tours?: Array<any>
  onReschedule?: (requestId: number, newDate: string) => void
  onTourReschedule?: (tourId: number, newStartDate: string, newEndDate: string) => void
  onCancel?: (requestId: number) => void
  mode?: 'view' | 'select'
  onDateSelect?: (date: Date) => void
  showHoursAvailability?: boolean
  disabledDates?: Date[]
  selectedDate?: Date | null
  enableDragDrop?: boolean
  autoUpdateDates?: boolean
}

export function GuideCalendar({ 
  schedules, 
  requests,
  tours = [],
  onReschedule,
  onTourReschedule, // eslint-disable-line @typescript-eslint/no-unused-vars
  onCancel,
  mode = 'view',
  onDateSelect,
  showHoursAvailability = false,
  disabledDates = [],
  selectedDate,
  enableDragDrop = false,
  autoUpdateDates = false // eslint-disable-line @typescript-eslint/no-unused-vars
}: GuideCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activeId, setActiveId] = useState<number | null>(null)
  const [expandedDate, setExpandedDate] = useState<Date | null>(null)
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id))
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    
    if (!over || !onReschedule) return
    
    const requestId = Number(active.id)
    const newDate = over.id as string
    
    onReschedule(requestId, newDate)
  }
  
  const activeRequest = activeId ? requests.find(r => r.id === activeId) : null
  
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

  const getToursForDate = (date: Date) => {
    return tours.filter(t => {
      if (!t.start_date || !t.end_date) return false
      const start = new Date(t.start_date)
      const end = new Date(t.end_date)
      return date >= start && date <= end
    })
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
          const toursOnDay = getToursForDate(day)
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
              tours={toursOnDay}
              disabled={disabled || false}
              isSelected={isSelected || false}
              isCurrentMonth={isCurrentMonth}
              showHours={showHoursAvailability || false}
              onClick={() => {
                if (mode === 'select' && !disabled) {
                  onDateSelect?.(day)
                } else if ((requestsOnDay.length + toursOnDay.length) > 1 && enableDragDrop) {
                  // Разворачиваем список если несколько элементов
                  setExpandedDate(expandedDate && isSameDay(expandedDate, day) ? null : day)
                }
              }}
              onCancel={onCancel}
              enableDragDrop={enableDragDrop}
              isExpanded={expandedDate ? isSameDay(expandedDate, day) : false}
            />
          )
        })}
      </div>
    </div>
  )
  
  // Оборачиваем в DndContext если включен Drag & Drop
  if (enableDragDrop && mode === 'view') {
    return (
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        {calendarContent}
        
        {/* DragOverlay для ghost эффекта */}
        <DragOverlay>
          {activeRequest ? (
            <div className="bg-white rounded px-3 py-2 shadow-2xl border-2 border-airbnb-rausch opacity-80 cursor-grabbing">
              <div className="font-semibold text-sm text-gray-900">{activeRequest.title}</div>
              <div className="text-xs text-gray-500">{activeRequest.duration_hours}ч</div>
            </div>
          ) : null}
        </DragOverlay>
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
  tours?: any[]
  disabled?: boolean
  isSelected?: boolean
  isCurrentMonth?: boolean
  showHours?: boolean
  onClick: () => void
  onCancel?: (requestId: number) => void
  enableDragDrop?: boolean
  isExpanded?: boolean
}

// Компонент перетаскиваемой карточки заявки
function DraggableRequestCard({ request, onCancel }: { request: any, onCancel?: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: request.id,
    data: request
  })
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white rounded px-2 py-1 text-xs shadow-sm group/card relative",
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:scale-[1.02]",
        isDragging && "opacity-50 scale-95 shadow-xl cursor-grabbing"
      )}
    >
      <div className="flex items-center gap-1">
        <div className="flex-shrink-0">
          <GripVertical size={12} className="text-gray-400" />
        </div>
        <div className="flex-1 pointer-events-none">
          <div className="font-semibold line-clamp-1 text-gray-900">{request.title}</div>
          <div className="flex items-center justify-between">
            <div className="text-gray-500">{request.duration_hours}ч</div>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Отменить "${request.title}"? Это освободит ${request.duration_hours}ч`)) {
                onCancel(request.id)
              }
            }}
            className="opacity-0 group-hover/card:opacity-100 text-red-600 hover:text-red-700 p-0.5 pointer-events-auto"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

function DayCell({ 
  day, 
  bookedHours, 
  availableHours,
  requests, 
  tours = [],
  disabled, 
  isSelected, 
  isCurrentMonth,
  showHours, 
  onClick,
  onCancel,
  enableDragDrop = false,
  isExpanded = false
}: DayCellProps) {
  // Делаем дату droppable зоной
  const { setNodeRef, isOver } = useDroppable({
    id: format(day, 'yyyy-MM-dd'),
    disabled: disabled || bookedHours >= 8
  })
  
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
      ref={setNodeRef}
      className={cn(
        "min-h-[100px] p-2 border rounded-lg transition-all",
        bgColor,
        !disabled && isCurrentMonth && "hover:shadow-sm cursor-pointer",
        disabled && "cursor-not-allowed",
        isOver && availableHours > 0 && "ring-2 ring-green-500 ring-offset-2 bg-green-100/50",
        isOver && availableHours === 0 && "ring-2 ring-red-500 ring-offset-2 animate-shake"
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
      
      {/* Список заявок с Drag & Drop или обычный */}
      {isCurrentMonth && requests.length > 0 && !showHours && (
        <AnimatePresence>
          <motion.div 
            className="space-y-1 mt-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {enableDragDrop ? (
              // С Drag & Drop
              <>
                {(isExpanded ? requests : requests.slice(0, 2)).map(req => (
                  <DraggableRequestCard key={req.id} request={req} onCancel={onCancel} />
                ))}
                {!isExpanded && requests.length > 2 && (
                  <div className="text-xs text-gray-500 text-center cursor-pointer hover:text-gray-700" onClick={onClick}>
                    +{requests.length - 2} (клик для раскрытия)
                  </div>
                )}
              </>
            ) : (
              // Без Drag & Drop (старая версия)
              <>
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
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
      
      {/* Список туров */}
      {isCurrentMonth && tours.length > 0 && !showHours && (
        <AnimatePresence>
          <motion.div 
            className="space-y-1 mt-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {tours.slice(0, 2).map(tour => (
              <div key={tour.id} className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs shadow-sm group/tour relative">
                <div className="font-semibold line-clamp-1 text-blue-900">{tour.title}</div>
                <div className="text-blue-600 text-[10px]">Тур • {tour.duration}ч</div>
              </div>
            ))}
            {tours.length > 2 && (
              <div className="text-xs text-blue-500 text-center">+{tours.length - 2} туров</div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

