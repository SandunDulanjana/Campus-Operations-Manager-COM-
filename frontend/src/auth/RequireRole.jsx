import StatusBanner from '../components/ui/StatusBanner'
import { useAuth } from '../context/useAuth'

function RequireRole({ allowedRoles, children }) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <section className="booking-page">
        <div className="table-panel">
          <h1>Access Restricted</h1>
          <StatusBanner
            type="error"
            message="Your account does not have permission to view this dashboard."
          />
        </div>
      </section>
    )
  }

  return children
}

export default RequireRole
