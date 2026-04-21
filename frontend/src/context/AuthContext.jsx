import { createContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const TOKEN_KEY = 'campus-jwt-token'
const USER_KEY  = 'campus-user'

// ── Restore session from localStorage (runs once at startup) ──────────────────
function getStoredAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw   = localStorage.getItem(USER_KEY)
    if (!token || !raw) return { user: null, token: null }
    return { user: JSON.parse(raw), token }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {

  // ── State: initialised ONCE from localStorage via lazy initialiser ──────────
  // The () => {...} form means React calls this only on the first render,
  // not on every re-render.
  const [user, setUser]   = useState(() => getStoredAuth().user)
  const [token, setToken] = useState(() => {
    const { token: t } = getStoredAuth()
    // Set axios header SYNCHRONOUSLY here so the very first API call
    // (which may fire before the useEffect below) already has the token.
    if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    return t
  })

  // ── Keep axios header in sync whenever token changes ─────────────────────────
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // ── login: called by LoginPage after successful API response ─────────────────
  function login(userData, jwtToken) {
    localStorage.setItem(TOKEN_KEY, jwtToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`
    setToken(jwtToken)
    setUser(userData)
  }

  // ── logout: clears everything ─────────────────────────────────────────────────
  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  // ── updateUser: used by ProfilePage after saving profile changes ──────────────
  function updateUser(updatedUserData) {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUserData))
    setUser(updatedUserData)
  }

  // ── Context value (memoised so consumers only re-render when user/token changes)
  const value = useMemo(
    () => ({ user, token, login, logout, updateUser }),
    [user, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }