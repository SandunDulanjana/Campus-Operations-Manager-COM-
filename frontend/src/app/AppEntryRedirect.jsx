import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const roleDestinations = {
  USER: '/app/home',
  ADMIN: '/app/admin',
  TECHNICIAN: '/app/technician',
  MAINTENANCEMNG: '/app/maintenance',
  RECOURSEMNG: '/app/resources',
  BOOKINGMNG: '/app/booking-manager',
}

function AppEntryRedirect() {
  const { user } = useAuth()
  const destination = roleDestinations[user?.role] ?? '/app/profile'
  return <Navigate to={destination} replace />
}

export default AppEntryRedirect
