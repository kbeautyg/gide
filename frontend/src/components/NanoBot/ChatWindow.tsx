import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Minimize2, Power, Gift, MapPin, HelpCircle, DollarSign, Sparkles } from 'lucide-react'
import { RichMessage } from './RichMessage'
import { Message } from '@/hooks/useNanoBot'
import { cn } from '@/lib/utils'

// ... existing helper functions (parseMarkdown, Snowflake, TypingIndicator, QuickActionButton) ...

// Snowflake component for decoration
const Snowflake: React.FC<{ delay: number; left: string }> = ({ delay, left }) => (
    <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 100, opacity: [0, 1, 0] }}
        transition={{ 
            duration: 3, 
            delay, 
            repeat: Infinity,
            ease: "linear"
        }}
        className="absolute text-white text-opacity-60 pointer-events-none text-xs"
        style={{ left }}
    >
        ❄️
    </motion.div>
)

// Typing indicator component
const TypingIndicator: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex gap-3 max-w-[85%]"
    >
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <img src="/grinch_avatar.png" alt="Гринч" className="w-full h-full object-cover" />
        </div>
        <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-border/50 shadow-sm">
            <div className="flex gap-1.5 items-center py-1">
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-green-500"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-green-500"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-green-500"
                />
            </div>
        </div>
    </motion.div>
)

// Quick Action Button
const QuickActionButton: React.FC<{
    icon: React.ReactNode
    label: string
    onClick: () => void
    variant?: 'default' | 'primary' | 'festive'
}> = ({ icon, label, onClick, variant = 'default' }) => {
    const variants = {
        default: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm',
        primary: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm',
        festive: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm'
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                variants[variant]
            )}
        >
            {icon}
            {label}
        </motion.button>
    )
}

// Simple markdown parser for chat messages
const parseMarkdown = (text: string): React.ReactNode => {
    if (!text) return null
    
    // Process inline formatting
    const processInline = (str: string): React.ReactNode[] => {
        const result: React.ReactNode[] = []
        let remaining = str
        let inlineKey = 0
        
        // Pattern for **bold**, *italic*, and `code`
        const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
        let match
        let lastIdx = 0
        
        while ((match = pattern.exec(remaining)) !== null) {
            // Add text before match
            if (match.index > lastIdx) {
                result.push(remaining.slice(lastIdx, match.index))
            }
            
            if (match[2]) {
                // Bold **text**
                result.push(<strong key={`b-${inlineKey++}`} className="font-bold">{match[2]}</strong>)
            } else if (match[3]) {
                // Italic *text*
                result.push(<em key={`i-${inlineKey++}`} className="italic">{match[3]}</em>)
            } else if (match[4]) {
                // Code `text`
                result.push(<code key={`c-${inlineKey++}`} className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{match[4]}</code>)
            }
            
            lastIdx = match.index + match[0].length
        }
        
        // Add remaining text
        if (lastIdx < remaining.length) {
            result.push(remaining.slice(lastIdx))
        }
        
        return result.length > 0 ? result : [remaining]
    }
    
    // Split by lines for list handling
    const lines = text.split('\n')
    
    return lines.map((line, idx) => {
        const isListItem = line.trim().startsWith('- ') || line.trim().match(/^\d+\)/)
        const content = processInline(isListItem ? line.replace(/^(\s*-\s*|\s*\d+\)\s*)/, '') : line)
        
        if (isListItem) {
            return (
                <div key={idx} className="flex gap-2 ml-2">
                    <span className="text-green-500">•</span>
                    <span>{content}</span>
                </div>
            )
        }
        
        return (
            <React.Fragment key={idx}>
                {content}
                {idx < lines.length - 1 && <br />}
            </React.Fragment>
        )
    })
}

