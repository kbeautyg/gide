import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning'
  date: Date
  read: boolean
  link?: string
}

export function NotificationCenter() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Закрытие при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Загрузка реальных уведомлений с бэка (если API есть)
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications/')
        return response.data
      } catch {
        // API может не существовать — показываем пустой список
        return null
      }
    },
    enabled: !!user,
    refetchInterval: 30000, // Проверяем каждые 30с
    retry: false,
  })

  // Обновляем уведомления из API или показываем пустой список
  useEffect(() => {
    if (notificationsData?.notifications) {
      setNotifications(notificationsData.notifications.map((n: any) => ({
        id: String(n.id),
        title: n.title,
        message: n.message,
        type: n.type || 'info',
        date: new Date(n.created_at),
        read: n.is_read,
        link: n.link,
      })))
    }
    // Если API нет — список останется пустым, это ОК
  }, [notificationsData])

  // Пересчет непрочитанных
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    // Пробуем отметить на бэке
    api.post(`/notifications/${id}/read`).catch(() => {})
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    api.post('/notifications/read-all').catch(() => {})
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setIsOpen(false)
    if (notification.link) {
        navigate(notification.link)
    }
  }

  const getIcon = (type: string) => {
      switch (type) {
          case 'success': return <CheckCircle size={16} className="text-green-500" />
          case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />
          default: return <Info size={16} className="text-blue-500" />
      }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Сейчас'
    if (diffMins < 60) return `${diffMins} мин.`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ч.`
    return date.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
            <div className="flex items-center justify-between p-4 pb-2 border-b bg-white">
                <h3 className="text-lg font-bold">Уведомления</h3>
                {unreadCount > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-auto py-1 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={markAllAsRead}
                    >
                        Прочитать все
                    </Button>
                )}
            </div>
            
            <div className="overflow-y-auto max-h-[300px] bg-white">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                        <Bell size={32} className="mb-3 opacity-20" />
                        <p className="font-medium text-gray-500">Нет уведомлений</p>
                        <p className="text-xs text-gray-400 mt-1">Здесь будут появляться важные события</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`relative flex gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                    notification.read ? 'hover:bg-gray-50 bg-white' : 'bg-blue-50/50 hover:bg-blue-50'
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <p className={`text-sm ${notification.read ? 'font-medium' : 'font-bold'} text-gray-900`}>
                                            {notification.title}
                                        </p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                            {formatTime(notification.date)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  )
}
