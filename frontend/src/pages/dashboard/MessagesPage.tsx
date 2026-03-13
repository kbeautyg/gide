import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useLocation } from 'react-router-dom'
import { useChats, useMessages, useSendMessage, TourFolder, ChatSummary } from '@/hooks/useChats'
import { ChatWindow } from '@/components/dashboard/chat/ChatWindow'
import { Folder, Search, User, Calendar, MapPin, DollarSign, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Input } from '@/components/ui/input'

interface TourFolderWithPhoto {
  tour_id: number
  tour_title: string
  tour_photo?: string
  chats: any[]
}

export default function MessagesPage() {
  const { user } = useAuthStore()
  const location = useLocation()
  
  const { data: foldersData = [], isLoading: isLoadingFolders } = useChats()
  const folders = foldersData as TourFolderWithPhoto[]
  const { mutate: sendMessage } = useSendMessage()
  
  // State
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Auto-select folder if only one
  useEffect(() => {
    if (folders.length > 0 && !selectedFolderId && !selectedChatId) {
      // If we came from "Write message" button
      if (location.state?.bookingId) {
        // Find folder containing this booking
        const folder = folders.find(f => f.chats.some(c => c.booking_id === Number(location.state.bookingId)))
        if (folder) {
          setSelectedFolderId(folder.tour_id)
          setSelectedChatId(Number(location.state.bookingId))
        }
      } else {
        // Default select first folder
        setSelectedFolderId(folders[0].tour_id)
      }
    }
  }, [folders, location.state])

  // Get selected folder and chats
  const selectedFolder = folders.find(f => f.tour_id === selectedFolderId)
  
  // Filter chats in selected folder
  const filteredChats = useMemo(() => {
    if (!selectedFolder) return []
    if (!searchTerm) return selectedFolder.chats
    return selectedFolder.chats.filter(c => 
      c.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [selectedFolder, searchTerm])

  // Get active chat data
  const selectedChat = selectedFolder?.chats.find(c => c.booking_id === selectedChatId)
  
  // Fetch messages for active chat
  const { data: messages = [] } = useMessages(selectedChatId)

  // Handlers
  const handleSendMessage = (text: string) => {
    if (selectedChatId) {
      sendMessage({ bookingId: selectedChatId, content: text })
    }
  }

  // Transform messages for ChatWindow component
  const transformedMessages = messages.map(m => ({
    id: m.id.toString(),
    text: m.content,
    sender: m.sender_id === Number(user?.id) ? 'me' : 'other',
    time: new Date(m.created_at),
    status: m.is_read ? 'read' : 'sent'
  })) as any[]

  const isClient = user?.role === 'client'

  // Loading state
  if (isLoadingFolders) {
    return <div className="flex items-center justify-center h-full text-gray-400">Загрузка сообщений...</div>
  }

  // Пустое состояние — разное для клиента и гида
  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Folder size={36} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isClient ? 'Пока нет сообщений' : 'Нет активных чатов'}
        </h2>
        <p className="text-gray-500 max-w-md mb-6">
          {isClient 
            ? 'После бронирования экскурсии здесь появится чат с вашим гидом для обсуждения деталей поездки.' 
            : 'Когда клиент забронирует вашу экскурсию, здесь появится чат для общения.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-65px)] -m-4 sm:-m-6 lg:-m-8 bg-white overflow-hidden">
      
      {/* 1. Folders Column (Tours) */}
      <div className="w-20 md:w-64 lg:w-72 border-r bg-gray-50/50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b h-[60px] flex items-center">
          <h2 className="font-bold text-gray-700 hidden md:block">Мои туры</h2>
          <Folder className="md:hidden text-gray-600 mx-auto" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {folders.map(folder => {
            const isActive = folder.tour_id === selectedFolderId
            // Sum unread count
            const totalUnread = folder.chats.reduce((acc, c) => acc + c.unread_count, 0)
            
            return (
              <div
                key={folder.tour_id}
                onClick={() => {
                  setSelectedFolderId(folder.tour_id)
                  // Если в папке только один чат, сразу выбираем его
                  if (folder.chats.length === 1) {
                    setSelectedChatId(folder.chats[0].booking_id)
                  } else {
                    setSelectedChatId(null)
                  }
                }}
                className={cn(
                  "flex items-center gap-3 p-3 md:p-4 cursor-pointer transition-colors border-b border-gray-100 relative group",
                  isActive ? "bg-white border-l-4 border-l-airbnb-rausch shadow-sm" : "hover:bg-gray-100 border-l-4 border-l-transparent"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {folder.tour_photo ? (
                    <img src={folder.tour_photo} alt={folder.tour_title} className="w-full h-full object-cover" />
                  ) : (
                    <MapPin size={20} className="text-gray-500" />
                  )}
                </div>
                <div className="hidden md:block min-w-0 flex-1">
                  <h3 className={cn("font-medium text-sm truncate", isActive ? "text-gray-900" : "text-gray-600")}>
                    {folder.tour_title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {folder.chats.length} {folder.chats.length === 1 ? 'чат' : 'чатов'}
                  </p>
                </div>
                {totalUnread > 0 && (
                  <div className="absolute top-2 right-2 md:relative md:top-auto md:right-auto bg-airbnb-rausch text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalUnread}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Chats Column (Clients in Tour) */}
      <div className={cn(
        "w-full md:w-80 border-r bg-white flex flex-col flex-shrink-0 transition-all",
        selectedChatId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b h-[60px] flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <Input 
              placeholder="Поиск..." 
              className="pl-8 h-9 text-sm bg-gray-50 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {!selectedFolder ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Выберите тур слева
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Нет активных чатов
            </div>
          ) : (
            filteredChats.map(chat => {
              const isActive = chat.booking_id === selectedChatId
              return (
                <div
                  key={chat.booking_id}
                  onClick={() => setSelectedChatId(chat.booking_id)}
                  className={cn(
                    "flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50",
                    isActive && "bg-blue-50/50"
                  )}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {chat.participant.avatar ? (
                        <img src={chat.participant.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-gray-500" />
                      )}
                    </div>
                    {chat.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={cn("font-medium text-sm truncate", isActive ? "text-gray-900" : "text-gray-700")}>
                        {chat.participant.name}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {chat.last_message_time ? format(new Date(chat.last_message_time), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className={cn(
                      "text-xs truncate max-w-[180px]",
                      chat.unread_count > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                    )}>
                      {chat.last_message}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 3. Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-[#efeae2] relative w-full",
        !selectedChatId ? "hidden md:flex" : "flex"
      )}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ 
                 backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
             }} 
        />

        {selectedChat ? (
          <div className="relative z-10 flex-1 flex flex-col h-full">
            {/* Extended Header with Booking Info */}
            <div className="bg-white border-b shadow-sm z-20">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedChatId(null)}
                    className="md:hidden p-1 -ml-2 text-gray-500"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  
                  <div className="flex flex-col">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      {selectedChat.participant.name}
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-normal uppercase",
                        selectedChat.status === 'confirmed' ? "bg-green-100 text-green-700" :
                        selectedChat.status === 'completed' ? "bg-gray-100 text-gray-700" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        {selectedChat.status}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedChat.tour_title}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Booking Context Bar */}
              <div className="px-4 py-2 bg-gray-50 border-t flex items-center gap-4 text-xs text-gray-600 overflow-x-auto">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Calendar size={14} className="text-gray-400" />
                  <span>Бронь #{selectedChat.booking_id}</span>
                </div>
                <div className="w-px h-3 bg-gray-300" />
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Users size={14} className="text-gray-400" />
                  <span>Клиент</span>
                </div>
                <div className="w-px h-3 bg-gray-300" />
                <div className="flex items-center gap-1.5 whitespace-nowrap text-green-600 font-medium">
                  <DollarSign size={14} />
                  <span>Оплачено</span>
                </div>
              </div>
            </div>

            <ChatWindow 
              contact={{
                name: selectedChat.participant.name,
                avatar: selectedChat.participant.avatar,
                online: true // Mocked for now
              }}
              messages={transformedMessages} 
                onSendMessage={handleSendMessage}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 relative z-10">
            <div className="bg-white p-6 rounded-full mb-4 shadow-sm">
                <Users size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-medium text-gray-600 mb-2">Выберите чат</h2>
            <p className="max-w-xs text-center text-sm text-gray-500">
              Здесь вы можете общаться с клиентами по вашим турам.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
