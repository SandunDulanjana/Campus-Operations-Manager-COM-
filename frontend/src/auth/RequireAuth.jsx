import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Remember where the user was so we can return them after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth