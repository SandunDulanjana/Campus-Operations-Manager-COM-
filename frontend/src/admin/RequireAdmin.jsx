import StatusBanner from '../components/ui/StatusBanner'
import { useAuth } from '../context/useAuth'

function RequireAdmin({ children }) {
  const { user } = useAuth()

  if (user.role !== 'ADMIN') {
    return (
      <section className="booking-page">
        <div className="table-panel">
          <h1>Admin Dashboard</h1>
          <StatusBanner type="error" message="Admin access is required to view this dashboard." />
        </div>
      </section>
    )
  }

  return children
}

export default RequireAdmin
