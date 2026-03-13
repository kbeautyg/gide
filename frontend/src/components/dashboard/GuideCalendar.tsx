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

// Draggable компонент для туров
function DraggableTour({ tour, isHighlighted }: { tour: any, isHighlighted?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tour-${tour.id}`,
  })
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }
  
  // Компонент с анимацией для подсветки
  const TourContent = isHighlighted ? motion.div : 'div'
  const animationProps = isHighlighted ? {
    initial: { scale: 1, backgroundColor: 'rgb(254 226 226)' }, // red-100
    animate: { 
      scale: [1, 1.05, 1],
      backgroundColor: [
        'rgb(254 226 226)', // red-100
        'rgb(254 202 202)', // red-200
        'rgb(254 226 226)', // red-100
      ],
      boxShadow: [
        '0 0 0 0px rgba(225, 29, 72, 0)',
        '0 0 0 6px rgba(225, 29, 72, 0.3)',
        '0 0 0 0px rgba(225, 29, 72, 0)'
      ]
    },
    transition: { duration: 0.6, repeat: 3 }
  } : {}
  
  return (
    <TourContent 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-xs shadow-md group/tour relative transition-colors border sm:border-2 ${
        isHighlighted 
          ? 'bg-rose-100 border-rose-400' 
          : 'bg-rose-50 border-rose-300 hover:bg-rose-100'
      }`}
      {...animationProps}
    >
      <div className="flex items-center gap-0.5 sm:gap-1">
        <GripVertical className="w-2 h-2 sm:w-3 sm:h-3 text-rose-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold line-clamp-1 text-rose-900">{tour.title}</div>
          <div className="text-rose-600 text-[8px] sm:text-[10px]">Тур • {tour.duration}ч</div>
        </div>
      </div>
    </TourContent>
  )
}

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
  highlightDate?: string | null
  highlightTourId?: number | null
}

