import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/layout/Footer'
import BookingPage from './booking/BookingPage'
import AdminBookingsPage from './booking/AdminBookingsPage'
import HomePage from './home/HomePage'
import AdminLayout from './admin/AdminLayout'
import RequireAdmin from './admin/RequireAdmin'
import AdminUsersPage from './admin/AdminUsersPage'
import AdminResourcesPage from './admin/AdminResourcesPage'
import AdminDashboardHome from './admin/AdminDashboardHome'
import './App.css'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className={isAdminRoute ? 'app-shell admin-mode' : 'app-shell'}>
      <Navbar />
      <main className={isAdminRoute ? 'page-content admin-page-content' : 'page-content'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardHome />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="resources" element={<AdminResourcesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
