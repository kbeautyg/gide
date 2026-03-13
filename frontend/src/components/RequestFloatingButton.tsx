/**
 * Плавающая кнопка "Заказать экскурсию" (sticky notification)
 * Появляется снизу слева, можно закрыть
 */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'

export function RequestFloatingButton() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('request-btn-dismissed') === 'true' } catch { return false }
  })

  useEffect(() => {
    // Не показывать на странице /request
    if (location.pathname === '/request') {
      setVisible(false)
      return
    }

    // Показать через 3 секунды если не dismissed
    if (!dismissed) {
      const timer = setTimeout(() => {
        setVisible(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [location.pathname, dismissed])

  const handleClose = () => {
    setVisible(false)
    setDismissed(true)
    try { localStorage.setItem('request-btn-dismissed', 'true') } catch {}
  }

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="fixed bottom-6 left-6 z-50 hidden md:block"
        >
          <div className="relative">
            {/* Кнопка закрытия */}
            <button
              onClick={handleClose}
              aria-label="Закрыть уведомление"
              className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors z-10 shadow-md"
            >
              <X size={12} className="md:w-[14px] md:h-[14px]" />
            </button>

            {/* Кнопка */}
            <Link to="/request">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-airbnb-rausch text-white p-3 md:px-6 md:py-4 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 hover:bg-airbnb-rausch/90 transition-colors"
              >
                <Sparkles size={20} className="md:w-6 md:h-6" />
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-sm">Заказать экскурсию</div>
                  <div className="text-xs text-white/80">Индивидуальный тур</div>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

