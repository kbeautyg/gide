import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { UserCircle, Menu } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { MobileMenu } from '@/components/MobileMenu'

export function PublicHeader() {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Hamburger кнопка для мобильных */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        <Link to="/" className="text-2xl font-bold text-gradient">
          ThaiGuide Pro
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`hover:text-airbnb-rausch transition-colors ${
              location.pathname === '/' ? 'text-airbnb-rausch font-semibold' : ''
            }`}
          >
            Главная
          </Link>
          <Link 
            to="/tours" 
            className={`hover:text-airbnb-rausch transition-colors ${
              location.pathname === '/tours' ? 'text-airbnb-rausch font-semibold' : ''
            }`}
          >
            Экскурсии
          </Link>
          <Link 
            to="/journal" 
            className={`hover:text-airbnb-rausch transition-colors ${
              location.pathname.startsWith('/journal') ? 'text-airbnb-rausch font-semibold' : ''
            }`}
          >
            Журнал
          </Link>
          <Link 
            to="/about" 
            className={`hover:text-airbnb-rausch transition-colors ${
              location.pathname === '/about' ? 'text-airbnb-rausch font-semibold' : ''
            }`}
          >
            О нас
          </Link>
          <Link 
            to="/faq" 
            className={`hover:text-airbnb-rausch transition-colors ${
              location.pathname === '/faq' ? 'text-airbnb-rausch font-semibold' : ''
            }`}
          >
            FAQ
          </Link>
          <Link 
            to="/become-guide" 
            className={`hover:text-airbnb-rausch transition-colors ${
              location.pathname === '/become-guide' ? 'text-airbnb-rausch font-semibold' : ''
            }`}
          >
            Стать гидом
          </Link>
          <Link 
            to="/contact" 
            className={`hover:text-airbnb-rausch transition-colors ${
              location.pathname === '/contact' ? 'text-airbnb-rausch font-semibold' : ''
            }`}
          >
            Контакты
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="gap-2">
                  <UserCircle size={20} />
                  {user.name || user.phone}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="tropical">Личный кабинет</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Войти</Button>
              </Link>
              <Link to="/register">
                <Button variant="tropical">Регистрация</Button>
              </Link>
            </>
          )}
        </div>
        </div>
      </header>

      {/* Мобильное меню */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}
