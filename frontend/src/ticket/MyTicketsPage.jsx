import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircleIcon, ClipboardListIcon, PlusIcon, ShieldCheckIcon } from 'lucide-react'
import {
  fetchMyTickets,
  formatTicketLabel,
  formatTicketDate,
  TICKET_STATUSES,
} from '../api/ticketApi'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'

function getStatusVariant(status) {
  if (status === 'REJECTED') return 'destructive'
  if (status === 'RESOLVED' || status === 'CLOSED') return 'secondary'
  return 'outline'
}

function getPriorityVariant(priority) {
  if (priority === 'CRITICAL') return 'destructive'
  if (priority === 'HIGH') return 'secondary'
  return 'outline'
}

function MyTicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setError] = useState('')
  const [activeFilter, setFilter] = useState('ALL')

  useEffect(() => {
    void loadTickets()
  }, [])

  async function loadTickets() {
    setLoading(true)
    setError('')
    try {
      setTickets(await fetchMyTickets())
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your tickets')
    } finally {
      setLoading(false)
    }
  }

  const displayed = useMemo(
    () => activeFilter === 'ALL' ? tickets : tickets.filter((ticket) => ticket.status === activeFilter),
    [activeFilter, tickets],
  )

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'OPEN').length,
    active: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
    breached: tickets.filter((ticket) => ticket.slaBreached).length,
  }), [tickets])

  return (
    <section className="flex flex-col gap-6">
      <Card>
        <CardHeader className="gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit">Service desk</Badge>
            <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">My Tickets</CardTitle>
            <CardDescription>Track submitted incident reports, SLA state, and technician progress.</CardDescription>
          </div>
          <Button onClick={() => navigate('/tickets/new')}>
            <PlusIcon data-icon="inline-start" />
            Report Incident
          </Button>
        </CardHeader>
      </Card>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TicketStat label="Total tickets" value={stats.total} />
        <TicketStat label="Open" value={stats.open} />
        <TicketStat label="In progress" value={stats.active} />
        <TicketStat label="SLA breached" value={stats.breached} />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Ticket Queue</CardTitle>
          <CardDescription>Filter by status and open a ticket for full comments, attachments, and workflow history.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Tabs value={activeFilter} onValueChange={setFilter}>
            <TabsList className="flex h-auto flex-wrap justify-start">
              {['ALL', ...TICKET_STATUSES].map((status) => (
                <TabsTrigger key={status} value={status}>
                  {formatTicketLabel(status)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
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
                  <TableHead>Created</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.length > 0 ? displayed.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell className="max-w-80 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{ticket.title}</span>
                        <span className="text-sm text-muted-foreground">{formatTicketLabel(ticket.category)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(ticket.status)}>{formatTicketLabel(ticket.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell>{ticket.location}</TableCell>
                    <TableCell className="text-muted-foreground">{formatTicketDate(ticket.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={ticket.slaBreached ? 'destructive' : 'secondary'}>
                        <ShieldCheckIcon data-icon="inline-start" />
                        {ticket.slaBreached ? 'Breached' : 'OK'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardListIcon />
                        <span>
                          {activeFilter === 'ALL'
                            ? 'You have not submitted any tickets yet.'
                            : `No tickets with status "${formatTicketLabel(activeFilter)}".`}
                        </span>
                        {activeFilter === 'ALL' ? (
                          <Button onClick={() => navigate('/tickets/new')}>Report your first incident</Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

function TicketStat({ label, value }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

export default MyTicketsPage
