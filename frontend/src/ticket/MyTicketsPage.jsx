import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionButton from '../components/ui/ActionButton'
import StatusBanner from '../components/ui/StatusBanner'
import {
  fetchMyTickets,
  formatTicketLabel,
  formatTicketDate,
  getStatusBadgeClass,
  getPriorityBadgeClass,
  TICKET_STATUSES,
} from '../api/ticketApi'

function MyTicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [errorMessage, setError]  = useState('')
  const [activeFilter, setFilter] = useState('ALL')

  useEffect(() => {
    void loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTickets() {
    setLoading(true)
    try {
      const data = await fetchMyTickets()
      setTickets(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your tickets')
    } finally {
      setLoading(false)
    }
  }

  const displayed = activeFilter === 'ALL'
    ? tickets
    : tickets.filter((t) => t.status === activeFilter)

  return (
    <section className="admin-resources-page">

      <div className="home-section-card" style={{ padding: '1.5rem' }}>
        <div className="panel-header">
          <div>
            <h1>My Tickets</h1>
            <p>Track the status of your submitted incident reports.</p>
          </div>
          <ActionButton kind="primary" onClick={() => navigate('/tickets/new')}>
            + Report Incident
          </ActionButton>
        </div>
      </div>

      <StatusBanner type="error" message={errorMessage} />

      <div className="home-section-card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', ...TICKET_STATUSES].map((s) => (
            <button
              key={s}
              type="button"
              className={activeFilter === s ? 'primary-btn' : 'ghost-btn'}
              onClick={() => setFilter(s)}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', width: 'auto' }}
            >
              {formatTicketLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-panel">

        {loading && (
          <p style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>
            Loading your tickets...
          </p>
        )}

        {!loading && displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              {activeFilter === 'ALL'
                ? 'You have not submitted any tickets yet.'
                : `No tickets with status "${formatTicketLabel(activeFilter)}".`}
            </p>
            {activeFilter === 'ALL' && (
              <ActionButton kind="primary" onClick={() => navigate('/tickets/new')}>
                Report your first incident
              </ActionButton>
            )}
          </div>
        )}

        {!loading && displayed.length > 0 && (
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((ticket) => (
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
                        : <span className="badge approved">✓ OK</span>
                      }
                    </td>
                    <td>
                      <ActionButton kind="ghost" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                        View
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

export default MyTicketsPage