interface ChatWindowProps {
    messages: Message[]
    onSendMessage: (text: string, displayLabel?: string) => void
    onClose: () => void
    onMinimize: () => void
    isTyping: boolean
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    onSendMessage,
    onClose,
    onMinimize,
    isTyping
}) => {
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue)
            setInputValue('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const quickActions = [
        { icon: <Gift size={14} />, label: 'Украсть скидку', value: 'steal_discount', variant: 'festive' as const },
        { icon: <MapPin size={14} />, label: 'Подобрать тур', value: 'help_choose_tour', variant: 'festive' as const },
        { icon: <DollarSign size={14} />, label: 'Хочу дешевле', value: 'get_discount_for_this', variant: 'festive' as const },
        { icon: <HelpCircle size={14} />, label: 'Вопрос', value: 'ask_question', variant: 'festive' as const }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex flex-col w-[350px] h-[500px] max-w-[90vw] max-h-[60vh] md:max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-green-200/50 dark:border-green-800/30 overflow-hidden font-sans"
        >
            {/* Header with festive decorations */}
            <div className="relative flex items-center justify-between p-3 border-b border-green-100/50 dark:border-green-900/30 bg-gradient-to-r from-green-500 via-green-600 to-green-500 overflow-hidden shrink-0">
                {/* Snowflakes decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Snowflake delay={0} left="10%" />
                    <Snowflake delay={1} left="30%" />
                    <Snowflake delay={2} left="50%" />
                    <Snowflake delay={0.5} left="70%" />
                    <Snowflake delay={1.5} left="90%" />
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/40 shadow-lg">
                            <img 
                                src="/grinch_avatar.png" 
                                alt="Гринч" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">🎄</span>'
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                            Гринч
                            <Sparkles size={12} className="text-yellow-300" />
                        </h3>
                        <p className="text-[10px] text-green-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            Краду лучшие цены...
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 relative z-10">
                    <button 
                        onClick={onMinimize} 
                        className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95" 
                        title="Свернуть"
                    >
                        <Minimize2 size={18} className="text-white/80" />
                    </button>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-red-500/50 rounded-full transition-colors group active:scale-95" 
                        title="Закрыть"
                    >
                        <Power size={18} className="text-white/80 group-hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-green-50/30 to-white dark:from-slate-950/30 dark:to-slate-900 scrollbar-thin scrollbar-thumb-green-200 dark:scrollbar-thumb-green-900">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-3">
                        <motion.div
                            animate={{ 
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="relative"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 overflow-hidden border-4 border-white">
                                <img src="/grinch_avatar.png" alt="Гринч" className="w-full h-full object-cover" />
                            </div>
                            <motion.span 
                                className="absolute -top-1 -right-1 text-xl"
                                animate={{ rotate: [0, 20, -20, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                🎁
                            </motion.span>
                        </motion.div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                Привет, я Гринч! 🎄
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto">
                                Я знаю все секретные ходы и скидки на туры. 
                                <span className="text-green-600 font-medium"> Что ищем?</span>
                            </p>
                        </div>
                        
                        {/* Initial Quick Actions */}
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {quickActions.map((action) => (
                                <QuickActionButton
                                    key={action.value}
                                    icon={action.icon}
                                    label={action.label}
                                    onClick={() => onSendMessage(action.value, action.label)}
                                    variant={action.variant}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index === messages.length - 1 ? 0.1 : 0 }}
                                className={cn(
                                    "flex gap-2 max-w-[90%]",
                                    msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden",
                                    msg.sender === 'user'
                                        ? "bg-blue-600 text-white"
                                        : "bg-green-100"
                                )}>
                                    {msg.sender === 'user' ? (
                                        <User size={12} />
                                    ) : (
                                        <img 
                                            src="/grinch_avatar.png" 
                                            alt="Гринч" 
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                <div className={cn(
                                    "p-2.5 rounded-2xl shadow-sm text-xs leading-relaxed",
                                    msg.sender === 'user'
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-green-100/50 dark:border-green-900/30"
                                )}>
                                    {/* Rich UI Content */}
                                    {msg.type === 'rich' && msg.richContent ? (
                                        <RichMessage
                                            content={msg.richContent}
                                            onAction={(action: string, label?: string) => onSendMessage(action, label)}
                                            onMinimize={onMinimize}
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap">{parseMarkdown(msg.text)}</div>
                                    )}

                                    {/* Quick Actions */}
                                    {msg.actions && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {msg.actions.map((action, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => onSendMessage(action.value, action.label)}
                                                    className="px-2.5 py-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-[10px] font-medium rounded-lg transition-colors shadow-sm"
                                                >
                                                    {action.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing Indicator */}
                        <AnimatePresence>
                            {isTyping && <TypingIndicator />}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Quick Actions Bar (when messages exist) */}
            {messages.length > 0 && (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-green-100/30 dark:border-green-900/20 shrink-0">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {quickActions.map((action) => (
                            <QuickActionButton
                                key={action.value}
                                icon={action.icon}
                                label={action.label}
                                onClick={() => onSendMessage(action.value, action.label)}
                                variant={action.variant}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-green-100/50 dark:border-green-900/30 shrink-0">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border-2 border-transparent focus-within:border-green-500 transition-colors">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Спросите Гринча..."
                        className="flex-1 bg-transparent border-none outline-none text-xs px-2 text-slate-900 dark:text-white placeholder:text-slate-400"
                    />

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            inputValue.trim()
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        <Send size={14} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}
