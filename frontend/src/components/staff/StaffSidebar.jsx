import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

const roleLinks = {
  ADMIN: [
    { to: '/app/admin', label: 'Dashboard', end: true },
    { to: '/app/admin/bookings', label: 'Bookings' },
    { to: '/app/admin/users', label: 'Users' },
    { to: '/app/admin/resources', label: 'Resources' },
    { to: '/app/profile', label: 'Profile' },
  ],
  TECHNICIAN: [
    { to: '/app/technician', label: 'Technician Workspace', end: true },
    { to: '/app/profile', label: 'Profile' },
  ],
  MAINTENANCEMNG: [
    { to: '/app/maintenance', label: 'Maintenance Workspace', end: true },
    { to: '/app/profile', label: 'Profile' },
  ],
  RECOURSEMNG: [
    { to: '/app/resources', label: 'Resource Workspace', end: true },
    { to: '/app/profile', label: 'Profile' },
  ],
  BOOKINGMNG: [
    { to: '/app/booking-manager', label: 'Booking Workspace', end: true },
    { to: '/app/profile', label: 'Profile' },
  ],
}

function StaffSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = roleLinks[user?.role] ?? [{ to: '/app/profile', label: 'Profile', end: true }]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="staff-sidebar" aria-label="Staff navigation">
      <div className="staff-sidebar-header">
        <p className="staff-sidebar-eyebrow">Private Workspace</p>
        <h1>Smart Campus</h1>
        <p>{user?.role || 'STAFF'} controls</p>
      </div>

      <nav className="staff-sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'staff-sidebar-link active' : 'staff-sidebar-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="staff-sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  )
}

export default StaffSidebar
