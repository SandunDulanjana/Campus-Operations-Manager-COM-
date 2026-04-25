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
          <DistributionCard
            title="Ticket Status Analysis"
            description="Distribution across active ticket states."
            items={statusChartData}
            total={allTickets.length}
          />
          <DistributionCard
            title="Ticket Priority Analysis"
            description="Priority mix for current ticket queue."
            items={priorityChartData}
            total={allTickets.length}
          />
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

function DistributionCard({ title, description, items, total }) {
  const segments = getChartSegments(items, total)

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <DonutDistribution segments={segments} total={total} label="Tickets" />
      </CardContent>
    </Card>
  )
}

function getChartSegments(items, total) {
  const circumference = 2 * Math.PI * 58
  let offset = 0

  return items.map((item, index) => {
    const dash = total > 0 ? (item.count / total) * circumference : 0
    const segment = {
      ...item,
      dash,
      offset,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
      color: `var(--chart-${(index % 5) + 1})`,
      circumference,
    }
    offset += dash
    return segment
  })
}

function DonutDistribution({ segments, total, label }) {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <div className="relative shrink-0">
        <svg className="-rotate-90" width="160" height="160" viewBox="0 0 160 160" role="img" aria-label={`${label} distribution`}>
          <circle cx="80" cy="80" r="58" fill="none" stroke="var(--muted)" strokeWidth="22" />
          {segments.map((segment) => segment.count > 0 ? (
            <circle
              key={segment.key}
              cx="80"
              cy="80"
              r="58"
              fill="none"
              stroke={segment.color}
              strokeWidth="22"
              strokeDasharray={`${segment.dash} ${segment.circumference - segment.dash}`}
              strokeDashoffset={-segment.offset}
            />
          ) : null)}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-tight">{total}</span>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        </div>
      </div>

      <div className="flex min-w-48 flex-1 flex-col gap-3">
        {segments.map((segment) => (
          <div key={segment.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="size-2 rounded-full" style={{ backgroundColor: segment.color }} />
                {segment.label}
              </span>
              <Badge variant="secondary">{segment.count} · {segment.percent}%</Badge>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${segment.percent}%`, backgroundColor: segment.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminTicketsPage
