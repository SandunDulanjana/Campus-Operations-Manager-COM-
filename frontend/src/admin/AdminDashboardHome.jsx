import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ActivityIcon,
  BoxesIcon,
  CheckCircleIcon,
  ClockIcon,
  TicketIcon,
  UsersIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAllBookings } from '@/api/bookingApi'
import { fetchAllTickets } from '@/api/ticketApi'
import { fetchAllUsers } from '@/api/adminApi'
import { fetchResources } from '@/api/resourceApi'

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
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

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
        <Card className="xl:col-span-2">
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

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and metrics.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Status</span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Sync</span>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default AdminDashboardHome
