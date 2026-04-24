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

// ── Inline DonutChart (same as TechnicianTicketAnalysis) ──────────────────────
const STATUS_COLORS = {
  OPEN:        '#b7791f',
  IN_PROGRESS: '#2d6f95',
  RESOLVED:    '#15803d',
  CLOSED:      '#6b7280',
  REJECTED:    '#dc2626',
}
const PRIORITY_COLORS = {
  LOW:      '#15803d',
  MEDIUM:   '#b7791f',
  HIGH:     '#2d6f95',
  CRITICAL: '#dc2626',
}

function DonutChart({ data, colors, total, label }) {
  const size = 160, cx = 80, cy = 80, r = 58, strokeWidth = 22
  const circumference = 2 * Math.PI * r
  let offset = 0
  const segments = data.map((item) => {
    const dash = total > 0 ? (item.count / total) * circumference : 0
    const seg = { ...item, dash, offset }
    offset += dash
    return seg
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
          {segments.map((seg) => seg.count > 0 && (
            <circle key={seg.label} cx={cx} cy={cy} r={r} fill="none"
              stroke={colors[seg.key] || '#94a3b8'} strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset} strokeLinecap="butt" />
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0
          return (
            <div key={seg.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[seg.key] || '#94a3b8', flexShrink: 0 }} />
                  {seg.label}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{seg.count} tickets · {pct}%</span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: colors[seg.key] || '#94a3b8', borderRadius: 999, transition: 'width 600ms ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

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

     {/* ── Ticket Analysis Charts ── */}
      {!loading && tickets.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.5rem 0 0.75rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-600)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Distribution Overview
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="admin-section-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span>📊</span>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Ticket Status Analysis</h2>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>OPEN, IN PROGRESS, RESOLVED, CLOSED, REJECTED</p>
              </div>
              <DonutChart
                data={[
                  { key: 'OPEN',        label: 'Open',        count: tickets.filter((t) => t.status === 'OPEN').length },
                  { key: 'IN_PROGRESS', label: 'In Progress', count: tickets.filter((t) => t.status === 'IN_PROGRESS').length },
                  { key: 'RESOLVED',    label: 'Resolved',    count: tickets.filter((t) => t.status === 'RESOLVED').length },
                  { key: 'CLOSED',      label: 'Closed',      count: tickets.filter((t) => t.status === 'CLOSED').length },
                  { key: 'REJECTED',    label: 'Rejected',    count: tickets.filter((t) => t.status === 'REJECTED').length },
                ]}
                colors={STATUS_COLORS}
                total={tickets.length}
                label="Statuses"
              />
            </div>
            <div className="admin-section-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span>🏷</span>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Ticket Priority Analysis</h2>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>LOW, MEDIUM, HIGH, CRITICAL</p>
              </div>
              <DonutChart
                data={[
                  { key: 'LOW',      label: 'Low',      count: tickets.filter((t) => t.priority === 'LOW').length },
                  { key: 'MEDIUM',   label: 'Medium',   count: tickets.filter((t) => t.priority === 'MEDIUM').length },
                  { key: 'HIGH',     label: 'High',     count: tickets.filter((t) => t.priority === 'HIGH').length },
                  { key: 'CRITICAL', label: 'Critical', count: tickets.filter((t) => t.priority === 'CRITICAL').length },
                ]}
                colors={PRIORITY_COLORS}
                total={tickets.length}
                label="Priorities"
              />
            </div>
          </div>
        </>
      )}

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