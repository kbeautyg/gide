import { useEffect, useRef, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws'
const RECONNECT_DELAY = 3000
const PING_INTERVAL = 25000

// Типы для таймеров
type TimeoutId = ReturnType<typeof setTimeout>
type IntervalId = ReturnType<typeof setInterval>

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface UseWebSocketOptions {
  enabled?: boolean
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true, onMessage, onConnect, onDisconnect } = options
  const wsRef = useRef<WebSocket | null>(null)
  const queryClient = useQueryClient()
  const reconnectTimeoutRef = useRef<TimeoutId>()
  const pingIntervalRef = useRef<IntervalId>()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const getToken = useCallback(() => {
    return localStorage.getItem('token')
  }, [])

  const handleMessage = useCallback((message: WebSocketMessage) => {
    // Убрали console.log для production

    switch (message.type) {
      case 'request_updated':
        // Обновляем заявки
        queryClient.invalidateQueries({ queryKey: ['requests'] })
        queryClient.invalidateQueries({ queryKey: ['requests', 'available'] })
        break

      case 'tour_created':
      case 'tour_updated':
        // Обновляем туры
        queryClient.invalidateQueries({ queryKey: ['tours'] })
        if (message.tour_id) {
          queryClient.invalidateQueries({ queryKey: ['tour', message.tour_id] })
        }
        break

      case 'schedule_updated':
        // Обновляем расписание
        queryClient.invalidateQueries({ queryKey: ['my-schedule'] })
        break

      case 'booking_created':
        // Обновляем бронирования
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        break

      case 'connected':
        // Успешное подключение обрабатывается в onConnect
        break

      default:
        // Неизвестный тип сообщения - игнорируем
        break
    }
  }, [queryClient])

  const connect = useCallback(() => {
    if (!enabled) return

    const token = getToken()
    if (!token) {
      setConnectionError('No authentication token')
      return
    }

    try {
      // Закрываем предыдущее соединение если есть
      if (wsRef.current) {
        wsRef.current.close()
      }

      const ws = new WebSocket(`${WS_URL}?token=${token}`)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setConnectionError(null)
        onConnect?.()

        // Запускаем ping для поддержания соединения
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping')
          }
        }, PING_INTERVAL)
      }

      ws.onmessage = (event) => {
        try {
          // Игнорируем pong
          if (event.data === 'pong' || event.data === 'ping') {
            return
          }

          const message: WebSocketMessage = JSON.parse(event.data)
          
          // Обрабатываем сообщения
          handleMessage(message)
          
          // Вызываем пользовательский обработчик
          onMessage?.(message)
        } catch (error) {
          // Ошибка парсинга сообщения - логируем только в development
          if (import.meta.env.DEV) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
      }

      ws.onerror = () => {
        setConnectionError('Connection error')
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        onDisconnect?.()

        // Очищаем ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
        }

        // Переподключаемся автоматически если не было явного закрытия
        if (enabled && event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, RECONNECT_DELAY)
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error connecting WebSocket:', error)
      }
      setConnectionError('Failed to connect')
    }
  }, [enabled, getToken, onConnect, onDisconnect, onMessage, handleMessage])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect')
      wsRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }
    setIsConnected(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    isConnected,
    connectionError,
    reconnect: connect,
  }
}

