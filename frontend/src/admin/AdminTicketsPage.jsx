import { useEffect, useState } from 'react'
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
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Tickets', value: total, icon: TicketIcon },
          { label: 'Open', value: open, icon: Clock3Icon },
          { label: 'In Progress', value: inProgress, icon: Clock3Icon },
          { label: 'SLA Breached', value: breached, icon: ShieldAlertIcon },
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

          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 md:flex-row md:items-end md:justify-between">
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
