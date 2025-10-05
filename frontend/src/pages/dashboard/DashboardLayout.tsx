import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Wallet, 
  Settings, 
  LogOut,
  Home,
  Calendar
} from 'lucide-react'

export default function DashboardLayout() {
  const { user } = useAuthStore()
  const { logout } = useAuth()

  // Определяем меню в зависимости от роли (иерархия дашбордов)
  const getMenuItems = () => {
    const role = user?.role
    const menuItems = []

    // Супер-админ видит все 4 дашборда
    if (role === 'super_admin') {
      menuItems.push(
        { icon: LayoutDashboard, label: 'Дашборд Супер-Админа', path: '/dashboard/superadmin' },
        { icon: LayoutDashboard, label: 'Дашборд Админа', path: '/dashboard' },
        { icon: LayoutDashboard, label: 'Дашборд Супер-Менеджера', path: '/dashboard' },
        { icon: LayoutDashboard, label: 'Дашборд Менеджера', path: '/dashboard' },
        { icon: Users, label: 'Пользователи', path: '/dashboard/users' },
        { icon: MapPin, label: 'Все экскурсии', path: '/dashboard/all-tours' },
        { icon: Wallet, label: 'Финансы', path: '/dashboard/finances' },
        { icon: Settings, label: 'Настройки', path: '/dashboard/settings' },
      )
    }
    // Админ видит 3 дашборда (без супер-админского)
    else if (role === 'admin') {
      menuItems.push(
        { icon: LayoutDashboard, label: 'Дашборд Админа', path: '/dashboard' },
        { icon: LayoutDashboard, label: 'Дашборд Супер-Менеджера', path: '/dashboard' },
        { icon: LayoutDashboard, label: 'Дашборд Менеджера', path: '/dashboard' },
        { icon: Users, label: 'Моя команда', path: '/dashboard/team' },
        { icon: MapPin, label: 'Экскурсии', path: '/dashboard/tours' },
        { icon: Wallet, label: 'Финансы', path: '/dashboard/finances' },
      )
    }
    // Супер-менеджер видит 2 дашборда
    else if (role === 'super_manager') {
      menuItems.push(
        { icon: LayoutDashboard, label: 'Дашборд Супер-Менеджера', path: '/dashboard' },
        { icon: LayoutDashboard, label: 'Дашборд Менеджера', path: '/dashboard' },
        { icon: Users, label: 'Моя команда', path: '/dashboard/team' },
        { icon: MapPin, label: 'Экскурсии', path: '/dashboard/tours' },
        { icon: Wallet, label: 'Финансы', path: '/dashboard/finances' },
      )
    }
    // Менеджер/Гид видит только свой дашборд
    else if (role === 'manager' || role === 'guide') {
      menuItems.push(
        { icon: LayoutDashboard, label: 'Дашборд Менеджера', path: '/dashboard' },
        { icon: MapPin, label: 'Мои экскурсии', path: '/dashboard/my-tours' },
        { icon: Calendar, label: 'Бронирования', path: '/dashboard/bookings' },
        { icon: Wallet, label: 'Финансы', path: '/dashboard/finances' },
      )
    }

    return menuItems
  }

  const menuItems = getMenuItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gradient">
            ThaiGuide Pro
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user?.name || user?.phone}</p>
              <p className="text-sm text-gray-600">
                {user?.role === 'super_admin' && 'Супер-админ'}
                {user?.role === 'admin' && 'Админ'}
                {user?.role === 'manager' && 'Менеджер'}
                {user?.role === 'guide' && 'Гид'}
                {user?.role === 'client' && 'Клиент'}
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home size={18} />
                На главную
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut size={18} />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 bg-white rounded-lg border p-4 h-fit sticky top-24">
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <Link key={`${item.path}-${index}`} to={item.path}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <item.icon size={18} />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
