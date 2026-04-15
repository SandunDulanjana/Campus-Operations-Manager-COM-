import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function RequireAuth({ children }) {
  const { user } = useAuth()

  if (!user) {
    // Not logged in — redirect to login page
    return <Navigate to="/login" replace />
  }

  return children
}

export default RequireAuth