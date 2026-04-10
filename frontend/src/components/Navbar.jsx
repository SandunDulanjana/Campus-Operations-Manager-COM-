import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const initials = useMemo(() => {
    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [user.name])

  return (
    <header className="main-navbar">
      <Link to="/" className="brand" aria-label="Go to home page">
        <span className="brand-mark" aria-hidden="true">
          SC
        </span>
        <div>
          <p className="brand-title">Smart Campus</p>
          <p className="brand-subtitle">Operations Hub</p>
        </div>
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/bookings">Booking</NavLink>
      </nav>

      <div className="profile-area" onMouseLeave={() => setIsMenuOpen(false)}>
        <button
          type="button"
          className="profile-btn"
          onClick={() => setIsMenuOpen((state) => !state)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
        >
          <span className="avatar">{initials}</span>
        </button>

        {isMenuOpen ? (
          <div className="profile-menu" role="menu">
            <button type="button" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
              Profile
            </button>
            <button type="button" role="menuitem" className="menu-item" onClick={() => setIsMenuOpen(false)}>
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Navbar
