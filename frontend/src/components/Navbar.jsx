import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, setRole } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isResourceOpen, setIsResourceOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const initials = useMemo(() => {
    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [user.name])

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

          <div className="top-actions" onMouseLeave={() => setIsMenuOpen(false)}>
            <button type="button" className="notify-btn" aria-label="Notifications">
              <span aria-hidden="true">🔔</span>
            </button>

            <button
              type="button"
              className="profile-btn"
              onClick={() => setIsMenuOpen((state) => !state)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <span className="profile-name">{user.name.toUpperCase()}</span>
              <span aria-hidden="true">▾</span>
              <span className="avatar">{initials}</span>
            </button>

            {isMenuOpen ? (
              <div className="profile-menu" role="menu">
                {user.role === 'ADMIN' ? (
                  <Link to="/admin" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                ) : null}
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
                <button type="button" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </button>
                <button type="button" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="sub-header">
          <nav className="sub-nav" aria-label="Primary navigation">
            <Link to="/" className="home-icon-link" title="Home">
              <span className="nav-icon" aria-hidden="true">
                ⌂
              </span>
            </Link>

            <div className="resource-dropdown" onMouseLeave={() => setIsResourceOpen(false)}>
              <button
                type="button"
                className="sub-link-btn"
                onClick={() => setIsResourceOpen((state) => !state)}
                aria-haspopup="menu"
                aria-expanded={isResourceOpen}
              >
                Resources <span aria-hidden="true">▾</span>
              </button>

              {isResourceOpen ? (
                <div className="resource-menu" role="menu">
                  <Link to="/bookings" className="menu-item" role="menuitem" onClick={() => setIsResourceOpen(false)}>
                    Booking
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
            <span className="nav-icon" aria-hidden="true">
              ⌕
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
      </header>
    </>
  )
}

export default Navbar
