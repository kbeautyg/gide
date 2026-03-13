import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface ChatParticipant {
  id: number
  name: string
  avatar?: string
  role: string
}

export interface ChatSummary {
  booking_id: number
  tour_title: string
  participant: ChatParticipant
  last_message: string
  last_message_time: string
  unread_count: number
  status: string
}

export interface TourFolder {
  tour_id: number
  tour_title: string
  tour_photo?: string
  chats: ChatSummary[]
}

export interface Message {
  id: number
  content: string
  sender_id: number
  created_at: string
  is_read: boolean
}

export function useChats() {
  return useQuery({
    queryKey: ['chats-grouped'],
    queryFn: async () => {
      const response = await api.get('/chats/grouped')
      return response.data as TourFolder[]
    },
    refetchInterval: 10000, // Poll every 10s
  })
}

export function useMessages(bookingId: number | null) {
  return useQuery({
    queryKey: ['messages', bookingId],
    queryFn: async () => {
      if (!bookingId) return []
      const response = await api.get(`/chats/${bookingId}/messages`)
      return response.data as Message[]
    },
    enabled: !!bookingId,
    refetchInterval: 3000, // Poll active chat every 3s
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ bookingId, content }: { bookingId: number; content: string }) => {
      const response = await api.post(`/chats/${bookingId}/messages`, { content })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.bookingId] })
      queryClient.invalidateQueries({ queryKey: ['chats-grouped'] })
    },
  })
}
