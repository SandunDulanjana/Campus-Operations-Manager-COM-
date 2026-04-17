import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function RequireAuth({ children }) {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAuth;
