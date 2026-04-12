import { NavLink, Outlet } from 'react-router-dom'

const adminLinks = [
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/resources', label: 'Resources' },
]

function AdminLayout() {
  return (
    <section className="admin-dashboard">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <p className="admin-sidebar-eyebrow">Admin Panel</p>
        <h2>Dashboard</h2>
        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main-content">
        <Outlet />
      </div>
    </section>
  )
}

export default AdminLayout
