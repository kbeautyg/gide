import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNanoBot } from '@/hooks/useNanoBot'
import { ChatWindow } from './ChatWindow'
import { cn } from '@/lib/utils'

// Rotating tooltip messages for engagement
const TOOLTIP_MESSAGES = [
    { emoji: '😏', text: 'Украсть скидку?' },
    { emoji: '🎁', text: 'Есть секретное предложение!' },
    { emoji: '🤫', text: 'Псс... Знаю как дешевле!' },
    { emoji: '🎄', text: 'Новогодняя скидка ждёт!' },
    { emoji: '🎁', text: 'Хочешь выгодный тур?' },
    { emoji: '💸', text: 'Сэкономить на отдыхе?' },
]

export const NanoBot: React.FC = () => {
    const { isOpen, toggle, close, messages, sendMessage, isTyping } = useNanoBot()
    const [isHidden, setIsHidden] = useState(false)
    const [tooltipIndex, setTooltipIndex] = useState(0)
    const [showTooltip, setShowTooltip] = useState(false)

    // Delay appearance effect
    useEffect(() => {
        setIsHidden(true)
        const timer = setTimeout(() => setIsHidden(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    // Rotate tooltip messages
    useEffect(() => {
        if (isOpen) return

        // Show tooltip after 3 seconds
        const showTimer = setTimeout(() => setShowTooltip(true), 3000)

        // Rotate messages every 8 seconds
        const rotateInterval = setInterval(() => {
            setTooltipIndex(prev => (prev + 1) % TOOLTIP_MESSAGES.length)
        }, 8000)

        return () => {
            clearTimeout(showTimer)
            clearInterval(rotateInterval)
        }
    }, [isOpen])

    // Hide tooltip when chat opens
    useEffect(() => {
        if (isOpen) setShowTooltip(false)
    }, [isOpen])

    if (isHidden) return null

    const currentTooltip = TOOLTIP_MESSAGES[tooltipIndex]

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <ChatWindow
                            messages={messages}
                            onSendMessage={sendMessage}
                            onClose={close}
                            onMinimize={toggle}
                            isTyping={isTyping}
                        />
                    )}
                </AnimatePresence>
            </div>

            <div className="pointer-events-auto group relative">
                {/* Animated Tooltip */}
                <AnimatePresence>
                    {!isOpen && showTooltip && (
                        <motion.div
                            key={tooltipIndex}
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="absolute right-20 top-1/2 -translate-y-1/2 bg-white px-4 py-2.5 rounded-xl shadow-lg border border-green-100 whitespace-nowrap cursor-pointer hover:bg-green-50 transition-colors"
                            onClick={toggle}
                        >
                            <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                <motion.span 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    {currentTooltip.emoji}
                                </motion.span>
                                {currentTooltip.text}
                            </p>
                            {/* Arrow pointer */}
                            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-green-100 rotate-45" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <BotButton onClick={toggle} isOpen={isOpen} />
            </div>
        </div>
    )
}

function BotButton({ onClick, isOpen }: { onClick: () => void, isOpen: boolean }) {
    return (
        <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: isOpen ? 90 : 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={cn(
                "w-16 h-16 rounded-full shadow-2xl border-4 flex items-center justify-center relative transition-all duration-300 overflow-hidden",
                isOpen
                    ? "bg-white border-gray-200"
                    : "bg-gradient-to-br from-green-400 via-green-500 to-green-600 border-white hover:shadow-green-500/50"
            )}
        >
            {isOpen ? (
                <motion.span 
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 90 }}
                    className="text-2xl text-gray-500"
                >
                    ✕
                </motion.span>
            ) : (
                <div 
                    className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full"
                >
                    <img 
                        src="/grinch_avatar.png" 
                        alt="Гринч" 
                        className="w-full h-full object-cover transform scale-110"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                    />
                    <span className="hidden text-4xl filter drop-shadow-md">🎄</span>
                </div>
            )}

            {/* Festive decorations when closed */}
            {!isOpen && (
                <>
                    {/* Christmas hat hint */}
                    <motion.span 
                        className="absolute -top-1 left-1/2 -translate-x-1/2 text-sm"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        🎄
                    </motion.span>

                    {/* Ping notification */}
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white items-center justify-center">
                            <span className="text-[8px] text-white font-bold">1</span>
                        </span>
                    </span>
                </>
            )}
        </motion.button>
    )
}
