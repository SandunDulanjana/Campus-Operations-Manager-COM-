import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircleIcon, Clock3Icon, ShieldAlertIcon, TicketIcon, Trash2Icon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  fetchAllTickets,
  deleteTicket,
  formatTicketLabel,
  formatTicketDate,
  TICKET_STATUSES,
} from '../api/ticketApi'

const STATUS_COLORS = {
  OPEN: 'var(--chart-1)',
  IN_PROGRESS: 'var(--chart-2)',
  RESOLVED: 'var(--chart-3)',
  CLOSED: 'var(--chart-4)',
  REJECTED: 'var(--destructive)',
}

const PRIORITY_COLORS = {
  LOW: 'var(--chart-3)',
  MEDIUM: 'var(--chart-2)',
  HIGH: 'var(--chart-1)',
  CRITICAL: 'var(--destructive)',
}

function getStatusVariant(status) {
  if (status === 'REJECTED') return 'destructive'
  if (status === 'IN_PROGRESS') return 'secondary'
  return 'outline'
}

function getPriorityVariant(priority) {
  if (priority === 'CRITICAL') return 'destructive'
  if (priority === 'HIGH') return 'default'
  return 'outline'
}

function DonutChart({ data, colors, total, label }) {
  const size = 150
  const center = 75
  const radius = 54
  const strokeWidth = 18
  const circumference = 2 * Math.PI * radius
  let offset = 0
  const segments = data.map((item) => {
    const dash = total > 0 ? (item.count / total) * circumference : 0
    const segment = { ...item, dash, offset }
    offset += dash
    return segment
  })

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--muted)" strokeWidth={strokeWidth} />
          {segments.map((segment) => segment.count > 0 && (
            <circle
              key={segment.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={colors[segment.key] || 'var(--muted-foreground)'}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={-segment.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight">{total}</span>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {segments.map((segment) => {
          const percent = total > 0 ? Math.round((segment.count / total) * 100) : 0
          return (
            <div key={segment.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: colors[segment.key] || 'var(--muted-foreground)' }}
                  />
                  {segment.label}
                </span>
                <span className="text-muted-foreground">{segment.count} | {percent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percent}%`,
                    background: colors[segment.key] || 'var(--muted-foreground)',
                  }}
                />
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
  const [tickets, setTickets] = useState([])
  const [allTickets, setAllTickets] = useState([])
  const [statusFilter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setError] = useState('')
  const [successMessage, setOk] = useState('')

  useEffect(() => { void loadAllTickets() }, [])

  useEffect(() => {
    void loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function loadAllTickets() {
    try {
      setAllTickets(await fetchAllTickets({}))
    } catch {
      setAllTickets([])
    }
  }

  async function loadTickets() {
    setLoading(true)
    setError('')
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      setTickets(await fetchAllTickets(params))
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(ticketId) {
    if (!window.confirm(`Delete ticket #${ticketId}? This cannot be undone.`)) return
    try {
      await deleteTicket(ticketId)
      setOk(`Ticket #${ticketId} deleted.`)
      await Promise.all([loadTickets(), loadAllTickets()])
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to delete ticket')
    }
  }

  const counts = useMemo(() => ({
    total: allTickets.length,
    open: allTickets.filter((ticket) => ticket.status === 'OPEN').length,
    inProgress: allTickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
    breached: allTickets.filter((ticket) => ticket.slaBreached).length,
  }), [allTickets])

  const statusChartData = TICKET_STATUSES.map((status) => ({
    key: status,
    label: formatTicketLabel(status),
    count: allTickets.filter((ticket) => ticket.status === status).length,
  }))

  const priorityChartData = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => ({
    key: priority,
    label: formatTicketLabel(priority),
    count: allTickets.filter((ticket) => ticket.priority === priority).length,
  }))

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Tickets', value: counts.total, icon: TicketIcon },
          { label: 'Open', value: counts.open, icon: Clock3Icon },
          { label: 'In Progress', value: counts.inProgress, icon: Clock3Icon },
          { label: 'SLA Breached', value: counts.breached, icon: ShieldAlertIcon },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="bg-card/80">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="text-3xl font-semibold tracking-tight">{item.value}</CardTitle>
                </div>
                <div className="rounded-lg border bg-muted p-2 text-muted-foreground">
                  <Icon />
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {!loading && allTickets.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Ticket Status Analysis</CardTitle>
              <CardDescription>Distribution across active ticket states.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <DonutChart data={statusChartData} colors={STATUS_COLORS} total={allTickets.length} label="Status" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Ticket Priority Analysis</CardTitle>
              <CardDescription>Priority mix for current ticket queue.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <DonutChart data={priorityChartData} colors={PRIORITY_COLORS} total={allTickets.length} label="Priority" />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Incident Tickets</CardTitle>
          <CardDescription>Manage all campus maintenance and fault reports submitted by users.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert>
              <TicketIcon />
              <AlertTitle>Updated</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Filter by status</p>
              <Select value={statusFilter || '__all__'} onValueChange={(value) => setFilter(value === '__all__' ? '' : value)}>
                <SelectTrigger className="min-w-52">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="__all__">All statuses</SelectItem>
                    {TICKET_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatTicketLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setFilter('')}>
              Reset
            </Button>
          </div>

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
                          <span className="text-sm text-muted-foreground">{formatTicketLabel(ticket.category)}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={getStatusVariant(ticket.status)}>{formatTicketLabel(ticket.status)}</Badge></TableCell>
                      <TableCell><Badge variant={getPriorityVariant(ticket.priority)}>{formatTicketLabel(ticket.priority)}</Badge></TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">{ticket.location}</TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">{ticket.createdByEmail}</TableCell>
                      <TableCell className="text-muted-foreground">{formatTicketDate(ticket.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.slaBreached ? 'destructive' : 'secondary'}>
                          {ticket.slaBreached ? 'Breached' : 'Healthy'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                            View
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(ticket.id)}>
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
