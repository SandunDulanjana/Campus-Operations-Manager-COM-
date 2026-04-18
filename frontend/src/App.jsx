import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
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
import PublicLayout from './layouts/PublicLayout'
import PrivateLayoutRouter from './layouts/PrivateLayoutRouter'
import AuthAwareFallback from './components/routing/AuthAwareFallback'
import AppEntryRedirect from './app/AppEntryRedirect'
import UserDashboardHome from './app/UserDashboardHome'
import UserIssueReportPage from './app/UserIssueReportPage'
import UserTicketsPage from './app/UserTicketsPage'

function TechnicianDashboard() {
  return <div className="user-placeholder-page"><h1>Technician Dashboard</h1><p>Technician tools will appear here.</p></div>
}

function MaintenanceDashboard() {
  return <div className="user-placeholder-page"><h1>Maintenance Manager Dashboard</h1><p>Maintenance workflow tools will appear here.</p></div>
}

function ResourceDashboard() {
  return <div className="user-placeholder-page"><h1>Resource Manager Dashboard</h1><p>Resource operations tools will appear here.</p></div>
}

function BookingManagerDashboard() {
  return <div className="user-placeholder-page"><h1>Booking Manager Dashboard</h1><p>Booking operations tools will appear here.</p></div>
}

function PublicOnlyRoute({ children }) {
  const { user, authReady } = useAuth()

  if (!authReady) {
    return null
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return children
}

function UserOnlyOutlet() {
  return (
    <RequireRole allowedRoles={['USER']}>
      <Outlet />
    </RequireRole>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicOnlyRoute><HomePage /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
      </Route>

      <Route
        path="/app"
        element={
          <RequireAuth>
            <PrivateLayoutRouter />
          </RequireAuth>
        }
      >
        <Route index element={<AppEntryRedirect />} />
        <Route path="profile" element={<ProfilePage />} />

        <Route element={<UserOnlyOutlet />}>
          <Route path="home" element={<UserDashboardHome />} />
          <Route path="bookings" element={<BookingPage />} />
          <Route path="report-issue" element={<UserIssueReportPage />} />
          <Route path="my-tickets" element={<UserTicketsPage />} />
        </Route>

        <Route
          path="technician"
          element={<RequireRole allowedRoles={['TECHNICIAN']}><TechnicianDashboard /></RequireRole>}
        />
        <Route
          path="maintenance"
          element={<RequireRole allowedRoles={['MAINTENANCEMNG']}><MaintenanceDashboard /></RequireRole>}
        />
        <Route
          path="resources"
          element={<RequireRole allowedRoles={['RECOURSEMNG']}><ResourceDashboard /></RequireRole>}
        />
        <Route
          path="booking-manager"
          element={<RequireRole allowedRoles={['BOOKINGMNG']}><BookingManagerDashboard /></RequireRole>}
        />
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboardHome />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="resources" element={<AdminResourcesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<AuthAwareFallback />} />
    </Routes>
  )
}

export default App
