import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, MoreVertical, Phone, Info, Check, CheckCheck, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn, getImageUrl } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'me' | 'other'
  time: Date
  status: 'sent' | 'delivered' | 'read'
}

interface ChatWindowProps {
  contact: any
  messages: Message[]
  onSendMessage: (text: string) => void
  onBack?: () => void
}

export function ChatWindow({ contact, messages, onSendMessage, onBack }: ChatWindowProps) {
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Автоскролл вниз
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!inputText.trim()) return
    onSendMessage(inputText)
    setInputText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent text-gray-400">
        Выберите чат для начала общения
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="bg-white px-4 py-2 border-b flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Button>
          )}
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            {contact.avatar ? (
              <img src={getImageUrl(contact.avatar)} alt={contact.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-gray-500 text-sm">{contact.name[0]}</span>
            )}
          </div>
          <div className="cursor-pointer">
            <h3 className="font-semibold text-gray-900 leading-none text-sm">{contact.name}</h3>
            <span className="text-[11px] text-gray-500">
              {contact.online ? <span className="text-blue-500">в сети</span> : 'был(а) недавно'}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 z-10"
      >
        {messages.map((msg, index) => {
          const isMe = msg.sender === 'me'
          const showDate = index === 0 || new Date(msg.time).getDate() !== new Date(messages[index - 1].time).getDate()

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center mb-4 mt-2">
                  <span className="bg-gray-200/80 backdrop-blur-sm text-gray-600 text-[10px] py-1 px-3 rounded-full shadow-sm font-medium">
                    {format(msg.time, 'd MMMM', { locale: ru })}
                  </span>
                </div>
              )}
              <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] md:max-w-[60%] rounded-2xl px-3 py-1.5 shadow-sm relative group text-sm",
                    isMe 
                        ? "bg-[#e3fcd3] text-gray-900 rounded-tr-sm" 
                        : "bg-white text-gray-900 rounded-tl-sm"
                  )}
                >
                  <p className="leading-relaxed break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  <div className={cn("flex items-center gap-1 mt-0.5", isMe ? "justify-end" : "justify-end")}>
                    <span className={cn("text-[9px]", isMe ? "text-green-800/60" : "text-gray-400")}>
                      {format(msg.time, 'HH:mm')}
                    </span>
                    {isMe && (
                      <span className={cn(msg.status === 'read' ? "text-blue-500" : "text-gray-400")}>
                        {msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] p-2 sm:p-3 border-t flex items-center gap-2 z-20">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-transparent">
          <Smile size={22} />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-transparent -ml-2">
          <Paperclip size={20} />
        </Button>
        <div className="flex-1 bg-white rounded-lg px-3 py-1.5 flex items-center border border-transparent focus-within:border-white focus-within:ring-1 focus-within:ring-white">
            <Input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Написать сообщение..."
            className="flex-1 bg-transparent border-none focus-visible:ring-0 p-0 h-auto text-sm placeholder:text-gray-400"
            />
        </div>
        <Button 
          onClick={handleSend} 
          disabled={!inputText.trim()}
          variant="ghost"
          className={cn("text-gray-500 hover:bg-transparent hover:text-blue-600 transition-colors", inputText.trim() && "text-blue-600")}
        >
          <Send size={22} />
        </Button>
      </div>
    </div>
  )
}
