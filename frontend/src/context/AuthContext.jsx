import { createContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const TOKEN_KEY = 'campus-jwt-token'
const USER_KEY = 'campus-user'

// On first load, try to restore user from localStorage
function getStoredAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw = localStorage.getItem(USER_KEY)
    if (!token || !raw) return { user: null, token: null }
    const user = JSON.parse(raw)
    return { user, token }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const stored = getStoredAuth()
  const [user, setUser] = useState(stored.user)       // { id, name, email, role, ... }
  const [token, setToken] = useState(stored.token)    // JWT string

  // Whenever token changes, set it as the default Authorization header for all axios calls
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      axios.defaults.headers.common['Authorization'] = undefined
    }
  }, [token])

  // login() is called by LoginPage after a successful API response
  function login(userData, jwtToken) {
    localStorage.setItem(TOKEN_KEY, jwtToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setToken(jwtToken)
    setUser(userData)
    // Set the token on the axios header immediately
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`
  }

  // logout() clears everything and redirects to login
  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    axios.defaults.headers.common['Authorization'] = undefined
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }