import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, Gift, Phone, User, ArrowRight, ChevronLeft, ChevronRight, Calendar, Clock, Users } from 'lucide-react'
import { RichContent } from '@/hooks/useNanoBot'
import { cn } from '@/lib/utils'

interface RichMessageProps {
    content: RichContent
    onAction?: (action: string, label?: string) => void
    onMinimize?: () => void
}

// Fallback image for tours
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'

// Enhanced Tour Card Component
const TourCard: React.FC<{ data: RichContent['data'], onAction?: (action: string, label?: string) => void, onMinimize?: () => void }> = ({ data, onAction, onMinimize }) => {
    if (!data) return null
    
    const imageUrl = data.image || FALLBACK_IMAGE
    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation()
        const id = data.tourId || (data as any).id
        if (id) {
            onMinimize?.()
            onAction?.(`view_tour_${id}`, `👀 Смотрю тур: ${data.title}`)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ y: -2, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 max-w-[300px] cursor-pointer"
            onClick={handleView}
        >
            <div className="relative h-36 overflow-hidden group">
                <img
                    src={imageUrl}
                    alt={data.title || 'Tour'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {data.discount && (
                        <motion.div 
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
                        >
                            -{data.discount}% 🔥
                        </motion.div>
                    )}

                    {data.rating && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-semibold text-gray-800">{data.rating}</span>
                        </div>
                    )}
                </div>

            <div className="p-3.5">
                <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">
                    {data.title || 'Специальный тур'}
                </h4>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {data.location && (
                        <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-green-500" />
                            {data.location}
                        </span>
                    )}
                    {data.duration && (
                        <span className="flex items-center gap-1">
                            <Clock size={12} className="text-blue-500" />
                            {data.duration}
                        </span>
                    )}
                </div>

                {data.price && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                            {data.discount ? (
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xs text-gray-400 line-through">
                                        {Math.round(data.price * (1 + data.discount / 100)).toLocaleString()} ₽
                                    </span>
                                    <span className="text-lg font-bold text-green-600">
                                        {data.price.toLocaleString()} ₽
                                    </span>
                                </div>
                            ) : (
                                <span className="text-lg font-bold text-gray-900">
                                    {data.price.toLocaleString()} ₽
                                </span>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleView}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shadow-md"
                        >
                            Беру! <ArrowRight size={12} />
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

// Multiple Tours Carousel
const ToursCarousel: React.FC<{ data: RichContent['data'], onAction?: (action: string, label?: string) => void, onMinimize?: () => void }> = ({ data, onAction, onMinimize }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const tours = data?.tours || []

    if (tours.length === 0) return null

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % tours.length)
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + tours.length) % tours.length)

    // Swipe handlers
    const onDragEnd = (_: any, info: any) => {
        if (info.offset.x < -50) {
            nextSlide()
        } else if (info.offset.x > 50) {
            prevSlide()
        }
    }

    return (
        <div className="relative group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={onDragEnd}
                    className="touch-pan-y" // Allow vertical scrolling but capture horizontal
                >
                    <TourCard 
                        data={tours[currentIndex]} 
                        onAction={onAction}
                        onMinimize={onMinimize}
                    />
                </motion.div>
            </AnimatePresence>

            {tours.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-orange-50 transition-colors z-10 text-orange-500"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-orange-50 transition-colors z-10 text-orange-500"
                    >
                        <ChevronRight size={20} strokeWidth={2.5} />
                    </button>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-1.5 mt-3">
                        {tours.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    idx === currentIndex ? "bg-orange-500 w-4" : "bg-gray-300"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

// Enhanced Steal Deal Component - Grinch's signature feature
const StealDeal: React.FC<{ data: RichContent['data'], onAction?: (action: string, label?: string) => void }> = ({ data, onAction }) => {
    const [isRevealed, setIsRevealed] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="relative max-w-[300px]"
        >
            <AnimatePresence mode="wait">
                {!isRevealed ? (
                    <motion.div
                        key="hidden"
                        exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                        className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-xl p-5 text-white relative overflow-hidden cursor-pointer"
                        onClick={() => setIsRevealed(true)}
                    >
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <motion.div 
                                className="absolute top-2 right-2 text-6xl"
                                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                🎁
                            </motion.div>
                            <motion.div 
                                className="absolute bottom-2 left-2 text-4xl"
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                🎁
                            </motion.div>
                        </div>

                        <div className="relative z-10 text-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-4xl mb-3"
                            >
                                🎁
                            </motion.div>
                            <h4 className="font-bold text-lg mb-2">Секретная скидка!</h4>
                            <p className="text-sm text-green-100 mb-4">
                                Гринч украл что-то особенное...
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full py-2.5 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Gift size={16} />
                                Открыть подарок!
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="revealed"
                        initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        className="bg-gradient-to-br from-red-500 via-red-600 to-green-600 rounded-xl p-5 text-white relative overflow-hidden"
                    >
                        {/* Confetti effect */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute text-xl"
                                    initial={{ 
                                        x: '50%', 
                                        y: '50%',
                                        opacity: 1
                                    }}
                                    animate={{ 
                                        x: `${Math.random() * 100}%`, 
                                        y: `${Math.random() * 100}%`,
                                        opacity: 0
                                    }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                >
                                    {['🎉', '✨', '⭐', '🎊'][i % 4]}
                                </motion.div>
                            ))}
                        </div>

                        <div className="relative z-10 text-center">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 0.5 }}
                                className="text-5xl mb-2"
                            >
                                🎁
                            </motion.div>
                            <h4 className="font-bold text-2xl mb-1">
                                -{data?.discount || 15}%
                            </h4>
                            <p className="text-sm text-white/90 mb-4">
                                Эксклюзивная скидка от Гринча!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onAction?.('claim_steal_deal', '🤫 Тсс! Беру скидку!')}
                                className="w-full py-2.5 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors"
                            >
                                🤫 Забрать пока не увидел Санта!
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// Enhanced Lead Form Component
const LeadForm: React.FC<{ onAction?: (action: string, label?: string) => void }> = ({ onAction }) => {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '')
        if (digits.length === 0) return ''
        if (digits.length <= 1) return `+${digits}`
        if (digits.length <= 4) return `+${digits.slice(0,1)} (${digits.slice(1)}`
        if (digits.length <= 7) return `+${digits.slice(0,1)} (${digits.slice(1,4)}) ${digits.slice(4)}`
        if (digits.length <= 9) return `+${digits.slice(0,1)} (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`
        return `+${digits.slice(0,1)} (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7,9)}-${digits.slice(9,11)}`
    }

    const handleSubmit = async () => {
        if (name && phone) {
            setIsSubmitting(true)
            await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API call
            setIsSubmitting(false)
            setIsSubmitted(true)
            // Use label undefined or empty to prevent user message in chat, 
            // as the form UI handles the success state visually
            onAction?.(`lead_form:${name}:${phone}`, '') 
        }
    }

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white text-center max-w-[280px]"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="text-4xl mb-3"
                >
                    ✅
                </motion.div>
                <h4 className="font-bold text-lg mb-1">Отлично, {name}!</h4>
                <p className="text-sm text-green-100">
                    Наш менеджер позвонит вам в ближайшие 5 минут 📞
                </p>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-md border border-gray-100 max-w-[280px]"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <Phone size={18} className="text-white" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">Перезвоним за 5 минут</h4>
                    <p className="text-xs text-gray-500">Бесплатная консультация</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="tel"
                        placeholder="+7 (___) ___-__-__"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={!name || !phone || isSubmitting}
                    className={cn(
                        "w-full py-2.5 font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2",
                        name && phone
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/30"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {isSubmitting ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                    ) : (
                        <>Жду звонка! 📞</>
                    )}
                </motion.button>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-3">
                Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
        </motion.div>
    )
}

// Quick Booking Card
const QuickBooking: React.FC<{ data: RichContent['data'], onAction?: (action: string, label?: string) => void }> = ({ data, onAction }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [guests, setGuests] = useState(2)

    const dates = data?.availableDates || [
        { date: '25 дек', available: true },
        { date: '26 дек', available: true },
        { date: '27 дек', available: false },
        { date: '28 дек', available: true },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-md border border-gray-100 max-w-[300px]"
        >
            <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-green-500" />
                Выберите дату
            </h4>

            <div className="flex flex-wrap gap-2 mb-4">
                {dates.map((d: any, idx: number) => (
                    <button
                        key={idx}
                        disabled={!d.available}
                        onClick={() => setSelectedDate(d.date)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                            selectedDate === d.date
                                ? "bg-green-500 text-white"
                                : d.available
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                        )}
                    >
                        {d.date}
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Users size={14} /> Гостей:
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                    >
                        -
                    </button>
                    <span className="w-6 text-center font-semibold">{guests}</span>
                    <button
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                    >
                        +
                    </button>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!selectedDate}
                onClick={() => onAction?.(`quick_book:${selectedDate}:${guests}`, `📅 Бронирую на ${selectedDate} для ${guests}`)}
                className={cn(
                    "w-full py-2.5 rounded-lg font-medium text-sm transition-all",
                    selectedDate
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
            >
                Забронировать {selectedDate && `на ${selectedDate}`}
            </motion.button>
        </motion.div>
    )
}

// Main Rich Message Renderer
export const RichMessage: React.FC<RichMessageProps> = ({ content, onAction, onMinimize }) => {
    switch (content.type) {
        case 'tour_card':
            return <TourCard data={content.data} onAction={onAction} onMinimize={onMinimize} />
        case 'tours_carousel':
            return <ToursCarousel data={content.data} onAction={onAction} onMinimize={onMinimize} />
        case 'steal_deal':
            return <StealDeal data={content.data} onAction={onAction} />
        case 'lead_form':
            return <LeadForm onAction={onAction} />
        case 'quick_booking':
            return <QuickBooking data={content.data} onAction={onAction} />
        default:
            return null
    }
}
