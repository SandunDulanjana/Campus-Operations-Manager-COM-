import { createContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { clearStoredAuth, persistAuth, persistUser, readStoredAuth, isSessionExpired } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredAuth().user)
  const [token, setToken] = useState(() => {
    const { token: t } = readStoredAuth()
    if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    return t
  })
  const [sessionExpiresAt, setSessionExpiresAt] = useState(() => readStoredAuth().expiresAt)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (sessionExpiresAt && isSessionExpired(sessionExpiresAt)) {
        logout(true)
      }
    }, 60000)

    return () => window.clearInterval(interval)
  }, [sessionExpiresAt])

  function login(userData, jwtToken) {
    const expiresAt = persistAuth(userData, jwtToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`
    setToken(jwtToken)
    setUser(userData)
    setSessionExpiresAt(expiresAt)
  }

  function logout(shouldRedirect = false) {
    clearStoredAuth()
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    setSessionExpiresAt(null)

    if (shouldRedirect && !window.location.pathname.startsWith('/login')) {
      const returnTo = window.location.pathname + window.location.search
      window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`
    }
  }

  function updateUser(updatedUserData) {
    const expiresAt = persistUser(updatedUserData, sessionExpiresAt)
    setUser(updatedUserData)
    setSessionExpiresAt(expiresAt)
  }

  const value = useMemo(
    () => ({ user, token, login, logout, updateUser }),
    [user, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
