import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, setRole, setUserId } = useAuth()

  return (
    <header className="main-navbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          SC
        </span>
        <div>
          <p className="brand-title">Smart Campus</p>
          <p className="brand-subtitle">Booking Management</p>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/bookings">Home</NavLink>
        <NavLink to="/bookings">My Bookings</NavLink>
        <NavLink to="/admin/bookings">Admin Review</NavLink>
      </nav>

      <div className="session-controls">
        <label>
          Role
          <select value={user.role} onChange={(event) => setRole(event.target.value)}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>

        <label>
          User ID
          <input
            type="number"
            min="1"
            value={user.id}
            onChange={(event) => setUserId(Number(event.target.value) || 1)}
          />
        </label>
      </div>
    </header>
  )
}

export default Navbar
