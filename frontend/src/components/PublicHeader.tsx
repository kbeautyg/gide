import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserCircle, Menu, Search, ChevronDown, Briefcase, User } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { MobileMenu } from '@/components/MobileMenu'
import { MobileSearchModal } from '@/components/MobileSearchModal'
import { Logo } from '@/components/Logo'

function getRoleLabel(role: string) {
  if (role === 'admin' || role === 'super_admin') return 'Админ'
  if (role === 'manager' || role === 'guide') return 'Гид'
  return 'Клиент'
}

function getRoleIcon(role: string) {
  if (role === 'manager' || role === 'guide') return Briefcase
  return User
}

export function PublicHeader() {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const roleMenuRef = useRef<HTMLDivElement>(null)

  // Close role menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false)
      }
    }
    if (roleMenuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [roleMenuOpen])

  return (
    <>
      {/* Floating Glassmorphism Header */}
      <header className="fixed top-4 left-4 right-4 z-50 transition-all duration-300">
        <div className="container mx-auto px-0 flex items-center justify-between gap-2 md:gap-4">
          {/* Мобильная версия: Меню + Поиск */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Hamburger для мобильных */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Открыть меню"
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all backdrop-blur-xl border border-gray-200/50"
            >
              <Menu size={20} />
            </button>

            {/* Иконка поиска для мобильных */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Открыть поиск"
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all backdrop-blur-xl border border-gray-200/50"
            >
              <Search size={20} className="text-gray-700" />
            </button>
          </div>

          {/* Десктопная версия: Лого в белой капсуле */}
          <div className="hidden md:block">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
              <Logo size="sm" linkTo="/" className="text-airbnb-rausch" />
            </div>
          </div>

          {/* Навигация - эффект жидкого стекла (glassmorphism) */}
          <nav className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-white/50">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname === '/' 
                  ? 'bg-airbnb-rausch text-white font-semibold hover:bg-airbnb-rausch' 
                  : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              Главная
            </Link>
            <Link 
              to="/tours" 
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname === '/tours' 
                  ? 'bg-airbnb-rausch text-white font-semibold hover:bg-airbnb-rausch' 
                  : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              Экскурсии
            </Link>
            <Link 
              to="/journal" 
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname.startsWith('/journal') 
                  ? 'bg-airbnb-rausch text-white font-semibold hover:bg-airbnb-rausch' 
                  : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              Журнал
            </Link>
            <Link 
              to="/about" 
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname === '/about' 
                  ? 'bg-airbnb-rausch text-white font-semibold hover:bg-airbnb-rausch' 
                  : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              О нас
            </Link>
            <Link 
              to="/become-guide" 
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname === '/become-guide' 
                  ? 'bg-airbnb-rausch text-white font-semibold hover:bg-airbnb-rausch' 
                  : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              Стать гидом
            </Link>
          </nav>

          {/* Кнопки авторизации - эффект жидкого стекла */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Мобильный: переключатель роли */}
            {isAuthenticated && user && (
              <div className="relative md:hidden" ref={roleMenuRef}>
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xl rounded-full px-3 py-2.5 shadow-lg border border-white/50 text-sm font-medium text-gray-700"
                >
                  {(() => { const Icon = getRoleIcon(user.role); return <Icon size={16} /> })()}
                  <span>{getRoleLabel(user.role)}</span>
                  <ChevronDown size={14} className={`transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
                    <Link
                      to="/dashboard"
                      onClick={() => setRoleMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} />
                      <span>Кабинет клиента</span>
                    </Link>
                    {(user.role === 'manager' || user.role === 'guide') ? (
                      <Link
                        to="/dashboard/tours"
                        onClick={() => setRoleMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50"
                      >
                        <Briefcase size={16} />
                        <span>Кабинет гида</span>
                      </Link>
                    ) : (
                      <Link
                        to="/become-guide"
                        onClick={() => setRoleMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#FF385C] hover:bg-red-50 transition-colors border-t border-gray-50"
                      >
                        <Briefcase size={16} />
                        <span>Стать гидом</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-full px-4 py-3 shadow-lg border border-white/50">
              {isAuthenticated && user ? (
                <>
                  <Link to="/dashboard" className="hidden md:block">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100/80 transition-all text-gray-700">
                      <UserCircle size={20} />
                      <span className="text-sm font-medium">{user.name || user.phone}</span>
                    </button>
                  </Link>
                  {/* Десктоп: текст "Кабинет", Мобильный: иконка */}
                  <Link to="/dashboard">
                    <button className="bg-[#FF385C] text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center md:px-6 md:py-2 p-2 md:p-0">
                      <span className="hidden md:inline">Кабинет</span>
                      <UserCircle size={20} className="md:hidden" />
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden md:block">
                    <button className="px-4 py-2 rounded-full hover:bg-gray-100/80 transition-all text-gray-700 font-medium">
                      Войти
                    </button>
                  </Link>
                  {/* Десктоп: текст "Регистрация", Мобильный: иконка */}
                  <Link to="/register">
                    <button className="bg-[#FF385C] text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center md:px-6 md:py-2 p-2 md:p-0">
                      <span className="hidden md:inline">Регистрация</span>
                      <UserCircle size={20} className="md:hidden" />
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Отступ для всех страниц кроме главной */}
      {location.pathname !== '/' && <div className="h-24" />}

      {/* Мобильное меню */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      {/* Мобильный поиск */}
      <MobileSearchModal isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
    </>
  )
}
