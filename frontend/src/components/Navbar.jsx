import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!user) return null

  const initials = user.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  function handleLogout() {
    logout()
    setIsMenuOpen(false)
    navigate('/login')
  }

  return (
    <header className="site-header user-site-header">
      <div className="top-header">
        <Link to="/app/home" className="brand" aria-label="Go to app home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M6 16.5V8.2c0-.7.36-1.34.96-1.7L12 3.5l5.04 3c.6.36.96 1 .96 1.7v8.3c0 .7-.36 1.34-.96 1.7L12 21l-5.04-2.8A1.97 1.97 0 0 1 6 16.5Z" />
              <path d="M9.2 10.8 12 9l2.8 1.8V14L12 15.8 9.2 14v-3.2Z" />
            </svg>
          </span>
          <div>
            <p className="brand-title">Smart Campus</p>
            <p className="brand-subtitle">Student Workspace</p>
          </div>
        </Link>

        <nav className="user-top-nav" aria-label="User workspace navigation">
          <Link to="/app/home">Home</Link>
          <Link to="/app/bookings">Book Facility</Link>
          <Link to="/app/report-issue">Report an Issue</Link>
          <Link to="/app/my-tickets">My Tickets</Link>
        </nav>

        <div className="profile-area">
          <button
            type="button"
            className="profile-btn"
            onClick={() => setIsMenuOpen((state) => !state)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <span className="avatar">
              {user.profilePicture
                ? <img src={user.profilePicture} alt={user.name} className="avatar avatar-photo" />
                : <span className="avatar">{initials}</span>}
            </span>
            <span className="profile-copy">
              <span className="profile-eyebrow">{user.role}</span>
              <span className="profile-name">{user.name}</span>
            </span>
          </button>

          {isMenuOpen && (
            <div className="profile-menu" role="menu">
              <Link to="/app/profile" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                My Profile
              </Link>
              <button type="button" role="menuitem" className="menu-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
