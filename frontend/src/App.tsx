import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'

// Публичные страницы
import HomePage from './pages/public/HomePage'
import ToursPage from './pages/public/ToursPage'
import TourDetailPage from './pages/public/TourDetailPage'
import TourSharePage from './pages/public/TourSharePage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import CreateRequestPage from './pages/public/CreateRequestPage'
import FAQPage from './pages/public/FAQPage'
import TermsPage from './pages/public/TermsPage'
import PrivacyPage from './pages/public/PrivacyPage'
import BecomeGuidePage from './pages/public/BecomeGuidePage'
import DestinationPage from './pages/public/DestinationPage'
import JournalPage from './pages/public/JournalPage'
import ArticlePage from './pages/public/ArticlePage'

// Страницы аутентификации
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Личные кабинеты
import DashboardLayout from './pages/dashboard/DashboardLayout'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import MyToursPage from './pages/dashboard/MyToursPage'
import CalendarPage from './pages/dashboard/CalendarPage'
import BookingsPage from './pages/dashboard/BookingsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import RequestsPage from './pages/dashboard/RequestsPage'

function App() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<HomePage />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/tours/:id" element={<TourDetailPage />} />
      <Route path="/t/:code" element={<TourSharePage />} />
      <Route path="/destinations/:city" element={<DestinationPage />} />
      <Route path="/journal" element={<JournalPage />} />
      <Route path="/journal/:slug" element={<ArticlePage />} />
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
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="my-tours" element={<MyToursPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
