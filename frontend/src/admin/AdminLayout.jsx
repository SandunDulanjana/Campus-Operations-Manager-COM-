import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'bookings' },
  { to: '/admin/tickets', label: 'Tickets', icon: 'tickets' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/resources', label: 'Resources', icon: 'resources' },
  { to: '/admin/notifications', label: 'Notifications', icon: 'notifications' },
]

const pageMeta = {
  '/admin/dashboard': {
    title: 'Operations Dashboard',
    subtitle: 'Campus activity, requests, and approvals in one place.',
  },
  '/admin/bookings': {
    title: 'Booking Review',
    subtitle: 'Inspect requests, approve schedules, and resolve conflicts.',
  },
  '/admin/tickets': {
    title: 'Incident Tickets',
    subtitle: 'Track service issues, priority, and technician progress.',
  },
  '/admin/users': {
    title: 'User Management',
    subtitle: 'Approve registrations, roles, and access decisions.',
  },
  '/admin/resources': {
    title: 'Resource Management',
    subtitle: 'Maintain campus spaces, equipment, and availability windows.',
  },
  '/admin/notifications': {
    title: 'Notifications',
    subtitle: 'Broadcast updates and control delivery to campus roles.',
  },
}

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

  if (kind === 'tickets') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
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

  if (kind === 'notifications') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4a4 4 0 0 0-4 4v1.3c0 1.1-.36 2.18-1.02 3.05L5.6 14.1A1 1 0 0 0 6.4 15.7h11.2a1 1 0 0 0 .8-1.6l-1.38-1.75A5.07 5.07 0 0 1 16 9.3V8a4 4 0 0 0-4-4Z" />
        <path d="M10 18a2 2 0 0 0 4 0" />
      </svg>
    )
  }

  return null
}

function HeaderIcon({ kind }) {
  if (kind === 'brand') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 16.5V8.2c0-.7.36-1.34.96-1.7L12 3.5l5.04 3c.6.36.96 1 .96 1.7v8.3c0 .7-.36 1.34-.96 1.7L12 21l-5.04-2.8A1.97 1.97 0 0 1 6 16.5Z" />
        <path d="M9.2 10.8 12 9l2.8 1.8V14L12 15.8 9.2 14v-3.2Z" />
        <path d="M12 3.5v5.4" />
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

  return null
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const meta = useMemo(() => pageMeta[pathname] ?? pageMeta['/admin/dashboard'], [pathname])
  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'A'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <section className={collapsed ? 'admin-shell collapsed' : 'admin-shell'}>
      <aside className="admin-sidebar-shell" aria-label="Admin navigation">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brandmark" aria-hidden="true">
            <HeaderIcon kind="brand" />
          </div>
          {!collapsed && (
            <div className="admin-sidebar-brandcopy">
              <p>Smart Campus</p>
              <span>Operations Hub</span>
            </div>
          )}
        </div>

        <div className="admin-sidebar-head">
          {!collapsed && (
            <div>
              <p className="admin-sidebar-kicker">Admin Panel</p>
              <h2>Control Center</h2>
            </div>
          )}
          <button
            type="button"
            className="admin-shell-toggle"
            onClick={() => setCollapsed((current) => !current)}
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {collapsed ? <path d="m10 7 5 5-5 5" /> : <path d="m14 7-5 5 5 5" />}
            </svg>
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'admin-sidebar-link active' : 'admin-sidebar-link')}
            >
              <span className="admin-sidebar-linkicon" aria-hidden="true">
                <NavIcon kind={link.icon} />
              </span>
              {!collapsed && <span className="admin-sidebar-linktext">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          {!collapsed && user && (
            <div className="admin-sidebar-usercard">
              <div className="admin-sidebar-avatar">{initials}</div>
              <div>
                <strong>{user.name || user.email}</strong>
                <span>{user.role}</span>
              </div>
            </div>
          )}

          <button type="button" className="admin-shell-logout" onClick={handleLogout}>
            <span className="admin-sidebar-linkicon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 4H5v16h5" />
                <path d="M14 8l5 4-5 4" />
                <path d="M9 12h10" />
              </svg>
            </span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="admin-shell-main">
        <header className="admin-shell-topbar">
          <div>
            <p className="admin-shell-kicker">Experimental Migration</p>
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>

          <div className="admin-shell-toolbar">
            <label className="admin-shell-search">
              <span aria-hidden="true">
                <HeaderIcon kind="search" />
              </span>
              <input type="text" placeholder="Search admin pages..." />
            </label>

            {user && (
              <div className="admin-shell-profile">
                <div className="admin-sidebar-avatar">{initials}</div>
                <div>
                  <strong>{user.name || user.email}</strong>
                  <span>{user.role}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="admin-shell-content">
          <Outlet />
        </div>
      </div>
    </section>
  )
}

export default AdminLayout
