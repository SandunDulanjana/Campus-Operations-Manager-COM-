import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'bookings' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/resources', label: 'Resources', icon: 'resources' },
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

  if (kind === 'bookings') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </svg>
    )
  }

  if (kind === 'users') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M14.5 20c.3-1.9 1.9-3.4 4.2-3.8" />
      </svg>
    )
  }

  if (kind === 'resources') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7l8-4 8 4-8 4-8-4z" />
        <path d="M4 12l8 4 8-4" />
        <path d="M4 17l8 4 8-4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <section className={collapsed ? 'admin-dashboard collapsed' : 'admin-dashboard'}>
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-heading">
            <p className="admin-sidebar-title">Admin Panel</p>
            <p className="admin-sidebar-subtitle">Operations controls</p>
          </div>
          <button
            type="button"
            className="admin-collapse-btn"
            onClick={() => setCollapsed((current) => !current)}
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {collapsed ? <path d="m10 7 5 5-5 5" /> : <path d="m14 7-5 5 5 5" />}
            </svg>
          </button>
        </div>

        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
            >
              <span className="admin-nav-icon" aria-hidden="true">
                <NavIcon kind={link.icon} />
              </span>
              <span className="admin-nav-text">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-logout-btn">
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

export default AdminLayout
