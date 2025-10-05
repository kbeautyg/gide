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
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardLayout() {
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const [dashboardsOpen, setDashboardsOpen] = useState(true)

  // Цвета для каждой роли
  const roleColors = {
    super_admin: 'text-purple-600 bg-purple-50',
    admin: 'text-blue-600 bg-blue-50',
    super_manager: 'text-green-600 bg-green-50',
    manager: 'text-orange-600 bg-orange-50',
    guide: 'text-orange-600 bg-orange-50',
  }

  // Определяем доступные дашборды в зависимости от роли
  const getDashboards = () => {
    const role = user?.role

    if (role === 'super_admin') {
      return [
        { 
          label: 'Дашборд Супер-Админа', 
          path: '/dashboard/superadmin',
          color: roleColors.super_admin
        },
        { 
          label: 'Дашборд Админа', 
          path: '/dashboard/admin',
          color: roleColors.admin
        },
        { 
          label: 'Дашборд Супер-Менеджера', 
          path: '/dashboard/supermanager',
          color: roleColors.super_manager
        },
        { 
          label: 'Дашборд Менеджера', 
          path: '/dashboard/manager',
          color: roleColors.manager
        },
      ]
    }

    if (role === 'admin') {
      return [
        { 
          label: 'Дашборд Админа', 
          path: '/dashboard/admin',
          color: roleColors.admin
        },
        { 
          label: 'Дашборд Супер-Менеджера', 
          path: '/dashboard/supermanager',
          color: roleColors.super_manager
        },
        { 
          label: 'Дашборд Менеджера', 
          path: '/dashboard/manager',
          color: roleColors.manager
        },
      ]
    }

    if (role === 'super_manager') {
      return [
        { 
          label: 'Дашборд Супер-Менеджера', 
          path: '/dashboard/supermanager',
          color: roleColors.super_manager
        },
        { 
          label: 'Дашборд Менеджера', 
          path: '/dashboard/manager',
          color: roleColors.manager
        },
      ]
    }

    if (role === 'manager' || role === 'guide') {
      return [
        { 
          label: 'Дашборд Менеджера', 
          path: '/dashboard/manager',
          color: roleColors.manager
        },
      ]
    }

    return []
  }

  // Определяем остальные пункты меню в зависимости от роли
  const getMenuItems = () => {
    const role = user?.role

    if (role === 'super_admin') {
      return [
        { icon: Users, label: 'Пользователи', path: '/dashboard/users' },
        { icon: MapPin, label: 'Все экскурсии', path: '/dashboard/all-tours' },
        { icon: Wallet, label: 'Финансы', path: '/dashboard/finances' },
        { icon: Settings, label: 'Настройки', path: '/dashboard/settings' },
      ]
    }

    if (role === 'admin') {
      return [
        { icon: Users, label: 'Моя команда', path: '/dashboard/users' },
        { icon: MapPin, label: 'Все экскурсии', path: '/dashboard/all-tours' },
        { icon: Wallet, label: 'Финансы', path: '/dashboard/finances' },
        { icon: Settings, label: 'Настройки', path: '/dashboard/settings' },
      ]
    }

    if (role === 'super_manager') {
      return [
        { icon: Users, label: 'Моя команда', path: '/dashboard/users' },
        { icon: MapPin, label: 'Экскурсии', path: '/dashboard/all-tours' },
        { icon: Wallet, label: 'Финансы', path: '/dashboard/finances' },
      ]
    }

    if (role === 'manager' || role === 'guide') {
      return [
        { icon: MapPin, label: 'Мои экскурсии', path: '/dashboard/my-tours' },
        { icon: Calendar, label: 'Бронирования', path: '/dashboard/bookings' },
        { icon: Wallet, label: 'Финансы', path: '/dashboard/finances' },
      ]
    }

    return []
  }

  const dashboards = getDashboards()
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
                {user?.role === 'super_manager' && 'Супер-менеджер'}
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
            {/* Дашборды - выпадающее меню */}
            {dashboards.length > 0 && (
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between gap-2"
                  onClick={() => setDashboardsOpen(!dashboardsOpen)}
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard size={18} />
                    <span>Дашборды</span>
                  </div>
                  {dashboardsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
                
                {/* Подменю с дашбордами */}
                {dashboardsOpen && (
                  <div className="pl-4 space-y-1 border-l-2 border-gray-200 ml-2">
                    {dashboards.map((dashboard, index) => (
                      <Link key={`${dashboard.path}-${index}`} to={dashboard.path}>
                        <Button 
                          variant="ghost" 
                          className={`w-full justify-start gap-2 text-sm ${dashboard.color || ''}`}
                        >
                          {dashboard.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Остальные пункты меню */}
            {menuItems.map((item, index) => (
              <Link key={`${item.path}-${index}`} to={item.path}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start gap-2 ${item.color || ''}`}
                >
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
