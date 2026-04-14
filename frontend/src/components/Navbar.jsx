import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

  return null
}

function Navbar() {
  const { user, setRole } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isResourceOpen, setIsResourceOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const profileAreaRef = useRef(null)
  const resourceAreaRef = useRef(null)

  const initials = useMemo(() => {
    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [user.name])

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

  return (
    <>
      <header className="site-header">
        <div className="top-header">
          <Link to="/" className="brand" aria-label="Go to home page">
            <span className="brand-mark" aria-hidden="true">
              SC
            </span>
            <div>
              <p className="brand-title">Smart Campus</p>
              <p className="brand-subtitle">CourseWeb</p>
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
                <span className="avatar">{initials}</span>
                <span className="profile-copy">
                  <span className="profile-eyebrow">{user.role}</span>
                  <span className="profile-name">{user.name}</span>
                </span>
                <span className={`profile-chevron${isMenuOpen ? ' open' : ''}`} aria-hidden="true">
                  <HeaderIcon kind="chevron" />
                </span>
              </button>

              {isMenuOpen ? (
                <div className="profile-menu" role="menu">
                  {user.role === 'ADMIN' && !isAdminRoute ? (
                    <Link to="/admin" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  ) : null}
                  {isAdminRoute ? (
                    <Link to="/" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      Home
                    </Link>
                  ) : null}
                  {!isAdminRoute ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="menu-item"
                      onClick={() => {
                        setRole(user.role === 'ADMIN' ? 'USER' : 'ADMIN')
                        setIsMenuOpen(false)
                      }}
                    >
                      Switch to {user.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                    </button>
                  ) : null}
                  <button type="button" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </button>
                  {!isAdminRoute ? (
                    <button type="button" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      Logout
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {!isAdminRoute ? (
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
                onClick={() => {
                  setIsResourceOpen((state) => !state)
                  setIsMenuOpen(false)
                }}
                aria-haspopup="menu"
                aria-expanded={isResourceOpen}
              >
                <span>Resources</span>
                <span className={`sub-link-chevron${isResourceOpen ? ' open' : ''}`} aria-hidden="true">
                  <HeaderIcon kind="chevron" />
                </span>
              </button>

              {isResourceOpen ? (
                <div className="resource-menu" role="menu">
                  <Link to="/bookings" className="menu-item" role="menuitem" onClick={() => setIsResourceOpen(false)}>
                    Bookings
                  </Link>
                </div>
              ) : null}
            </div>
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

          {isSearchOpen ? (
            <div className="inline-search" role="search">
              <input
                type="search"
                className="search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button
                type="button"
                className="search-close-btn"
                aria-label="Close search"
                onClick={() => {
                  setSearchQuery('')
                  setIsSearchOpen(false)
                }}
              >
                ×
              </button>
            </div>
          ) : null}
          </div>
        ) : null}
      </header>
    </>
  )
}

export default Navbar
