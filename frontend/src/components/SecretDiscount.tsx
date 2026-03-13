import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { useConfetti } from '@/hooks/useConfetti'

interface SecretDiscountProps {
  isOpen: boolean
  onClose: () => void
}

export function SecretDiscount({ isOpen, onClose }: SecretDiscountProps) {
  const { fireSideCannons } = useConfetti()

  useEffect(() => {
    if (isOpen) {
      fireSideCannons()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]"
          >
            <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-airbnb-rausch p-8 rounded-3xl shadow-2xl max-w-md">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X size={24} />
              </button>

              {/* Content */}
              <div className="text-center text-white space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  <Sparkles size={48} />
                </motion.div>

                <h2 className="text-3xl font-bold">🎉 Секретная скидка!</h2>
                
                <p className="text-lg">
                  Вы нашли пасхалку! Поздравляем!
                </p>

                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                  <div className="text-5xl font-black mb-2">-15%</div>
                  <div className="text-sm">на все туры</div>
                </div>

                <p className="text-sm opacity-90">
                  Используйте промокод:
                </p>

                <div className="bg-white text-purple-600 px-6 py-3 rounded-full font-mono text-xl font-bold tracking-wider">
                  KONAMI2026
                </div>

                <p className="text-xs opacity-75 mt-4">
                  * Промокод действителен 24 часа
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

