import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionButton from '../components/ui/ActionButton'
import StatusBanner from '../components/ui/StatusBanner'
import {
  fetchAllTickets,
  deleteTicket,
  formatTicketLabel,
  formatTicketDate,
  getStatusBadgeClass,
  getPriorityBadgeClass,
  TICKET_STATUSES,
} from '../api/ticketApi'

function AdminTicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets]     = useState([])
  const [statusFilter, setFilter] = useState('')
  const [loading, setLoading]     = useState(true)
  const [errorMessage, setError]  = useState('')
  const [successMessage, setOk]   = useState('')

  useEffect(() => {
    void loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function loadTickets() {
    setLoading(true)
    setError('')
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const data   = await fetchAllTickets(params)
      setTickets(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(ticketId) {
    if (!window.confirm(`Delete ticket #${ticketId}? This cannot be undone.`)) return
    try {
      await deleteTicket(ticketId)
      setOk(`Ticket #${ticketId} deleted.`)
      void loadTickets()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete ticket')
    }
  }

  const total      = tickets.length
  const open       = tickets.filter((t) => t.status === 'OPEN').length
  const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length
  const breached   = tickets.filter((t) => t.slaBreached).length

  return (
    <section className="admin-resources-page">

      <div className="admin-stat-grid">
        <article className="admin-stat-card">
          <p>Total Tickets</p>
          <h2>{total}</h2>
        </article>
        <article className="admin-stat-card">
          <p>Open</p>
          <h2>{open}</h2>
        </article>
        <article className="admin-stat-card">
          <p>In Progress</p>
          <h2>{inProgress}</h2>
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
        <div className="panel-header">
          <div>
            <h1>Incident Tickets</h1>
            <p>Manage all campus maintenance and fault reports submitted by users.</p>
          </div>
        </div>

        <StatusBanner type="error"   message={errorMessage}   />
        <StatusBanner type="success" message={successMessage} />

        <form
          className="admin-filter-row admin-resource-filter-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <label>
            Filter by Status
            <select
              value={statusFilter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>{formatTicketLabel(s)}</option>
              ))}
            </select>
          </label>

          <ActionButton kind="ghost" type="button" onClick={() => setFilter('')}>
            Reset
          </ActionButton>
        </form>
      </div>

      <div className="table-panel">
        {loading && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Loading tickets...
          </p>
        )}

        {!loading && tickets.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No tickets found.
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
                  <th>Reported by</th>
                  <th>Created</th>
                  <th>SLA</th>
                  <th>Actions</th>
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
                      <span className="muted">{ticket.createdByEmail}</span>
                    </td>
                    <td>
                      <span className="muted">{formatTicketDate(ticket.createdAt)}</span>
                    </td>
                    <td>
                      {ticket.slaBreached
                        ? <span className="badge rejected">⚠ Breached</span>
                        : <span className="badge approved">✓ OK</span>
                      }
                    </td>
                    <td className="resource-actions-cell">
                      <ActionButton kind="ghost" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                        View
                      </ActionButton>
                      <ActionButton kind="danger" onClick={() => handleDelete(ticket.id)}>
                        Delete
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

export default AdminTicketsPage