import { useEffect, useState } from 'react'
import { fetchAssignedTickets } from '../api/ticketApi'
import StatusBanner from '../components/ui/StatusBanner'

const STATUS_COLORS = {
  IN_PROGRESS: '#2d6f95',
  RESOLVED:    '#15803d',
  CLOSED:      '#6b7280',
  REJECTED:    '#dc2626',
  OPEN:        '#b7791f',
}

const PRIORITY_COLORS = {
  LOW:      '#15803d',
  MEDIUM:   '#b7791f',
  HIGH:     '#2d6f95',
  CRITICAL: '#dc2626',
}

function DonutChart({ data, colors, total, label }) {
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 58
  const strokeWidth = 22
  const circumference = 2 * Math.PI * r

  let offset = 0
  const segments = data.map((item) => {
    const pct = total > 0 ? item.count / total : 0
    const dash = pct * circumference
    const seg = { ...item, dash, offset }
    offset += dash
    return seg
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
          {segments.map((seg) => (
            seg.count > 0 && (
              <circle
                key={seg.label}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={colors[seg.key] || '#94a3b8'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="butt"
              />
            )
          ))}
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {total}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
          </span>
        </div>
      </div>

      {/* Legend + bars */}
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
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {seg.count} tickets · {pct}%
                </span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: colors[seg.key] || '#94a3b8',
                  borderRadius: 999,
                  transition: 'width 600ms ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TechnicianTicketAnalysis() {
  const [tickets, setTickets]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [dateRange, setRange]   = useState('ALL')

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await fetchAssignedTickets()
      setTickets(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  // ── Date filtering ──────────────────────────────────────────
  function filterByDate(list) {
    if (dateRange === 'ALL') return list
    const now = new Date()
    const cutoff = new Date()
    if (dateRange === '7D')  cutoff.setDate(now.getDate() - 7)
    if (dateRange === '30D') cutoff.setDate(now.getDate() - 30)
    if (dateRange === '90D') cutoff.setDate(now.getDate() - 90)
    return list.filter((t) => new Date(t.createdAt) >= cutoff)
  }

  const filtered = filterByDate(tickets)
  const total    = filtered.length

  // ── Status data ─────────────────────────────────────────────
  const statusData = [
    { key: 'IN_PROGRESS', label: 'In Progress', count: filtered.filter((t) => t.status === 'IN_PROGRESS').length },
    { key: 'RESOLVED',    label: 'Resolved',    count: filtered.filter((t) => t.status === 'RESOLVED').length },
    { key: 'CLOSED',      label: 'Closed',      count: filtered.filter((t) => t.status === 'CLOSED').length },
    { key: 'REJECTED',    label: 'Rejected',    count: filtered.filter((t) => t.status === 'REJECTED').length },
    { key: 'OPEN',        label: 'Open',        count: filtered.filter((t) => t.status === 'OPEN').length },
  ]

  // ── Priority data ────────────────────────────────────────────
  const priorityData = [
    { key: 'LOW',      label: 'Low',      count: filtered.filter((t) => t.priority === 'LOW').length },
    { key: 'MEDIUM',   label: 'Medium',   count: filtered.filter((t) => t.priority === 'MEDIUM').length },
    { key: 'HIGH',     label: 'High',     count: filtered.filter((t) => t.priority === 'HIGH').length },
    { key: 'CRITICAL', label: 'Critical', count: filtered.filter((t) => t.priority === 'CRITICAL').length },
  ]

  const slaBreached = filtered.filter((t) => t.slaBreached).length
  const slaOk       = total - slaBreached

  return (
    <section className="admin-home-page">

      {/* ── Header ── */}
      <div className="admin-home-header">
        <div>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Administration
          </p>
          <h1 style={{ margin: 0 }}>Ticket Analysis</h1>
          <p style={{ margin: '0.3rem 0 0', color: '#64748b' }}>
            Monitor your ticket distributions with a clean, interactive analytics view.
          </p>
        </div>

        {/* Date range filter + refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Date Range
            </span>
            <select
              value={dateRange}
              onChange={(e) => setRange(e.target.value)}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '0.75rem',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#374151',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Time</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
            </select>
          </div>
          <button
            onClick={load}
            style={{
              marginTop: '1.2rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '0.75rem',
              border: '1.5px solid #e2e8f0',
              background: '#fff',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <StatusBanner type="error" message={error} />

      {loading ? (
        <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading analysis...</p>
      ) : (
        <>
          {/* ── Top 3 stat cards ── */}
          <div className="admin-stat-grid">
            <article className="admin-stat-card">
              <p>Total Tickets</p>
              <h2>{total}</h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Filtered by {dateRange === 'ALL' ? 'All Time' : dateRange}</span>
            </article>
            <article className="admin-stat-card">
              <p>Status Tickets</p>
              <h2>{total}</h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {statusData.filter((s) => s.count > 0).map((s) => s.label).join(', ') || '—'}
              </span>
            </article>
            <article className="admin-stat-card">
              <p>Priority Tickets</p>
              <h2>{total}</h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {priorityData.filter((p) => p.count > 0).map((p) => p.label).join(', ') || '—'}
              </span>
            </article>
            <article
              className="admin-stat-card"
              style={slaBreached > 0 ? { borderTop: '3px solid #dc2626' } : {}}
            >
              <p>SLA Breached</p>
              <h2 style={slaBreached > 0 ? { color: '#b91c1c' } : {}}>{slaBreached}</h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{slaOk} within SLA</span>
            </article>
          </div>

          {/* ── Distribution Overview heading ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.5rem 0' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-600)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Distribution Overview
            </span>
          </div>

          {/* ── Two chart cards side by side ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>

            {/* Status chart */}
            <div className="admin-section-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '1rem' }}>📊</span>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Ticket Status Analysis</h2>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  IN PROGRESS, RESOLVED, CLOSED, REJECTED, OPEN
                </p>
              </div>
              {total === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No tickets in this range.</p>
              ) : (
                <DonutChart data={statusData} colors={STATUS_COLORS} total={total} label="Statuses" />
              )}
            </div>

            {/* Priority chart */}
            <div className="admin-section-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '1rem' }}>🏷</span>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Ticket Priority Analysis</h2>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  LOW, MEDIUM, HIGH, CRITICAL
                </p>
              </div>
              {total === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No tickets in this range.</p>
              ) : (
                <DonutChart data={priorityData} colors={PRIORITY_COLORS} total={total} label="Priorities" />
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default TechnicianTicketAnalysis