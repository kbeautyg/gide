import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'

// Публичные страницы
import HomePage from './pages/public/HomePage'
import ToursPage from './pages/public/ToursPage'
import TourDetailPage from './pages/public/TourDetailPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import CreateRequestPage from './pages/public/CreateRequestPage'

// Страницы аутентификации
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Личные кабинеты
import DashboardLayout from './pages/dashboard/DashboardLayout'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage'
import SuperManagerDashboardPage from './pages/dashboard/SuperManagerDashboardPage'
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard'
import MyToursPage from './pages/dashboard/MyToursPage'
import BookingsPage from './pages/dashboard/BookingsPage'
import UsersPage from './pages/dashboard/UsersPage'
import UserProfilePage from './pages/dashboard/UserProfilePage'
import AllToursPage from './pages/dashboard/AllToursPage'
import FinancesPage from './pages/dashboard/FinancesPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import RequestsPage from './pages/dashboard/RequestsPage'

function App() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<HomePage />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/tours/:id" element={<TourDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/request" element={<CreateRequestPage />} />
      
      {/* Аутентификация */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Личные кабинеты (защищенные маршруты) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="manager" element={<ManagerDashboard />} />
        <Route path="my-tours" element={<MyToursPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="profile/:userId" element={<UserProfilePage />} />
        <Route path="all-tours" element={<AllToursPage />} />
        <Route path="finances" element={<FinancesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="supermanager"
          element={
            <ProtectedRoute allowedRoles={['super_manager', 'admin', 'super_admin']}>
              <SuperManagerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="superadmin"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
