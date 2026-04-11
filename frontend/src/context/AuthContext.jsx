import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const DEFAULT_USER = {
  id: 2,
  name: 'Sithu User',
  role: 'USER',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER)

  const value = useMemo(
    () => ({
      user,
      setRole: (role) => setUser((current) => ({ ...current, role })),
      setUserId: (id) =>
        setUser((current) => ({
          ...current,
          id,
        })),
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
