import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

const TOKEN_KEY = 'campus-jwt-token'

const storedToken = localStorage.getItem(TOKEN_KEY)
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
}

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('campus-user')
      delete axios.defaults.headers.common['Authorization']

      const publicPaths = ['/login', '/oauth2', '/forgot-password', '/reset-password', '/setup-account', '/enter-university-id']
      const isPublic = publicPaths.some((path) => window.location.pathname.startsWith(path))
      if (!isPublic) {
        const returnTo = window.location.pathname + window.location.search
        window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`
      }
    }
    return Promise.reject(error)
  },
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
