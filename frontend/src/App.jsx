import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/layout/Footer'
import BookingPage from './booking/BookingPage'
import AdminBookingsPage from './booking/AdminBookingsPage'
import HomePage from './home/HomePage'
import AdminLayout from './admin/AdminLayout'
import RequireAdmin from './admin/RequireAdmin'
import RequireAuth from './auth/RequireAuth'
import RequireRole from './auth/RequireRole'
import AdminUsersPage from './admin/AdminUsersPage'
import AdminResourcesPage from './admin/AdminResourcesPage'
import AdminDashboardHome from './admin/AdminDashboardHome'
import LoginPage from './auth/LoginPage'
import OAuthCallback from './auth/OAuthCallback'
import { useAuth } from './context/useAuth'
import './App.css'
import ProfilePage from './profile/ProfilePage'
import ForgotPasswordPage from './auth/ForgotPasswordPage'
import ResetPasswordPage from './auth/ResetPasswordPage'
import CreateTicketPage from './ticket/CreateTicketPage'
import MyTicketsPage from './ticket/MyTicketsPage'
import TicketDetailPage from './ticket/TicketDetailPage'
import TechnicianLayout from './technician/TechnicianLayout'
import TechnicianDashboardHome from './technician/TechnicianDashboardHome'
import TechnicianNotificationsPage from './technician/TechnicianNotificationsPage'
import TechnicianTicketAnalysis from './technician/TechnicianTicketAnalysis'
import EnterUniversityIdPage from './auth/EnterUniversityIdPage'
import SetupAccountPage from './auth/SetupAccountPage'
import AdminTicketsPage from './admin/AdminTicketsPage'
import AdminNotificationsPage from './admin/AdminNotificationsPage'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getRoleHome } from '@/lib/auth'

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
  const isTechnicianRoute = location.pathname.startsWith('/technician')
  const isAppShellRoute = isAdminRoute || isTechnicianRoute
  const isHomePage = location.pathname === '/'
  const isLoginRoute = location.pathname === '/login'
  || location.pathname === '/oauth/callback'
  || location.pathname.startsWith('/oauth2')
  || location.pathname === '/forgot-password'
  || location.pathname === '/reset-password'
  || location.pathname === '/setup-account'
  || location.pathname === '/enter-university-id'

  return (
    <TooltipProvider>
      <div className={isAppShellRoute ? 'app-shell admin-mode' : 'app-shell'}>
        {!isLoginRoute && !isAppShellRoute && <Navbar isHomePage={isHomePage} />}

      <main className={isAppShellRoute ? 'page-content admin-page-content' : (isHomePage ? 'page-content-home' : 'page-content')}>
      <Routes>
            <Route path="/setup-account" element={<SetupAccountPage />} />
            <Route path="/login" element={user ? <Navigate to={getRoleHome(user)} replace /> : <LoginPage />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/enter-university-id" element={<EnterUniversityIdPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/bookings" element={<RequireAuth><BookingPage /></RequireAuth>} />

            <Route
              path="/maintenance-dashboard"
              element={<RequireAuth><RequireRole allowedRoles={['MAINTENANCEMNG']}><MaintenanceDashboard /></RequireRole></RequireAuth>}
            />
            <Route
              path="/resource-dashboard"
              element={<RequireAuth><RequireRole allowedRoles={['RECOURSEMNG']}><ResourceDashboard /></RequireRole></RequireAuth>}
            />
            <Route
              path="/booking-dashboard"
              element={<RequireAuth><RequireRole allowedRoles={['BOOKINGMNG']}><BookingManagerDashboard /></RequireRole></RequireAuth>}
            />

            <Route
              path="/technician"
              element={
                <RequireAuth>
                  <RequireRole allowedRoles={['TECHNICIAN']}>
                    <TechnicianLayout />
                  </RequireRole>
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TechnicianDashboardHome />} />
              <Route path="notifications" element={<TechnicianNotificationsPage />} />
              <Route path="ticket-analysis" element={<TechnicianTicketAnalysis />} />
            </Route>

            <Route path="/technician-dashboard" element={<Navigate to="/technician/dashboard" replace />} />
            <Route path="/tickets" element={<RequireAuth><MyTicketsPage /></RequireAuth>} />
            <Route path="/tickets/my" element={<RequireAuth><MyTicketsPage /></RequireAuth>} />
            <Route path="/tickets/new" element={<RequireAuth><CreateTicketPage /></RequireAuth>} />
            <Route path="/tickets/:id" element={<RequireAuth><TicketDetailPage /></RequireAuth>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

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
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {!isLoginRoute && !isAppShellRoute && <Footer />}
      </div>
    </TooltipProvider>
  )
}

export default App
