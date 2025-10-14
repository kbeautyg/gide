import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar,
  CreditCard,
  Settings, 
  LogOut,
  Home,
  FileText,
  Shield,
  Menu,
  X,
  ShoppingBag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, toursApi } from '@/lib/api'

export default function DashboardLayout() {
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Загружаем счетчики для быстрой навигации
  const { data: requestsData } = useQuery({
    queryKey: ['requests', 'available'],
    queryFn: () => api.get('/requests/available').then(res => res.data),
  })

  const { data: toursData } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList({ include_private: true }),
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings/').then(res => res.data),
  })

  const requestsCount = requestsData?.total || 0
  const toursCount = toursData?.data?.tours?.length || 0
  const bookingsCount = bookingsData?.total || 0

  const menuItems = [
    { icon: LayoutDashboard, label: 'Дашборд', path: '/dashboard' },
    ...(user?.role === 'admin' 
      ? [{ icon: Shield, label: 'Админ-панель', path: '/dashboard/admin' }] 
      : []),
    { icon: MapPin, label: 'Мои экскурсии', path: '/dashboard/my-tours' },
    { icon: FileText, label: 'Заявки', path: '/dashboard/requests', badge: 'new' },
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
          <Logo size="md" linkTo="/" />
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home size={18} />
                На главную
              </Button>
            </Link>

            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-airbnb-rausch rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0] || user?.phone?.[0] || 'Г'}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.name || user?.phone}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Администратор' : 'Гид'}
                </p>
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

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* User info */}
              <div className="flex items-center gap-3 pb-6 border-b">
                <div className="w-12 h-12 bg-airbnb-rausch rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.[0] || user?.phone?.[0] || 'Г'}
                </div>
                <div>
                  <p className="font-semibold">{user?.name || user?.phone}</p>
                  <p className="text-sm text-gray-500">
                    {user?.role === 'admin' ? 'Администратор' : 'Гид'}
                  </p>
                </div>
              </div>

              {/* Menu items */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? 'bg-airbnb-rausch text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Actions */}
              <div className="space-y-2 pt-6 border-t">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <Home size={18} />
                    На главную
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="w-full gap-2"
                >
                  <LogOut size={18} />
                  Выйти
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Быстрая навигация с счётчиками */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b sticky top-[73px] z-30 hidden md:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            <Link
              to="/dashboard/requests"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-airbnb-rausch hover:shadow-md transition-all whitespace-nowrap"
            >
              <FileText size={16} className="text-airbnb-rausch" />
              <span className="text-sm font-medium">Заявки</span>
              <span className="px-2 py-0.5 bg-airbnb-rausch text-white rounded-full text-xs font-bold">
                {requestsCount}
              </span>
            </Link>

            <Link
              to="/dashboard/my-tours"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-blue-500 hover:shadow-md transition-all whitespace-nowrap"
            >
              <MapPin size={16} className="text-blue-600" />
              <span className="text-sm font-medium">Мои экскурсии</span>
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                {toursCount}
              </span>
            </Link>

            <Link
              to="/dashboard/calendar"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-green-500 hover:shadow-md transition-all whitespace-nowrap"
            >
              <Calendar size={16} className="text-green-600" />
              <span className="text-sm font-medium">Календарь</span>
            </Link>

            <Link
              to="/dashboard/bookings"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-purple-500 hover:shadow-md transition-all whitespace-nowrap"
            >
              <ShoppingBag size={16} className="text-purple-600" />
              <span className="text-sm font-medium">Заказы</span>
              <span className="px-2 py-0.5 bg-purple-600 text-white rounded-full text-xs font-bold">
                {bookingsCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - только desktop */}
        <aside className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-73px)]">
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
                      ? 'bg-airbnb-rausch text-white shadow-md'
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
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}