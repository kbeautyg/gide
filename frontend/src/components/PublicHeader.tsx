import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { UserCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export function PublicHeader() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-gradient">
          ThaiGuide Pro
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/tours" className="hover:text-tropical-ocean transition-colors">
            Экскурсии
          </Link>
          <Link to="/about" className="hover:text-tropical-ocean transition-colors">
            О нас
          </Link>
          <Link to="/contact" className="hover:text-tropical-ocean transition-colors">
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
  )
}
