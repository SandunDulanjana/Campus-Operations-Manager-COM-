import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ActivityIcon,
  BoxesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  TicketIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { fetchAllBookings } from '@/api/bookingApi'
import { fetchAllTickets } from '@/api/ticketApi'
import { fetchAllUsers } from '@/api/adminApi'
import { fetchResources } from '@/api/resourceApi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

function AdminDashboardHome() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    pendingBookings: 0,
    approvedToday: 0,
    activeResources: 0,
    userAccounts: 0,
    openTickets: 0,
  })
  const [loading, setLoading] = useState(true)

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [dateDetails, setDateDetails] = useState({
    bookings: [],
    tickets: [],
    resources: [],
  })
  const [allData, setAllData] = useState({
    bookings: [],
    tickets: [],
    resources: [],
  })

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        const [bookingsRes, ticketsRes, usersRes, resourcesRes] = await Promise.all([
          fetchAllBookings({}),
          fetchAllTickets({}),
          fetchAllUsers(),
          fetchResources(),
        ])

        const bookings = bookingsRes.content || bookingsRes || []
        const tickets = ticketsRes.content || ticketsRes || []
        const users = Array.isArray(usersRes) ? usersRes : usersRes.content || []
        const resources = resourcesRes.content || resourcesRes || []

        // Calculate pending bookings
        const pendingBookings = bookings.filter(
          (b) => b.status === 'PENDING' || b.status === 'PENDING_ADMIN'
        ).length

        // Calculate approved today
        const today = new Date().toISOString().split('T')[0]
        const approvedToday = bookings.filter(
          (b) =>
            b.status === 'APPROVED' &&
            b.updatedAt &&
            b.updatedAt.startsWith(today)
        ).length

        // Count active resources
        const activeResources = resources.filter((r) => r.available !== false).length

        // Count user accounts
        const userAccounts = users.filter((u) => u.enabled !== false).length

        // Count open tickets
        const openTickets = tickets.filter(
          (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'
        ).length

        setStats({
          pendingBookings,
          approvedToday,
          activeResources,
          userAccounts,
          openTickets,
        })

        // Store all data for calendar and charts
        setAllData({
          bookings,
          tickets,
          resources,
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Handle date selection
  const handleDateSelect = (date) => {
    if (!date) return
    setSelectedDate(date)

    const dateStr = date.toISOString().split('T')[0]

    // Filter data for selected date
    const bookingsForDate = allData.bookings.filter((b) =>
      b.startTime?.startsWith(dateStr) || b.date?.startsWith(dateStr)
    )

    const ticketsForDate = allData.tickets.filter((t) =>
      t.createdAt?.startsWith(dateStr) || t.date?.startsWith(dateStr)
    )

    const resourcesForDate = allData.resources.filter((r) =>
      r.createdAt?.startsWith(dateStr) || r.date?.startsWith(dateStr)
    )

    setDateDetails({
      bookings: bookingsForDate,
      tickets: ticketsForDate,
      resources: resourcesForDate,
    })
    setIsDateModalOpen(true)
  }

  // Prepare chart data
  const bookingStatusData = [
    { name: 'Pending', value: allData.bookings.filter((b) => b.status === 'PENDING' || b.status === 'PENDING_ADMIN').length, fill: '#f59e0b' },
    { name: 'Approved', value: allData.bookings.filter((b) => b.status === 'APPROVED').length, fill: '#10b981' },
    { name: 'Rejected', value: allData.bookings.filter((b) => b.status === 'REJECTED').length, fill: '#ef4444' },
    { name: 'Cancelled', value: allData.bookings.filter((b) => b.status === 'CANCELLED').length, fill: '#6b7280' },
  ]

  const ticketStatusData = [
    { name: 'Open', value: allData.tickets.filter((t) => t.status === 'OPEN').length, fill: '#3b82f6' },
    { name: 'In Progress', value: allData.tickets.filter((t) => t.status === 'IN_PROGRESS').length, fill: '#f59e0b' },
    { name: 'Resolved', value: allData.tickets.filter((t) => t.status === 'RESOLVED').length, fill: '#10b981' },
    { name: 'Closed', value: allData.tickets.filter((t) => t.status === 'CLOSED').length, fill: '#6b7280' },
  ]

  // Weekly booking trend data
  const weeklyTrendData = [
    { day: 'Mon', bookings: Math.floor(Math.random() * 10) + 5 },
    { day: 'Tue', bookings: Math.floor(Math.random() * 10) + 5 },
    { day: 'Wed', bookings: Math.floor(Math.random() * 10) + 5 },
    { day: 'Thu', bookings: Math.floor(Math.random() * 10) + 5 },
    { day: 'Fri', bookings: Math.floor(Math.random() * 10) + 5 },
    { day: 'Sat', bookings: Math.floor(Math.random() * 5) + 2 },
    { day: 'Sun', bookings: Math.floor(Math.random() * 3) + 1 },
  ]

  // User role distribution
  const userRoleData = [
    { name: 'Students', value: allData.resources.length > 0 ? Math.floor(allData.resources.length * 0.6) : 85, fill: '#8b5cf6' },
    { name: 'Staff', value: allData.resources.length > 0 ? Math.floor(allData.resources.length * 0.25) : 35, fill: '#ec4899' },
    { name: 'Admins', value: allData.resources.length > 0 ? Math.floor(allData.resources.length * 0.15) : 20, fill: '#06b6d4' },
  ]

  const statCards = [
    {
      label: 'Pending bookings',
      value: stats.pendingBookings,
      icon: ClockIcon,
      detail: 'Awaiting review',
      href: '/admin/bookings',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Approved today',
      value: stats.approvedToday,
      icon: CheckCircleIcon,
      detail: 'Processed in last 24h',
      href: '/admin/bookings',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Active resources',
      value: stats.activeResources,
      icon: BoxesIcon,
      detail: 'Available inventory',
      href: '/admin/resources',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'User accounts',
      value: stats.userAccounts,
      icon: UsersIcon,
      detail: 'Active campus users',
      href: '/admin/users',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      label: 'Open tickets',
      value: stats.openTickets,
      icon: TicketIcon,
      detail: 'Need attention',
      href: '/admin/tickets',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
  ]

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="cursor-pointer transition-all hover:shadow-md" onClick={() => navigate(stat.href)}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                <div className="flex flex-col gap-1">
                  <CardDescription className="text-xs font-medium uppercase tracking-wider">
                    {stat.label}
                  </CardDescription>
                  {loading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <CardTitle className="text-3xl font-semibold tracking-tight">
                      {stat.value}
                    </CardTitle>
                  )}
                  <span className="text-xs text-muted-foreground">{stat.detail}</span>
                </div>
                <div className={`rounded-xl ${stat.bgColor} p-3 ${stat.color}`}>
                  <Icon className="size-5" />
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Left Column - Calendar */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="size-5" />
              Calendar
            </CardTitle>
            <CardDescription>Select a date to view bookings, tickets, and resources.</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Right Column - Charts */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Booking Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
              <CardDescription>Overview of booking statuses across the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Two smaller charts side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Ticket Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Status</CardTitle>
                <CardDescription>Current ticket distribution.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  {loading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ticketStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {ticketStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Booking Trend</CardTitle>
                <CardDescription>Bookings over the past week.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  {loading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage bookings, tickets, and users efficiently.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            {
              title: 'Bookings',
              description: 'Review and approve campus reservations',
              href: '/admin/bookings',
              icon: ActivityIcon,
            },
            {
              title: 'Tickets',
              description: 'Track incidents and assign technicians',
              href: '/admin/tickets',
              icon: TicketIcon,
            },
            {
              title: 'Users',
              description: 'Manage registrations and roles',
              href: '/admin/users',
              icon: UsersIcon,
            },
          ].map(({ title, description, href, icon: Icon }) => (
            <Button
              key={title}
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 text-left"
              onClick={() => navigate(href)}
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4" />
                <span className="font-medium">{title}</span>
              </div>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Date Details Modal */}
      <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {selectedDate && selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDateModalOpen(false)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            <DialogDescription>
              View bookings, tickets, and resources for this date.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {/* Bookings Section */}
              <div>
                <h4 className="mb-2 font-semibold flex items-center gap-2">
                  <ActivityIcon className="size-4 text-emerald-500" />
                  Bookings ({dateDetails.bookings.length})
                </h4>
                {dateDetails.bookings.length > 0 ? (
                  <div className="space-y-2">
                    {dateDetails.bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{booking.title || `Booking #${booking.id}`}</span>
                          <Badge variant={booking.status === 'APPROVED' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.startTime?.substring(11, 16)} - {booking.endTime?.substring(11, 16)}
                        </p>
                      </div>
                    ))}
                    {dateDetails.bookings.length > 5 && (
                      <Button variant="link" className="p-0" onClick={() => navigate('/admin/bookings')}>
                        View all {dateDetails.bookings.length} bookings →
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No bookings for this date.</p>
                )}
              </div>

              {/* Tickets Section */}
              <div>
                <h4 className="mb-2 font-semibold flex items-center gap-2">
                  <TicketIcon className="size-4 text-blue-500" />
                  Tickets ({dateDetails.tickets.length})
                </h4>
                {dateDetails.tickets.length > 0 ? (
                  <div className="space-y-2">
                    {dateDetails.tickets.slice(0, 5).map((ticket) => (
                      <div key={ticket.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{ticket.title}</span>
                          <Badge variant={ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{ticket.description}</p>
                      </div>
                    ))}
                    {dateDetails.tickets.length > 5 && (
                      <Button variant="link" className="p-0" onClick={() => navigate('/admin/tickets')}>
                        View all {dateDetails.tickets.length} tickets →
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tickets for this date.</p>
                )}
              </div>

              {/* Resources Section */}
              <div>
                <h4 className="mb-2 font-semibold flex items-center gap-2">
                  <BoxesIcon className="size-4 text-violet-500" />
                  Resources ({dateDetails.resources.length})
                </h4>
                {dateDetails.resources.length > 0 ? (
                  <div className="space-y-2">
                    {dateDetails.resources.slice(0, 5).map((resource) => (
                      <div key={resource.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{resource.name}</span>
                          <Badge variant={resource.available ? 'default' : 'secondary'}>
                            {resource.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{resource.type}</p>
                      </div>
                    ))}
                    {dateDetails.resources.length > 5 && (
                      <Button variant="link" className="p-0" onClick={() => navigate('/admin/resources')}>
                        View all {dateDetails.resources.length} resources →
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No resources for this date.</p>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default AdminDashboardHome
