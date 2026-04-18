import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function AuthAwareFallback() {
  const { user, authReady } = useAuth()

  if (!authReady) {
    return null
  }

  return <Navigate to={user ? '/app' : '/'} replace />
}

export default AuthAwareFallback