export function GuideCalendar({ 
  schedules, 
  requests,
  tours = [],
  onReschedule,
  // @ts-ignore - будет использоваться позже для drag&drop туров
  onTourReschedule,
  onCancel,
  mode = 'view',
  onDateSelect,
  showHoursAvailability = false,
  disabledDates = [],
  selectedDate,
  enableDragDrop = false,
  // @ts-ignore - будет использоваться позже для drag&drop туров
  autoUpdateDates = false,
  highlightDate = null,
  highlightTourId = null
}: GuideCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activeId, setActiveId] = useState<number | null>(null)
  const [expandedDate, setExpandedDate] = useState<Date | null>(null)
  
  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id)
    if (id.startsWith('tour-')) {
      setActiveId(Number(id.replace('tour-', '')))
    } else {
      setActiveId(Number(id))
    }
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    
    if (!over) return
    
    const activeIdStr = String(active.id)
    const newDate = over.id as string
    
    // Проверяем тип: тур или заявка
    if (activeIdStr.startsWith('tour-')) {
      // Перенос тура
      if (!onTourReschedule) return
      const tourId = Number(activeIdStr.replace('tour-', ''))
      onTourReschedule(tourId, newDate, newDate) // start и end одинаковые
    } else {
      // Перенос заявки
      if (!onReschedule) return
      const requestId = Number(activeIdStr)
      onReschedule(requestId, newDate)
    }
  }
  
  const activeRequest = activeId ? requests.find(r => r.id === activeId) : null
  const activeTour = activeId ? tours.find(t => t.id === activeId) : null
  
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
    <div className="bg-white rounded-xl shadow-airbnb p-2 sm:p-4 md:p-6 overflow-x-hidden max-w-full">
      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 capitalize truncate px-2">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </h3>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <ChevronRight size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
      
      {/* Сетка дней */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
        {/* Заголовки дней недели */}
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-1 sm:py-2 text-[10px] sm:text-xs md:text-sm">
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
          
          // Проверяем нужно ли подсветить эту дату
          const dayStr = format(day, 'yyyy-MM-dd')
          // Подсвечиваем дату если она совпадает ИЛИ если на этой дате есть нужный тур
          const shouldHighlight = Boolean(
            (highlightDate === dayStr) || 
            (highlightTourId && toursOnDay.some(t => t.id === highlightTourId))
          )
          
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
              isHighlighted={shouldHighlight}
              highlightTourId={highlightTourId}
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
          ) : activeTour ? (
            <div className="bg-blue-50 rounded px-3 py-2 shadow-2xl border-2 border-blue-500 opacity-90 cursor-grabbing">
              <div className="font-semibold text-sm text-blue-900">{activeTour.title}</div>
              <div className="text-xs text-blue-600">Тур • {activeTour.duration}ч</div>
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
  isHighlighted?: boolean
  highlightTourId?: number | null
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
        "bg-white rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-xs shadow-sm group/card relative",
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:scale-[1.02]",
        isDragging && "opacity-50 scale-95 shadow-xl cursor-grabbing"
      )}
    >
      <div className="flex items-center gap-0.5 sm:gap-1">
        <div className="flex-shrink-0">
          <GripVertical size={10} className="text-gray-400 sm:w-3 sm:h-3" />
        </div>
        <div className="flex-1 pointer-events-none min-w-0">
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
            className="opacity-0 group-hover/card:opacity-100 text-red-600 hover:text-red-700 p-0.5 pointer-events-auto flex-shrink-0"
          >
            <X size={10} className="sm:w-3 sm:h-3" />
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
  isExpanded = false,
  isHighlighted = false,
  highlightTourId = null
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
  
  // Компонент с анимацией для подсветки
  const DayCellContent = isHighlighted ? motion.div : 'div'
  const animationProps = isHighlighted ? {
    initial: { scale: 1, backgroundColor: bgColor },
    animate: { 
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0 0px rgba(251, 191, 36, 0)',
        '0 0 0 8px rgba(251, 191, 36, 0.4)',
        '0 0 0 0px rgba(251, 191, 36, 0)'
      ]
    },
    transition: { duration: 0.6, repeat: 3 }
  } : {}
  
  return (
    <DayCellContent 
      ref={setNodeRef}
      className={cn(
        "min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-1.5 md:p-2 border rounded transition-all",
        bgColor,
        !disabled && isCurrentMonth && "hover:shadow-sm cursor-pointer",
        disabled && "cursor-not-allowed",
        isOver && availableHours > 0 && "ring-1 sm:ring-2 ring-green-500 ring-offset-1 sm:ring-offset-2 bg-green-100/50",
        isOver && availableHours === 0 && "ring-1 sm:ring-2 ring-red-500 ring-offset-1 sm:ring-offset-2 animate-shake",
        isHighlighted && "ring-2 sm:ring-4 ring-yellow-400"
      )}
      onClick={!disabled ? onClick : undefined}
      {...animationProps}
    >
      <div className={cn(
        "font-bold text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1", 
        isSelected ? "text-white" : !isCurrentMonth ? "text-gray-400" : "text-gray-900"
      )}>
        {day.getDate()}
      </div>
      
      {isCurrentMonth && showHours && (
        <div className={cn(
          "text-[9px] sm:text-[10px] md:text-xs mb-0.5 sm:mb-1", 
          isSelected ? "text-white/90" : "text-gray-600"
        )}>
          {availableHours}/8ч
        </div>
      )}
      
      {isCurrentMonth && !showHours && bookedHours > 0 && (
        <div className={cn(
          "text-[9px] sm:text-[10px] md:text-xs mb-0.5 sm:mb-1", 
          isSelected ? "text-white/90" : "text-gray-600"
        )}>
          {bookedHours}/8ч
        </div>
      )}
      
      {/* Прогресс-бар */}
      {isCurrentMonth && bookedHours > 0 && (
        <div className={cn(
          "w-full h-0.5 sm:h-1 rounded mb-1 sm:mb-2",
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
            className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {enableDragDrop ? (
              // С Drag & Drop
              <>
                {(isExpanded ? requests : requests.slice(0, 1)).map(req => (
                  <DraggableRequestCard key={req.id} request={req} onCancel={onCancel} />
                ))}
                {!isExpanded && requests.length > 1 && (
                  <div className="text-[9px] sm:text-xs text-gray-500 text-center cursor-pointer hover:text-gray-700" onClick={onClick}>
                    +{requests.length - 1}
                  </div>
                )}
              </>
            ) : (
              // Без Drag & Drop (старая версия)
              <>
                {requests.slice(0, 1).map(req => (
                  <div key={req.id} className="bg-white rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-xs shadow-sm group/card relative">
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
                          <X size={10} className="sm:w-3 sm:h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {requests.length > 1 && (
                  <div className="text-[9px] sm:text-xs text-gray-500 text-center">+{requests.length - 1}</div>
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
            className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {tours.slice(0, 1).map(tour => (
              enableDragDrop ? (
                <DraggableTour 
                  key={tour.id} 
                  tour={tour} 
                  isHighlighted={highlightTourId === tour.id}
                />
              ) : (
                <div 
                  key={tour.id} 
                  className={`rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-xs shadow-sm group/tour relative border ${
                    highlightTourId === tour.id
                      ? 'bg-rose-100 border-rose-300'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className="font-semibold line-clamp-1 text-rose-900">{tour.title}</div>
                  <div className="text-rose-600 text-[8px] sm:text-[10px]">Тур • {tour.duration}ч</div>
                </div>
              )
            ))}
            {tours.length > 1 && (
              <div className="text-[9px] sm:text-xs text-rose-500 text-center">+{tours.length - 1}</div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </DayCellContent>
  )
}

