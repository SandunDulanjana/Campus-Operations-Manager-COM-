import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const technicianLinks = [
  { to: '/technician/dashboard',     label: 'Dashboard',     icon: 'dashboard'     },
  { to: '/technician/notifications', label: 'Notifications', icon: 'notifications' },
]

function NavIcon({ kind }) {
  if (kind === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </svg>
    )
  }
  if (kind === 'notifications') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4a4 4 0 0 0-4 4v1.3c0 1.1-.36 2.18-1.02 3.05L5.6 14.1A1 1 0 0 0 6.4 15.7h11.2a1 1 0 0 0 .8-1.6l-1.38-1.75A5.07 5.07 0 0 1 16 9.3V8a4 4 0 0 0-4-4Z" />
        <path d="M10 18a2 2 0 0 0 4 0" />
      </svg>
    )
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /></svg>
}

function TechnicianLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <section className={collapsed ? 'admin-dashboard collapsed' : 'admin-dashboard'}>
      <aside className="admin-sidebar" aria-label="Technician navigation">
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-heading">
            <p className="admin-sidebar-title">Technician Panel</p>
            <p className="admin-sidebar-subtitle">Operations controls</p>
          </div>
          <button
            type="button"
            className="admin-collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {collapsed ? <path d="m10 7 5 5-5 5" /> : <path d="m14 7-5 5 5 5" />}
            </svg>
          </button>
        </div>

        <nav className="admin-nav">
          {technicianLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}
            >
              <span className="admin-nav-icon" aria-hidden="true">
                <NavIcon kind={link.icon} />
              </span>
              <span className="admin-nav-text">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <span className="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 4H5v16h5" />
                <path d="M14 8l5 4-5 4" />
                <path d="M9 12h10" />
              </svg>
            </span>
            <span className="admin-nav-text">Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main-content">
        <Outlet />
      </div>
    </section>
  )
}

export default TechnicianLayout