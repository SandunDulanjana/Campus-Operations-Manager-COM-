import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'DB' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'BK' },
  { to: '/admin/users', label: 'Users', icon: 'US' },
  { to: '/admin/resources', label: 'Resources', icon: 'RS' },
]

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <section className={collapsed ? 'admin-dashboard collapsed' : 'admin-dashboard'}>
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-top">
          <p className="admin-sidebar-title">Admin Panel</p>
          <button
            type="button"
            className="admin-collapse-btn"
            onClick={() => setCollapsed((current) => !current)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? '>' : '<'}
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
                {link.icon}
              </span>
              <span className="admin-nav-text">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-logout-btn">
            <span className="admin-nav-icon" aria-hidden="true">
              LG
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
