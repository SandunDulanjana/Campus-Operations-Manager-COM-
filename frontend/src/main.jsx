import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'           // ← ADD
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

const TOKEN_KEY = 'campus-jwt-token'

// ── Restore JWT on page refresh ───────────────────────────────────────────────
// WHY: axios.defaults are cleared on refresh. This re-sets the header
//      from localStorage so all API calls (including adminApi) are authenticated.
const storedToken = localStorage.getItem(TOKEN_KEY)
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
}

// ── Interceptor: keep header in sync for every future request ─────────────────
axios.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
