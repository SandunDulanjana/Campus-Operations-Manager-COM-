import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/layout/Footer'
import BookingPage from './booking/BookingPage'
import AdminBookingsPage from './booking/AdminBookingsPage'
import HomePage from './home/HomePage'
import AdminLayout from './admin/AdminLayout'
import RequireAdmin from './admin/RequireAdmin'
import AdminUsersPage from './admin/AdminUsersPage'
import AdminResourcesPage from './admin/AdminResourcesPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
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
            <Route index element={<Navigate to="bookings" replace />} />
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
