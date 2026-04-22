import { ActivityIcon, BellIcon, BoxesIcon, TicketIcon, UsersIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function AdminDashboardHome() {
  const stats = [
    { label: 'Pending bookings', value: '12', icon: ActivityIcon, detail: 'Awaiting review' },
    { label: 'Approved today', value: '8', icon: BellIcon, detail: 'Processed in last 24h' },
    { label: 'Active resources', value: '24', icon: BoxesIcon, detail: 'Available inventory' },
    { label: 'User accounts', value: '156', icon: UsersIcon, detail: 'Active campus users' },
  ]

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="bg-card/90">
          <CardHeader>
            <Badge variant="outline">Overview</Badge>
            <CardTitle className="text-4xl font-semibold tracking-tight">Operations at glance</CardTitle>
            <CardDescription className="max-w-2xl text-base">
              Clean control surface for bookings, tickets, resources, notifications, user approvals.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-card/90">
          <CardHeader>
            <CardDescription>System Health</CardDescription>
            <CardTitle className="text-4xl font-semibold tracking-tight">Stable</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">No critical admin blockers right now.</span>
              <Badge variant="secondary">Monitoring active</Badge>
            </div>
            <div className="rounded-xl border bg-muted p-3 text-muted-foreground">
              <TicketIcon />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-3xl font-semibold tracking-tight">{stat.value}</CardTitle>
                  <span className="text-sm text-muted-foreground">{stat.detail}</span>
                </div>
                <div className="rounded-lg border bg-muted p-2 text-muted-foreground">
                  <Icon />
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Admin workflow</CardTitle>
            <CardDescription>Use same layout language across modules. No old white slabs. No teal drift.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              ['Bookings', 'Approve or reject campus reservations'],
              ['Tickets', 'Track incidents and technician progress'],
              ['Users', 'Control registration and role assignment'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-1 font-medium">{title}</p>
                <span className="text-sm text-muted-foreground">{description}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design target</CardTitle>
            <CardDescription>Dark shell. Neutral cards. Tight spacing. Sans typography.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Badge variant="outline">Monochrome</Badge>
            <Badge variant="outline">Shadcn composition</Badge>
            <Badge variant="outline">Shared tokens</Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default AdminDashboardHome
