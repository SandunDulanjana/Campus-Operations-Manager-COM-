import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import {
  fetchAssignedTickets,
  formatTicketLabel,
  formatTicketDate,
  getStatusBadgeClass,
  getPriorityBadgeClass,
} from '../api/ticketApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ActivityIcon, AlertCircleIcon, CheckCircle2Icon, ClipboardListIcon, SearchIcon, TicketIcon } from 'lucide-react'
import ActionButton from '../components/ui/ActionButton'

const STATUS_FILTERS = [
  { value: 'ALL',         label: 'All Tickets' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED',    label: 'Recently Resolved' },
  { value: 'CLOSED',      label: 'Archived' },
  { value: 'REJECTED',    label: 'Cancelled' },
]

function TechnicianDashboardHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tickets, setTickets]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [errorMessage, setError]    = useState('')
  const [activeFilter, setFilter]   = useState('ALL')

  useEffect(() => {
    void loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTickets() {
    setLoading(true)
    try {
      const data = await fetchAssignedTickets()
      setTickets(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assigned tickets')
    } finally {
      setLoading(false)
    }
  }

  const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length
  const resolved   = tickets.filter((t) => t.status === 'RESOLVED').length
  const breached   = tickets.filter((t) => t.slaBreached).length
  const total      = tickets.length

  const filteredTickets = activeFilter === 'ALL'
    ? tickets
    : tickets.filter((t) => t.status === activeFilter)

  const stats = [
    { label: 'Assigned to You', value: total, icon: ClipboardListIcon, detail: 'Total ticket count', color: 'text-primary' },
    { label: 'Work in Progress', value: inProgress, icon: ActivityIcon, detail: 'Active assignments', color: 'text-blue-600' },
    { label: 'Resolved Tickets', value: resolved, icon: CheckCircle2Icon, detail: 'Completed works', color: 'text-emerald-600' },
    { label: 'SLA Breached', value: breached, icon: AlertCircleIcon, detail: 'Overdue items', color: breached > 0 ? 'text-destructive' : 'text-muted-foreground' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Header */}
      <Card className="border-border bg-white shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-2 bg-secondary text-secondary-foreground">
                Technician Workspace
              </Badge>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Technician'}
              </CardTitle>
              <CardDescription className="mt-1">
                You have {inProgress} tickets currently active. Review your schedule and update progress below.
              </CardDescription>
            </div>
            <div className="hidden sm:flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TicketIcon className="size-6" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border bg-white shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{stat.label}</p>
                    <p className={`text-2xl font-bold tracking-tight mt-1 ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">{stat.detail}</p>
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary/50 text-primary">
                    <Icon className="size-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Area */}
      <Card className="border-border bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-bold">Assigned Tickets</CardTitle>
            <CardDescription className="text-xs">Manage and update your active service requests</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:flex items-center">
              <SearchIcon className="absolute left-2.5 size-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Find ticket..." 
                className="h-8 w-48 rounded-md border border-input bg-background pl-8 text-[11px] focus-visible:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={activeFilter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={`h-7 px-3 text-[11px] font-semibold rounded-full transition-all ${
                  activeFilter === f.value 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircleIcon className="size-4" />
              {errorMessage}
            </div>
          )}

          <div className="rounded-xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow>
                  <TableHead className="w-[80px] text-[10px] font-bold uppercase tracking-wider">Ticket ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Summary & Category</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Priority</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Location</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Reported</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Retrieving assignments...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                      No tickets found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="group hover:bg-muted/20 transition-colors">
                      <TableCell className="font-mono text-[11px] font-bold text-muted-foreground">
                        #{ticket.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold leading-tight group-hover:text-primary transition-colors">
                            {ticket.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {formatTicketLabel(ticket.category)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusBadgeClass(ticket.status)}>
                          {formatTicketLabel(ticket.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getPriorityBadgeClass(ticket.priority)}>
                          {ticket.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <div className="size-1.5 rounded-full bg-slate-300"></div>
                          {ticket.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {formatTicketDate(ticket.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[11px] font-bold text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                        >
                          Review →
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TechnicianDashboardHome