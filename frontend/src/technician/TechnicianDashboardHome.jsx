import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import ActionButton from '../components/ui/ActionButton'
import StatusBanner from '../components/ui/StatusBanner'
import {
  fetchAssignedTickets,
  formatTicketLabel,
  formatTicketDate,
  getStatusBadgeClass,
  getPriorityBadgeClass,
} from '../api/ticketApi'

function TechnicianDashboardHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tickets, setTickets]    = useState([])
  const [loading, setLoading]    = useState(true)
  const [errorMessage, setError] = useState('')

  useEffect(() => {
    void loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTickets() {
    setLoading(true)
    try {
      const data = await fetchAssignedTickets()
      setTickets(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assigned tickets')
    } finally {
      setLoading(false)
    }
  }

  const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length
  const resolved   = tickets.filter((t) => t.status === 'RESOLVED').length
  const breached   = tickets.filter((t) => t.slaBreached).length
  const total      = tickets.length

  return (
    <section className="admin-home-page">

      <div className="admin-home-header">
        <h1>Dashboard</h1>
        <p>
          Welcome, <strong>{user?.name || user?.email}</strong>.
          Monitor your assigned tickets and notifications from one workspace.
        </p>
      </div>

      <div className="admin-stat-grid">
        <article className="admin-stat-card">
          <p>Total Assigned</p>
          <h2>{total}</h2>
        </article>
        <article className="admin-stat-card">
          <p>In Progress</p>
          <h2>{inProgress}</h2>
        </article>
        <article className="admin-stat-card">
          <p>Resolved</p>
          <h2>{resolved}</h2>
        </article>
        <article
          className="admin-stat-card"
          style={breached > 0 ? { borderTop: '3px solid #dc2626' } : {}}
        >
          <p>SLA Breached</p>
          <h2 style={breached > 0 ? { color: '#b91c1c' } : {}}>{breached}</h2>
        </article>
      </div>

      <div className="admin-section-card">
        <h2>Quick Overview</h2>
        <p>
          Use the sidebar to open your Dashboard and Notifications pages.
          Ticket updates and status changes are available by clicking any ticket below.
        </p>
      </div>

      <StatusBanner type="error" message={errorMessage} />

      <div className="table-panel">
        <div className="panel-header" style={{ padding: '0.5rem 0' }}>
          <h2>Assigned Tickets</h2>
        </div>

        {loading && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Loading your assigned tickets...
          </p>
        )}

        {!loading && tickets.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No tickets are currently assigned to you.
          </p>
        )}

        {!loading && tickets.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Created</th>
                  <th>SLA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.id}</td>
                    <td>
                      <strong>{ticket.title}</strong>
                      <span className="muted">{formatTicketLabel(ticket.category)}</span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(ticket.status)}>
                        {formatTicketLabel(ticket.status)}
                      </span>
                    </td>
                    <td>
                      <span className={getPriorityBadgeClass(ticket.priority)}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>{ticket.location}</td>
                    <td>
                      <span className="muted">{formatTicketDate(ticket.createdAt)}</span>
                    </td>
                    <td>
                      {ticket.slaBreached
                        ? <span className="badge rejected">⚠ Breached</span>
                        : <span className="badge approved">✔ OK</span>
                      }
                    </td>
                    <td>
                      <ActionButton kind="ghost" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                        Open
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default TechnicianDashboardHome