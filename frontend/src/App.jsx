import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/layout/Footer'
import BookingPage from './booking/BookingPage'
import AdminBookingsPage from './booking/AdminBookingsPage'
import HomePage from './home/HomePage'
import AdminLayout from './admin/AdminLayout'
import RequireAdmin from './admin/RequireAdmin'
import RequireAuth from './auth/RequireAuth'
import AdminUsersPage from './admin/AdminUsersPage'
import AdminResourcesPage from './admin/AdminResourcesPage'
import AdminDashboardHome from './admin/AdminDashboardHome'
import LoginPage from './auth/LoginPage'
import OAuthCallback from './auth/OAuthCallback'
import { useAuth } from './context/useAuth';   // or './context/useAuth.js'
import './App.css'
// At the top, add import:
import ProfilePage from './profile/ProfilePage'
import ForgotPasswordPage from './auth/ForgotPasswordPage'
import ResetPasswordPage from './auth/ResetPasswordPage'
// Inside <Routes>, add after the /bookings route:
import CreateTicketPage from './ticket/CreateTicketPage'
import MyTicketsPage    from './ticket/MyTicketsPage'
import TicketDetailPage from './ticket/TicketDetailPage'
import TechnicianDashboard from './ticket/TechnicianDashboard'



// Role dashboard placeholder pages (create these files later)

function MaintenanceDashboard() {
  return <div className="page-content"><h1>Maintenance Manager Dashboard</h1></div>
}
function ResourceDashboard() {
  return <div className="page-content"><h1>Resource Manager Dashboard</h1></div>
}
function BookingManagerDashboard() {
  return <div className="page-content"><h1>Booking Manager Dashboard</h1></div>
}


function App() {
  const location = useLocation()
  const { user } = useAuth()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isLoginRoute = location.pathname === '/login'
  || location.pathname.startsWith('/oauth2')
  || location.pathname === '/forgot-password'
  || location.pathname === '/reset-password'


  return (
    <div className={isAdminRoute ? 'app-shell admin-mode' : 'app-shell'}>
      {/* Hide Navbar on login/callback pages */}
      {!isLoginRoute && <Navbar />}

      <main className={isAdminRoute ? 'page-content admin-page-content' : 'page-content'}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* Protected routes — require login */}
          <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/bookings" element={<RequireAuth><BookingPage /></RequireAuth>} />
          {/* Role-specific dashboards */}
          <Route path="/technician-dashboard"  element={<RequireAuth><TechnicianDashboard /></RequireAuth>} />
          <Route path="/maintenance-dashboard" element={<RequireAuth><MaintenanceDashboard /></RequireAuth>} />
          <Route path="/resource-dashboard"    element={<RequireAuth><ResourceDashboard /></RequireAuth>} />
          <Route path="/booking-dashboard"     element={<RequireAuth><BookingManagerDashboard /></RequireAuth>} />
          <Route path="/technician-dashboard" element={<RequireAuth><TechnicianDashboard /></RequireAuth>} />
         
          <Route path="/tickets"     element={<RequireAuth><MyTicketsPage /></RequireAuth>} />
          <Route path="/tickets/my"  element={<RequireAuth><MyTicketsPage /></RequireAuth>} />
          <Route path="/tickets/new" element={<RequireAuth><CreateTicketPage /></RequireAuth>} />
          <Route path="/tickets/:id" element={<RequireAuth><TicketDetailPage /></RequireAuth>} />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />

          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              </RequireAuth>
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

      {!isLoginRoute && <Footer />}
    </div>
  )
}

export default App