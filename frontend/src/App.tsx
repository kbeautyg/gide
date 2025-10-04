import { Routes, Route } from 'react-router-dom'

// Публичные страницы
import HomePage from './pages/public/HomePage'
import ToursPage from './pages/public/ToursPage'
import TourDetailPage from './pages/public/TourDetailPage'

// Страницы аутентификации
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Личные кабинеты
import DashboardLayout from './pages/dashboard/DashboardLayout'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard'

function App() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<HomePage />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/tours/:id" element={<TourDetailPage />} />
      
      {/* Аутентификация */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Личные кабинеты (защищенные маршруты) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<ManagerDashboard />} />
        <Route path="manager" element={<ManagerDashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="superadmin" element={<SuperAdminDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
