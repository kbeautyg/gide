import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { NavigationProvider } from './contexts/NavigationContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RequestFloatingButton } from './components/RequestFloatingButton'
import { ScrollToTop } from './components/ScrollToTop'
import { ScrollProgress } from './components/ScrollProgress'
import { SecretDiscount } from './components/SecretDiscount'
import { useKonamiCode } from './hooks/useKonamiCode'
import { NanoBot } from './components/NanoBot/NanoBot'

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
import OfferPage from './pages/public/OfferPage'
import BecomeGuidePage from './pages/public/BecomeGuidePage'
import JournalPage from './pages/public/JournalPage'
import ArticlePage from './pages/public/ArticlePage'

// Страницы аутентификации
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Служебные страницы
import NotFoundPage from './pages/NotFoundPage'

// Личные кабинеты
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardIndex from './pages/dashboard/DashboardIndex'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import GuideApplicationsPage from './pages/dashboard/admin/GuideApplicationsPage'
import CategoriesManagement from './pages/admin/CategoriesManagement'
import MyToursPage from './pages/dashboard/MyToursPage'
import EditTourPage from './pages/dashboard/EditTourPage'
import CalendarPage from './pages/dashboard/CalendarPage'
import BookingsPage from './pages/dashboard/BookingsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import CreateTourFromRequest from './pages/dashboard/CreateTourFromRequest'
import RequestsPage from './pages/dashboard/RequestsPage'
import FavoritesPage from './pages/dashboard/FavoritesPage'
import MessagesPage from './pages/dashboard/MessagesPage' // Import

function App() {
  const [showSecretDiscount, setShowSecretDiscount] = useState(false)

  useKonamiCode(() => {
    setShowSecretDiscount(true)
  })

  return (
    <>
      <ScrollProgress />
      <RequestFloatingButton />
      <ScrollToTop />
      <NanoBot />
      <SecretDiscount
        isOpen={showSecretDiscount}
        onClose={() => setShowSecretDiscount(false)}
      />
      <NavigationProvider>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/t/:code" element={<TourSharePage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<ArticlePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/request" element={<CreateRequestPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/offer" element={<OfferPage />} />
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
            <Route index element={<DashboardIndex />} />
            <Route path="manager" element={<ManagerDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/applications" element={<GuideApplicationsPage />} />
            <Route path="admin/categories" element={<CategoriesManagement />} />
            <Route path="my-tours" element={<MyToursPage />} />
            <Route path="tours/edit/:id" element={<EditTourPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="tours/create-from-request/:requestId" element={<CreateTourFromRequest />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="messages" element={<MessagesPage />} /> {/* Add route */}
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 - должен быть последним */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </NavigationProvider>
    </>
  )
}

export default App
