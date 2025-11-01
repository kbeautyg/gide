import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from './useWebSocket'

interface UseAutoRefreshOptions {
  queryKeys: string[][]
  intervalMs?: number
  enabledWebSocket?: boolean
}

/**
 * Автообновление данных через WebSocket + fallback на polling
 * 
 * @param queryKeys - массив ключей запросов для обновления
 * @param intervalMs - интервал polling (по умолчанию 15 сек)
 * @param enableWebSocket - использовать WebSocket (по умолчанию true)
 */
export function useAutoRefresh({
  queryKeys,
  intervalMs = 15000,
  enabledWebSocket = true,
}: UseAutoRefreshOptions) {
  const queryClient = useQueryClient()
  const { isConnected } = useWebSocket({ enabled: enabledWebSocket })

  useEffect(() => {
    // Если WebSocket подключен - не используем polling
    if (isConnected) {
      return
    }

    // Fallback: polling каждые N секунд
    const interval = setInterval(() => {
      // Убрали console.log для production
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [isConnected, queryKeys, intervalMs, queryClient])

  return { isConnected }
}

