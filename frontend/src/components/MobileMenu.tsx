import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { X, Home, Compass, BookOpen, Info, HelpCircle, Briefcase, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/tours', label: 'Экскурсии', icon: Compass },
  { to: '/journal', label: 'Журнал', icon: BookOpen },
  { to: '/about', label: 'О нас', icon: Info },
  { to: '/faq', label: 'FAQ', icon: HelpCircle },
  { to: '/become-guide', label: 'Стать гидом', icon: Briefcase },
  { to: '/contact', label: 'Контакты', icon: Phone },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-airbnb-lg z-50 md:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <Link to="/" onClick={onClose} className="text-2xl font-bold">
                <span className="text-[#FF385C]">In</span><span className="text-[#FF385C]">Turex</span><span className="ml-1 text-[#FF385C]/70 font-light">Pro</span>
              </Link>
              <button
                onClick={onClose}
                aria-label="Закрыть меню"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.to || 
                    (item.to !== '/' && location.pathname.startsWith(item.to))

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-airbnb-rausch/10 text-airbnb-rausch font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Footer с кнопками аутентификации */}
            <div className="p-6 border-t space-y-3">
              {isAuthenticated && user ? (
                <>
                  <div className="text-sm text-gray-600 mb-2">
                    Привет, {user.name || user.phone}!
                  </div>
                  <Link to="/dashboard" onClick={onClose}>
                    <Button className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch/90">
                      Личный кабинет
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={onClose}>
                    <Button variant="outline" className="w-full">
                      Войти
                    </Button>
                  </Link>
                  <Link to="/register" onClick={onClose}>
                    <Button className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch/90">
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

