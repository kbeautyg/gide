import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar,
  CreditCard,
  Settings, 
  LogOut,
  Home
} from 'lucide-react'

export default function DashboardLayout() {
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const location = useLocation()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Дашборд', path: '/dashboard' },
    { icon: MapPin, label: 'Мои экскурсии', path: '/dashboard/my-tours' },
    { icon: Calendar, label: 'Календарь', path: '/dashboard/calendar' },
    { icon: CreditCard, label: 'Заказы', path: '/dashboard/bookings' },
    { icon: Settings, label: 'Настройки', path: '/dashboard/settings' },
  ]

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-tropical-ocean to-tropical-turquoise bg-clip-text text-transparent">
            ThaiGuide Pro
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home size={18} />
                На главную
              </Button>
            </Link>

            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-tropical-ocean to-tropical-turquoise rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0] || user?.phone?.[0] || 'Г'}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.name || user?.phone}</p>
                <p className="text-xs text-gray-500">Гид</p>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="gap-2"
            >
              <LogOut size={18} />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-tropical-ocean text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}