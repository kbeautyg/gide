import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Search, Circle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  online: boolean
  role: 'guide' | 'client' | 'admin'
}

interface ChatListProps {
  contacts: Contact[]
  selectedId: string | null
  onSelect: (id: string) => void
  onSearch?: (term: string) => void
}

export function ChatList({ contacts, selectedId, onSelect, onSearch }: ChatListProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Сообщения</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            placeholder="Поиск..." 
            className="pl-9 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500" 
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm mt-4">
                Контакты не найдены
            </div>
        ) : (
            contacts.map((contact) => (
            <div
                key={contact.id}
                onClick={() => onSelect(contact.id)}
                className={cn(
                "flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50/50",
                selectedId === contact.id && "bg-blue-50 border-l-4 border-l-blue-500 pl-[13px]" // компенсируем паддинг
                )}
            >
                <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg overflow-hidden border border-gray-100">
                    {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                    ) : (
                    contact.name[0]
                    )}
                </div>
                {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
                </div>
                
                <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">{contact.name}</h3>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {format(contact.lastMessageTime, 'HH:mm', { locale: ru })}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <p className={cn(
                    "text-xs truncate pr-2 max-w-[180px]",
                    contact.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                    )}>
                    {contact.lastMessage}
                    </p>
                    {contact.unreadCount > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {contact.unreadCount}
                    </span>
                    )}
                </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  )
}
