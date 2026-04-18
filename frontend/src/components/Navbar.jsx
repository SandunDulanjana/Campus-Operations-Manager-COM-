import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function HeaderIcon({ kind }) {
  if (kind === 'bell') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4a4 4 0 0 0-4 4v1.3c0 1.1-.36 2.18-1.02 3.05L5.6 14.1A1 1 0 0 0 6.4 15.7h11.2a1 1 0 0 0 .8-1.6l-1.38-1.75A5.07 5.07 0 0 1 16 9.3V8a4 4 0 0 0-4-4Z" />
        <path d="M10 18a2 2 0 0 0 4 0" />
      </svg>
    )
  }

  if (kind === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M7.5 10.75V19h9v-8.25" />
      </svg>
    )
  }

  if (kind === 'search') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    )
  }

  if (kind === 'chevron') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7 10 5 5 5-5" />
      </svg>
    )
  }

  if (kind === 'stack') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4 4.75 7.5 12 11l7.25-3.5L12 4Z" />
        <path d="M4.75 12.25 12 15.75l7.25-3.5" />
        <path d="M4.75 16.75 12 20.25l7.25-3.5" />
      </svg>
    )
  }

  if (kind === 'brand') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 16.5V8.2c0-.7.36-1.34.96-1.7L12 3.5l5.04 3c.6.36.96 1 .96 1.7v8.3c0 .7-.36 1.34-.96 1.7L12 21l-5.04-2.8A1.97 1.97 0 0 1 6 16.5Z" />
        <path d="M9.2 10.8 12 9l2.8 1.8V14L12 15.8 9.2 14v-3.2Z" />
        <path d="M12 3.5v5.4" />
      </svg>
    )
  }

  return null
}

function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isResourceOpen, setIsResourceOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isAdminRoute = location.pathname.startsWith('/admin')
  const profileAreaRef = useRef(null)
  const resourceAreaRef = useRef(null)

  // ✅ ALL HOOKS FIRST
  useEffect(() => {
    function handlePointerDown(event) {
      if (profileAreaRef.current && !profileAreaRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
      if (resourceAreaRef.current && !resourceAreaRef.current.contains(event.target)) {
        setIsResourceOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setIsResourceOpen(false)
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleLogout() {
    logout()
    setIsMenuOpen(false)
    navigate('/login')
  }

  // Early return - must be AFTER all hooks
  if (!user) return null

  // Safe calculations (after we know user exists)
  const initials = user.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <>
      <header className="site-header">
        <div className="top-header">
          <Link to="/" className="brand" aria-label="Go to home page">
            <span className="brand-mark" aria-hidden="true">
              <HeaderIcon kind="brand" />
            </span>
            <div>
              <p className="brand-title">Smart Campus</p>
              <p className="brand-subtitle">Operations Hub</p>
            </div>
          </Link>

          <div className="top-actions">
            <button type="button" className="notify-btn" aria-label="Notifications">
              <span className="nav-icon-shell" aria-hidden="true">
                <HeaderIcon kind="bell" />
              </span>
            </button>

            <div className="profile-area" ref={profileAreaRef}>
              <button
                type="button"
                className="profile-btn"
                onClick={() => {
                  setIsMenuOpen((state) => !state)
                  setIsResourceOpen(false)
                }}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <span className="avatar">{user.profilePicture
                  ? <img src={user.profilePicture} alt={user.name} className="avatar avatar-photo" />
                  : <span className="avatar">{initials}</span>
                }</span>
                <span className="profile-copy">
                  <span className="profile-eyebrow">{user.role}</span>
                  <span className="profile-name">{user.name}</span>
                </span>
                <span className={`profile-chevron${isMenuOpen ? ' open' : ''}`} aria-hidden="true">
                  <HeaderIcon kind="chevron" />
                </span>
              </button>

              {isMenuOpen && (
                <div className="profile-menu" role="menu">
                  <Link to="/profile" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                    My Profile
                  </Link>

                  {user.role === 'TECHNICIAN' && (
                    <Link
                      to="/technician-dashboard"
                      role="menuitem"
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Technician Dashboard
                    </Link>
                  )}

                      {/* MAINTENANCEMNG → Maintenance Manager Dashboard */}
                  {user.role === 'MAINTENANCEMNG' && (
                    <Link
                      to="/maintenance-dashboard"
                      role="menuitem"
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Maintenance Dashboard
                    </Link>
                  )}

                  {/* RECOURSEMNG → Resource Manager Dashboard */}
                  {user.role === 'RECOURSEMNG' && (
                    <Link
                      to="/resource-dashboard"
                      role="menuitem"
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Resource Dashboard
                    </Link>
                  )}

                  {/* BOOKINGMNG → Booking Manager Dashboard */}
                  {user.role === 'BOOKINGMNG' && (
                    <Link
                      to="/booking-dashboard"
                      role="menuitem"
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Booking Dashboard
                    </Link>
                  )}

                  {user.role === 'ADMIN' && !isAdminRoute && (
                    <Link to="/admin" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}

                  {user.role === 'ADMIN' && (
                    <Link to="/maintain-dashboard" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      Maintain Dashboard
                    </Link>
                  )}

                  {isAdminRoute && (
                    <Link to="/" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      Home
                    </Link>
                  )}

                  <button type="button" role="menuitem" className="menu-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isAdminRoute && (
          <div className="sub-header">
            <nav className="sub-nav" aria-label="Primary navigation">
              <Link to="/" className="home-icon-link" title="Home">
                <span className="nav-icon-shell" aria-hidden="true">
                  <HeaderIcon kind="home" />
                </span>
              </Link>

              <div className="resource-dropdown" ref={resourceAreaRef}>
                <button
                  type="button"
                  className="sub-link-btn"
                  onClick={() => setIsResourceOpen((state) => !state)}
                  aria-haspopup="menu"
                  aria-expanded={isResourceOpen}
                >
                  <span className="nav-icon-shell" aria-hidden="true">
                    <HeaderIcon kind="stack" />
                  </span>
                  <span>Resources</span>
                  <span className={`sub-link-chevron${isResourceOpen ? ' open' : ''}`} aria-hidden="true">
                    <HeaderIcon kind="chevron" />
                  </span>
                </button>
                {isResourceOpen && (
                  <div className="resource-menu" role="menu">
                    <Link to="/bookings" className="menu-item" role="menuitem" onClick={() => setIsResourceOpen(false)}>
                      Bookings
                    </Link>
                  </div>
                )}
              </div>
              {/* ── Module C: Tickets nav link ── */}
              <Link
                to="/tickets/my"
                className="sub-link-btn"
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '1rem', height: '1rem', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 12h6M9 16h4" />
                  </svg>
                </span>
                <span>Tickets</span>
              </Link>
            </nav>

            <button
              type="button"
              className="search-btn"
              onClick={() => setIsSearchOpen((state) => !state)}
              aria-expanded={isSearchOpen}
              aria-label="Toggle search"
            >
              <span className="nav-icon-shell" aria-hidden="true">
                <HeaderIcon kind="search" />
              </span>
            </button>

            {isSearchOpen && (
              <div className="inline-search" role="search">
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="search-close-btn"
                  aria-label="Close search"
                  onClick={() => { setSearchQuery(''); setIsSearchOpen(false) }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  )
}
export default Navbar
