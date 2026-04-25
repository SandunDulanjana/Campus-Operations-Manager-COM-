import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircleIcon, ShieldCheckIcon } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import {
  fetchAssignedTickets,
  formatTicketLabel,
  formatTicketDate,
} from '../api/ticketApi'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' },
]

const CLOSED_STATUSES = ['CLOSED', 'RESOLVED', 'REJECTED']

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

function TechnicianDashboardHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
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
      setTickets(await fetchAssignedTickets())
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assigned tickets')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => ({
    total: tickets.length,
    inProgress: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((ticket) => ticket.status === 'RESOLVED').length,
    breached: tickets.filter((ticket) => ticket.slaBreached).length,
  }), [tickets])

  const filteredTickets = useMemo(
    () => activeFilter === 'ALL' ? tickets : tickets.filter((ticket) => ticket.status === activeFilter),
    [activeFilter, tickets],
  )

  return (
    <section className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">Technician workspace</Badge>
          <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">Dashboard</CardTitle>
          <CardDescription>
            Welcome, <span className="font-medium text-foreground">{user?.name || user?.email}</span>. Monitor assigned tickets and SLA risk.
          </CardDescription>
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
        <StatCard label="Total assigned" value={stats.total} />
        <StatCard label="In progress" value={stats.inProgress} />
        <StatCard label="Resolved" value={stats.resolved} />
        <StatCard label="SLA breached" value={stats.breached} />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Assigned Tickets</CardTitle>
          <CardDescription>{filteredTickets.length} tickets in current view.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Tabs value={activeFilter} onValueChange={setFilter}>
            <TabsList className="flex h-auto flex-wrap justify-start">
              {STATUS_FILTERS.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>{filter.label}</TabsTrigger>
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
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length > 0 ? filteredTickets.map((ticket) => {
                  const isClosed = CLOSED_STATUSES.includes(ticket.status)
                  return (
                    <TableRow key={ticket.id} className={isClosed ? 'opacity-60' : undefined}>
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell className="max-w-80 whitespace-normal">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{ticket.title}</span>
                          <span className="text-sm text-muted-foreground">{formatTicketLabel(ticket.category)}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={getStatusVariant(ticket.status)}>{formatTicketLabel(ticket.status)}</Badge></TableCell>
                      <TableCell><Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge></TableCell>
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
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                }) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      {activeFilter === 'ALL'
                        ? 'No tickets are currently assigned to you.'
                        : `No ${activeFilter.toLowerCase().replaceAll('_', ' ')} tickets found.`}
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

function StatCard({ label, value }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

export default TechnicianDashboardHome
