import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'campus-test-user'
const BYPASS_LOGIN_FOR_TESTING = true

const DEFAULT_USER = {
  id: 1,
  name: 'Admin Tester',
  role: 'ADMIN',
}

function getInitialUser() {
  if (BYPASS_LOGIN_FOR_TESTING) {
    return DEFAULT_USER
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return DEFAULT_USER
    }
    const parsed = JSON.parse(raw)
    if (!parsed?.id || !parsed?.name || !parsed?.role) {
      return DEFAULT_USER
    }
    return parsed
  } catch {
    return DEFAULT_USER
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)

  const value = useMemo(
    () => ({
      user,
      setRole: (role) =>
        setUser((current) => {
          const nextUser = { ...current, role }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
          return nextUser
        }),
      setUserId: (id) =>
        setUser((current) => {
          const nextUser = { ...current, id }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
          return nextUser
        }),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
