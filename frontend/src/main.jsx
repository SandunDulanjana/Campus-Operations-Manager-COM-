import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'           // ← ADD
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

// ── Restore JWT on page refresh ───────────────────────────────────────────────
// WHY: axios.defaults are cleared on refresh. This re-sets the header
//      from localStorage so all API calls (including adminApi) are authenticated.
const storedToken = localStorage.getItem('token')
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
}

// ── Intercept 401 responses → clear session and redirect to login ─────────────
axios.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('campus-jwt-token')
      localStorage.removeItem('campus-user')
      delete axios.defaults.headers.common['Authorization']

      const publicPaths = ['/login', '/oauth2', '/forgot-password', '/reset-password', '/setup-account', '/enter-university-id']
      const isPublic = publicPaths.some(p => window.location.pathname.startsWith(p))
      if (!isPublic) {
        const returnTo = window.location.pathname + window.location.search
        window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`
      }
    }
    return Promise.reject(error)
  }
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)