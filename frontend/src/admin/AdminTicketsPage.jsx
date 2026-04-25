import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircleIcon, Clock3Icon, ShieldAlertIcon, TicketIcon, Trash2Icon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  fetchAllTickets, deleteTicket, formatTicketLabel, formatTicketDate, TICKET_STATUSES,
} from '../api/ticketApi'

// ── Badge variant helpers ─────────────────────────────────────────────────────
function getStatusVariant(status) {
  if (status === 'REJECTED')    return 'destructive'
  if (status === 'IN_PROGRESS') return 'secondary'
  return 'outline'
}

function getPriorityVariant(priority) {
  if (priority === 'CRITICAL') return 'destructive'
  if (priority === 'HIGH')     return 'default'
  return 'outline'
}

// ── Donut chart colors ────────────────────────────────────────────────────────
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

// ── DonutChart ────────────────────────────────────────────────────────────────
function DonutChart({ data, colors, total, label }) {
  const size = 160, cx = 80, cy = 80, r = 58, strokeWidth = 22
  const circumference = 2 * Math.PI * r

  // FIX: use reduce instead of mutating `offset` inside .map()
  // Previously: let offset = 0; data.map(() => { offset += dash })
  // That reassigns a variable after render which caused the error.
  const segments = data.reduce((acc, item) => {
    const prevOffset = acc.length > 0
      ? acc[acc.length - 1].offset + acc[acc.length - 1].dash
      : 0
    const dash = total > 0 ? (item.count / total) * circumference : 0
    return [...acc, { ...item, dash, offset: prevOffset }]
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
          {segments.map((seg) =>
            seg.count > 0 && (
              <circle
                key={seg.label} cx={cx} cy={cy} r={r} fill="none"
                stroke={colors[seg.key] || '#94a3b8'} strokeWidth={strokeWidth}
                strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                strokeDashoffset={-seg.offset} strokeLinecap="butt"
              />
            )
          )}
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {total}
          </span>
          <span style={{
            fontSize: '0.72rem', color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {label}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0
          return (
            <div key={seg.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.82rem', color: '#374151', fontWeight: 600,
                }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: colors[seg.key] || '#94a3b8', flexShrink: 0,
                  }} />
                  {seg.label}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {seg.count} · {pct}%
                </span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: colors[seg.key] || '#94a3b8',
                  borderRadius: 999, transition: 'width 600ms ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Filter pill options ───────────────────────────────────────────────────────
const ALL_FILTER_OPTIONS = [
  { value: '',            label: 'All'         },
  { value: 'OPEN',        label: 'Open'        },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED',    label: 'Resolved'    },
  { value: 'CLOSED',      label: 'Closed'      },
  { value: 'REJECTED',    label: 'Rejected'    },
]

// ── Page ──────────────────────────────────────────────────────────────────────
function AdminTicketsPage() {
  const navigate = useNavigate()

  const [tickets, setTickets]       = useState([])
  const [allTickets, setAllTickets] = useState([])
  const [statusFilter, setFilter]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [errorMessage, setError]    = useState('')
  const [successMessage, setOk]     = useState('')

  useEffect(() => { void loadAllTickets() }, [])

  useEffect(() => {
    void loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function loadAllTickets() {
    try { setAllTickets(await fetchAllTickets({})) }
    catch { /* silent — charts are best-effort */ }
  }

  async function loadTickets() {
    setLoading(true); setError('')
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      setTickets(await fetchAllTickets(params))
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
      void loadAllTickets()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete ticket')
    }
  }

  const total      = allTickets.length
  const open       = allTickets.filter((t) => t.status === 'OPEN').length
  const inProgress = allTickets.filter((t) => t.status === 'IN_PROGRESS').length
  const breached   = allTickets.filter((t) => t.slaBreached).length

  return (
    <section className="flex flex-col gap-6">

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Tickets', value: total,      icon: TicketIcon      },
          { label: 'Open',          value: open,       icon: Clock3Icon      },
          { label: 'In Progress',   value: inProgress, icon: Clock3Icon      },
          { label: 'SLA Breached',  value: breached,   icon: ShieldAlertIcon },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="bg-card/80">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="text-3xl font-semibold tracking-tight">
                    {item.value}
                  </CardTitle>
                </div>
                <div className="rounded-lg border bg-muted p-2 text-muted-foreground">
                  <Icon />
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* ── Distribution charts ─────────────────────────────────────────── */}
      {!loading && allTickets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base">📊 Ticket Status Analysis</CardTitle>
              <CardDescription>OPEN · IN PROGRESS · RESOLVED · CLOSED · REJECTED</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <DonutChart
                data={[
                  { key: 'OPEN',        label: 'Open',        count: allTickets.filter((t) => t.status === 'OPEN').length        },
                  { key: 'IN_PROGRESS', label: 'In Progress', count: allTickets.filter((t) => t.status === 'IN_PROGRESS').length },
                  { key: 'RESOLVED',    label: 'Resolved',    count: allTickets.filter((t) => t.status === 'RESOLVED').length    },
                  { key: 'CLOSED',      label: 'Closed',      count: allTickets.filter((t) => t.status === 'CLOSED').length      },
                  { key: 'REJECTED',    label: 'Rejected',    count: allTickets.filter((t) => t.status === 'REJECTED').length    },
                ]}
                colors={STATUS_COLORS}
                total={allTickets.length}
                label="Statuses"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base">🏷 Ticket Priority Analysis</CardTitle>
              <CardDescription>LOW · MEDIUM · HIGH · CRITICAL</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <DonutChart
                data={[
                  { key: 'LOW',      label: 'Low',      count: allTickets.filter((t) => t.priority === 'LOW').length      },
                  { key: 'MEDIUM',   label: 'Medium',   count: allTickets.filter((t) => t.priority === 'MEDIUM').length   },
                  { key: 'HIGH',     label: 'High',     count: allTickets.filter((t) => t.priority === 'HIGH').length     },
                  { key: 'CRITICAL', label: 'Critical', count: allTickets.filter((t) => t.priority === 'CRITICAL').length },
                ]}
                colors={PRIORITY_COLORS}
                total={allTickets.length}
                label="Priorities"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tickets table ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Incident Tickets</CardTitle>
          <CardDescription>
            Manage all campus maintenance and fault reports submitted by users.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <TicketIcon />
              <AlertTitle>Updated</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Filter pills */}
          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {ALL_FILTER_OPTIONS.map((opt) => {
                const isActive = statusFilter === opt.value
                const count = opt.value === ''
                  ? allTickets.length
                  : allTickets.filter((t) => t.status === opt.value).length
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilter(opt.value)}
                    style={{
                      padding: '0.35rem 0.85rem', borderRadius: 999,
                      border: isActive ? '2px solid var(--brand-600)' : '1.5px solid #e2e8f0',
                      background: isActive ? 'var(--brand-600)' : '#ffffff',
                      color: isActive ? '#ffffff' : '#374151',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 140ms ease',
                    }}
                  >
                    {opt.label}
                    <span style={{
                      marginLeft: '0.35rem', fontSize: '0.72rem',
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: isActive ? '#fff' : '#64748b',
                      borderRadius: 999, padding: '0.05rem 0.4rem',
                    }}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            <Button variant="outline" size="sm" onClick={() => setFilter('')}>
              Reset
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-xl border">
            {loading ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                Loading tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                No tickets found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id}</TableCell>
                      <TableCell className="max-w-64 whitespace-normal">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{ticket.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatTicketLabel(ticket.category)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(ticket.status)}>
                          {formatTicketLabel(ticket.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">
                        {ticket.location}
                      </TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">
                        {ticket.createdByEmail}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTicketDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ticket.slaBreached ? 'destructive' : 'secondary'}>
                          {ticket.slaBreached ? 'Breached' : 'Healthy'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline" size="sm"
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="destructive" size="sm"
                            onClick={() => handleDelete(ticket.id)}
                          >
                            <Trash2Icon data-icon="inline-start" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default AdminTicketsPage