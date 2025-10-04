import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600 mb-4">Личный кабинет (в разработке)</p>
        <Outlet />
      </div>
    </div>
  )
}
