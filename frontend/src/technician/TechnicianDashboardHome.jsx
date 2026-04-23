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

const STATUS_FILTERS = [
  { value: 'ALL',         label: 'All' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED',    label: 'Resolved' },
  { value: 'CLOSED',      label: 'Closed' },
  { value: 'REJECTED',    label: 'Rejected' },
]

function TechnicianDashboardHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tickets, setTickets]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [errorMessage, setError]    = useState('')
  const [activeFilter, setFilter]   = useState('ALL')

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

  const filteredTickets = activeFilter === 'ALL'
    ? tickets
    : tickets.filter((t) => t.status === activeFilter)

  const closedStatuses = ['CLOSED', 'RESOLVED', 'REJECTED']

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

      <StatusBanner type="error" message={errorMessage} />

      <div className="table-panel">

        {/* ── Header row with title + filter buttons ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.25rem 0 1rem',
        }}>
          <h2 style={{ margin: 0 }}>
            Assigned Tickets
            <span style={{
              marginLeft: '0.6rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#64748b',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 999,
              padding: '0.15rem 0.6rem',
            }}>
              {filteredTickets.length}
            </span>
          </h2>

          {/* ── Status filter pills ── */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((f) => {
              const isActive = activeFilter === f.value
              const isClosed = f.value === 'CLOSED'
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 999,
                    border: isActive
                      ? `2px solid ${isClosed ? '#6b7280' : 'var(--brand-600)'}`
                      : '1.5px solid #e2e8f0',
                    background: isActive
                      ? isClosed ? '#6b7280' : 'var(--brand-600)'
                      : '#ffffff',
                    color: isActive ? '#ffffff' : isClosed ? '#6b7280' : '#374151',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 140ms ease',
                  }}
                >
                  {f.label}
                 
                </button>
              )
            })}
          </div>
        </div>

        {loading && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Loading your assigned tickets...
          </p>
        )}

        {!loading && filteredTickets.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            {activeFilter === 'ALL'
              ? 'No tickets are currently assigned to you.'
              : `No ${activeFilter.toLowerCase().replace('_', ' ')} tickets found.`}
          </p>
        )}

        {!loading && filteredTickets.length > 0 && (
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
                {filteredTickets.map((ticket) => {
                  const isClosed = closedStatuses.includes(ticket.status)
                  return (
                    <tr
                      key={ticket.id}
                      style={isClosed ? {
                        opacity: 0.55,
                        background: '#f8fafc',
                      } : {}}
                    >
                      <td>
                        <span style={{ color: isClosed ? '#9ca3af' : 'inherit' }}>
                          {ticket.id}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: isClosed ? '#9ca3af' : 'inherit' }}>
                          {ticket.title}
                        </strong>
                        {isClosed && (
                          <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: '#e5e7eb',
                            color: '#6b7280',
                            borderRadius: 999,
                            padding: '0.1rem 0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            Closed
                          </span>
                        )}
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
                      <td style={{ color: isClosed ? '#9ca3af' : 'inherit' }}>
                        {ticket.location}
                      </td>
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
                        <ActionButton
                          kind={isClosed ? 'ghost' : 'ghost'}
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          style={isClosed ? { opacity: 0.6 } : {}}
                        >
                          Open
                        </ActionButton>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default TechnicianDashboardHome