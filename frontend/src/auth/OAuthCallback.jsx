import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/useAuth';

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Set token immediately
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    axios
      .get('http://localhost:8081/api/auth/me')
      .then((response) => {
        const userData = response.data;

        // Call login (this saves to localStorage + updates context)
        login(userData, token);

        // Redirect to home AFTER login state is updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 200);
      })
      .catch((err) => {
        console.error('Failed to fetch /api/auth/me after Google login:', err);
        navigate('/login', { replace: true });
      });
  }, [searchParams, login, navigate]);

  return (
    <div className="login-page">
      <div className="login-card">
        <p>Signing you in with Google...</p>
        <p>Please wait a moment...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;