import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'
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
  ShoppingBag,
  Heart,
  MessageCircle,
  UserPlus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, toursApi } from '@/lib/api'

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  badge?: string;
  disabled?: boolean;
}

export default function DashboardLayout() {
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Проверка ролей
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const isGuide = user?.role === 'manager' || user?.role === 'guide'
  const isClient = !isAdmin && !isGuide

  // Эффект скролла для хедера
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Загружаем счетчики только для гидов и админов
  const { data: requestsData } = useQuery({
    queryKey: ['requests', 'available'],
    queryFn: () => api.get('/requests/available').then(res => res.data),
    enabled: isAdmin || isGuide
  })

  const { data: toursData } = useQuery({
    queryKey: ['tours'],
    queryFn: () => toursApi.getList({ include_private: true }),
    enabled: isAdmin || isGuide
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings/').then(res => res.data),
    // Разрешаем загрузку для всех авторизованных пользователей (включая клиентов)
    enabled: !!user
  })

  const requestsCount = requestsData?.total || 0
  const toursCount = toursData?.data?.tours?.length || 0
  const bookingsCount = bookingsData?.total || 0

  // Формирование меню в зависимости от роли
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { icon: LayoutDashboard, label: 'Дашборд', path: '/dashboard' },
    ]

    if (isAdmin) {
      return [
        ...baseItems,
        { icon: Shield, label: 'Админ-панель', path: '/dashboard/admin' },
        { icon: UserPlus, label: 'Заявки гидов', path: '/dashboard/admin/applications' },
        { icon: MapPin, label: 'Все экскурсии', path: '/dashboard/my-tours' },
        { icon: FileText, label: 'Заявки', path: '/dashboard/requests', badge: requestsCount > 0 ? String(requestsCount) : undefined },
        { icon: Calendar, label: 'Календарь', path: '/dashboard/calendar' },
        { icon: CreditCard, label: 'Заказы', path: '/dashboard/bookings', badge: bookingsCount > 0 ? String(bookingsCount) : undefined },
        { icon: MessageCircle, label: 'Сообщения', path: '/dashboard/messages' },
        { icon: Settings, label: 'Настройки', path: '/dashboard/settings' },
      ]
    }

    if (isGuide) {
      return [
        ...baseItems,
        { icon: MapPin, label: 'Мои экскурсии', path: '/dashboard/my-tours' },
        { icon: FileText, label: 'Заявки', path: '/dashboard/requests', badge: requestsCount > 0 ? String(requestsCount) : undefined },
        { icon: Calendar, label: 'Календарь', path: '/dashboard/calendar' },
        { icon: CreditCard, label: 'Заказы', path: '/dashboard/bookings' },
        { icon: MessageCircle, label: 'Сообщения', path: '/dashboard/messages' },
        { icon: Settings, label: 'Настройки', path: '/dashboard/settings' },
      ]
    }

    // Меню для клиента
    return [
      ...baseItems,
      { icon: CreditCard, label: 'Мои поездки', path: '/dashboard/bookings' },
      { icon: Heart, label: 'Избранное', path: '/dashboard/favorites' },
      { icon: MessageCircle, label: 'Сообщения', path: '/dashboard/messages' },
      { icon: Settings, label: 'Настройки', path: '/dashboard/settings' },
    ]
  }

  const menuItems = getMenuItems()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className={`bg-white sticky top-0 z-40 transition-all duration-200 ${scrolled ? 'shadow-md py-2' : 'border-b py-3'}`}>
        <div className="w-full max-w-full mx-auto px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo size="md" linkTo="/" className="text-airbnb-rausch" />
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
                <Home size={18} />
                <span className="hidden xl:inline">Главная</span>
              </Button>
            </Link>

            <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

            {/* Notification Center */}
            <NotificationCenter />

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name || user?.phone}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {isAdmin ? 'Администратор' : isGuide ? 'Гид' : 'Турист'}
                </p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-airbnb-rausch to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                {user?.name?.[0] || user?.phone?.[0] || 'U'}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Выйти"
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
            </Button>
          </div>

          {/* Mobile hamburger button */}
          <div className="lg:hidden flex items-center gap-2">
            <NotificationCenter />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
            className="fixed inset-y-0 right-0 w-[85vw] max-w-xs bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
          >
            <div className="p-4 space-y-6">
              {/* User info */}
              <div className="flex items-center gap-3 pb-6 border-b">
                <div className="w-12 h-12 bg-airbnb-rausch rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user?.name?.[0] || user?.phone?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user?.name || user?.phone}</p>
                  <p className="text-sm text-gray-500">
                    {isAdmin ? 'Администратор' : isGuide ? 'Гид' : 'Турист'}
                  </p>
                </div>
              </div>

              {/* Menu items */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={(e) => {
                        if (item.disabled) e.preventDefault()
                        else setMobileMenuOpen(false)
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                          ? 'bg-airbnb-rausch/10 text-airbnb-rausch font-medium'
                          : item.disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon size={20} className={active ? "text-airbnb-rausch" : "text-gray-500"} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-airbnb-rausch text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      {item.disabled && <span className="ml-auto text-[10px] uppercase font-bold text-gray-300">Скоро</span>}
                    </Link>
                  )
                })}
              </nav>

              {/* Actions */}
              <div className="space-y-2 pt-6 border-t mt-auto">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <Home size={18} />
                    На главную
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full gap-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - только desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => item.disabled && e.preventDefault()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${active
                      ? 'bg-airbnb-rausch/10 text-airbnb-rausch font-medium'
                      : item.disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon size={20} className={`flex-shrink-0 transition-colors ${active ? 'text-airbnb-rausch' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-airbnb-rausch text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                    </span>
                  )}
                  {item.disabled && <span className="ml-auto text-[10px] uppercase font-bold text-gray-300">Скоро</span>}
                </Link>
              )
            })}
          </div>

          {/* Banner for Guide */}
          {isGuide && (
            <div className="p-4 mt-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
                <p className="font-bold text-sm mb-1">Нужна помощь?</p>
                <p className="text-xs text-indigo-100 mb-3">Напишите в поддержку для гидов</p>
                <Link to="/dashboard/messages">
                  <Button size="sm" variant="secondary" className="w-full text-xs h-8 bg-white/20 hover:bg-white/30 text-white border-0">
                    Написать
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden overflow-y-auto w-full bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
