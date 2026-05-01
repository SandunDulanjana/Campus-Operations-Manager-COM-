const TOKEN_KEY = 'campus-jwt-token'
const USER_KEY = 'campus-user'
const SESSION_EXPIRY_KEY = 'campus-session-expiry'
const SESSION_DURATION_MS = 5 * 60 * 60 * 1000

function encodeCookieValue(value) {
  return encodeURIComponent(value)
}

function decodeCookieValue(value) {
  return decodeURIComponent(value)
}

export function setCookie(name, value, expiresAt) {
  const expires = new Date(expiresAt).toUTCString()
  document.cookie = `${name}=${encodeCookieValue(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export function getCookie(name) {
  const prefix = `${name}=`
  const match = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(prefix))

  if (!match) return null
  return decodeCookieValue(match.slice(prefix.length))
}

export function clearCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
}

export function buildSessionExpiry() {
  return Date.now() + SESSION_DURATION_MS
}

export function isSessionExpired(expiresAt) {
  if (!expiresAt) return true
  return Number(expiresAt) <= Date.now()
}

export function readStoredAuth() {
  try {
    const token = getCookie(TOKEN_KEY)
    const rawUser = getCookie(USER_KEY)
    const expiresAt = getCookie(SESSION_EXPIRY_KEY)

    if (!token || !rawUser || isSessionExpired(expiresAt)) {
      clearStoredAuth()
      return { user: null, token: null, expiresAt: null }
    }

    return {
      user: JSON.parse(rawUser),
      token,
      expiresAt: Number(expiresAt),
    }
  } catch {
    clearStoredAuth()
    return { user: null, token: null, expiresAt: null }
  }
}

export function persistAuth(user, token) {
  const expiresAt = buildSessionExpiry()
  setCookie(TOKEN_KEY, token, expiresAt)
  setCookie(USER_KEY, JSON.stringify(user), expiresAt)
  setCookie(SESSION_EXPIRY_KEY, String(expiresAt), expiresAt)
  return expiresAt
}

export function persistUser(user, expiresAt) {
  if (!expiresAt || isSessionExpired(expiresAt)) {
    clearStoredAuth()
    return null
  }

  setCookie(USER_KEY, JSON.stringify(user), Number(expiresAt))
  return Number(expiresAt)
}

export function clearStoredAuth() {
  clearCookie(TOKEN_KEY)
  clearCookie(USER_KEY)
  clearCookie(SESSION_EXPIRY_KEY)
}

export function getRoleHome(user) {
  if (!user) return '/'
  if (user.role === 'ADMIN') return '/admin/dashboard'
  if (user.role === 'TECHNICIAN') return '/technician/dashboard'
  if (user.role === 'MAINTENANCEMNG') return '/maintenance-dashboard'
  if (user.role === 'RECOURSEMNG') return '/resource-dashboard'
  if (user.role === 'BOOKINGMNG') return '/booking-dashboard'
  return '/'
}

export function getAuthDestination({ user, searchParams, locationState }) {
  const returnTo = searchParams?.get('returnTo')
  if (returnTo) return decodeURIComponent(returnTo)

  const fromPath = locationState?.from?.pathname
  if (fromPath && fromPath !== '/login') return fromPath

  return getRoleHome(user)
}

export function isPublicPath(pathname) {
  return [
    '/',
    '/login',
    '/oauth2',
    '/oauth/callback',
    '/forgot-password',
    '/reset-password',
    '/setup-account',
    '/enter-university-id',
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export { SESSION_DURATION_MS, SESSION_EXPIRY_KEY, TOKEN_KEY, USER_KEY }
