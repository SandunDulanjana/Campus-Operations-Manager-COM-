import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { clearStoredAuth, getCookie, isPublicPath, TOKEN_KEY } from './lib/auth'

const storedToken = getCookie(TOKEN_KEY)
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
}

axios.interceptors.request.use((config) => {
  const token = getCookie(TOKEN_KEY)

  if (token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuth()
      delete axios.defaults.headers.common['Authorization']

      if (!isPublicPath(window.location.pathname)) {
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
