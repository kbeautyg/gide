import { useAuthStore } from '@/lib/store'
import ClientDashboard from './ClientDashboard'
import ManagerDashboard from './ManagerDashboard'
import AdminDashboard from './AdminDashboard'
import { Navigate } from 'react-router-dom'

export default function DashboardIndex() {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    return <AdminDashboard />
  }

  if (user.role === 'manager' || user.role === 'guide') {
    return <ManagerDashboard />
  }

  // Для обычного пользователя (туриста)
  return <ClientDashboard />
}


