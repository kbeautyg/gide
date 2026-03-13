import React, { useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
    onTranscript: (text: string) => void
    className?: string
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, className }) => {
    const { isListening, isSupported, startListening, stopListening, resetTranscript } = useVoiceInput({
        onResult: (text) => {
            onTranscript(text)
            // Сбрасываем транскрипт после отправки, если нужно, 
            // но обычно мы просто передаем текст вверх
        }
    })

    // Сбрасываем текст при остановке
    useEffect(() => {
        if (!isListening) {
            resetTranscript()
        }
    }, [isListening, resetTranscript])

    if (!isSupported) return null

    return (
        <button
            onClick={isListening ? stopListening : startListening}
            className={cn(
                "p-2 rounded-full transition-all duration-300 relative",
                isListening
                    ? "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    : "hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-gray-800",
                className
            )}
            type="button"
            title={isListening ? "Остановить запись" : "Голосовой ввод"}
        >
            <motion.div
                animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </motion.div>

            {isListening && (
                <span className="absolute -top-1 -right-1 block items-center justify-center">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </span>
            )}
        </button>
    )
}
