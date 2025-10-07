import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'

// Публичные страницы
import HomePage from './pages/public/HomePage'
import ToursPage from './pages/public/ToursPage'
import TourDetailPage from './pages/public/TourDetailPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import CreateRequestPage from './pages/public/CreateRequestPage'
import FAQPage from './pages/public/FAQPage'
import TermsPage from './pages/public/TermsPage'
import PrivacyPage from './pages/public/PrivacyPage'
import BecomeGuidePage from './pages/public/BecomeGuidePage'

// Страницы аутентификации
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Личные кабинеты
import DashboardLayout from './pages/dashboard/DashboardLayout'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import MyToursPage from './pages/dashboard/MyToursPage'
import CalendarPage from './pages/dashboard/CalendarPage'
import BookingsPage from './pages/dashboard/BookingsPage'
import FinancesPage from './pages/dashboard/FinancesPage'
import SettingsPage from './pages/dashboard/SettingsPage'

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
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/become-guide" element={<BecomeGuidePage />} />
      
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
        <Route path="my-tours" element={<MyToursPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="finances" element={<FinancesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
