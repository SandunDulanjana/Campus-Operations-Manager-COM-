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
    <section className="flex flex-col gap-4">
      {/* Hero Row */}
      <div className="grid gap-3 xl:grid-cols-[1fr_300px]">
        <Card className="border-border bg-white p-6 shadow-sm">
          <Badge variant="secondary" className="mb-3 bg-secondary text-secondary-foreground hover:bg-secondary/80">
            Overview
          </Badge>
          <CardTitle className="mb-2 text-2xl font-bold tracking-tight text-foreground">Operations at glance</CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            Clean control surface for bookings, tickets, resources, notifications, user approvals.
          </CardDescription>
        </Card>

        <Card className="border-border bg-white p-6 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/60">SYSTEM HEALTH</p>
          <div className="mt-2 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground">Stable</p>
              <p className="text-[11px] text-muted-foreground">No critical admin blockers right now.</p>
              <Badge className="w-fit bg-emerald-50 text-emerald-700 text-[10px] border-none shadow-none">Monitoring active</Badge>
            </div>
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
              <ActivityIcon className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground/60">{stat.detail}</p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-4" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Bottom Row */}
      <div className="grid gap-3 xl:grid-cols-[1fr_300px]">
        <Card className="border-border bg-white p-6 shadow-sm">
          <CardTitle className="text-sm font-semibold text-foreground">Admin workflow</CardTitle>
          <CardDescription className="mb-4 text-[11px] text-muted-foreground">
            Use same layout language across modules. No old white slabs. No teal drift.
          </CardDescription>
          <div className="grid gap-2 md:grid-cols-3">
            {[
              ['Bookings', 'Approve or reject campus reservations'],
              ['Tickets', 'Track incidents and technician progress'],
              ['Users', 'Control registration and role assignment'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/30">
                <p className="mb-1 text-[12px] font-semibold text-foreground">{title}</p>
                <p className="text-[10px] leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border bg-white p-6 shadow-sm">
          <CardTitle className="text-sm font-semibold text-foreground">Design target</CardTitle>
          <CardDescription className="mb-4 text-[11px] text-muted-foreground">
            Light shell. Soft panels. Tight spacing. Sans typography.
          </CardDescription>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['Monochrome', 'Shadcn composition', 'Shared tokens'].map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] font-medium border-border/60 bg-secondary/30 text-secondary-foreground">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex h-5 w-full overflow-hidden rounded-md border border-border/40">
            <div className="flex-[6] bg-muted/30 flex items-center justify-center text-[9px] font-medium text-muted-foreground">60%</div>
            <div className="flex-[3] bg-secondary flex items-center justify-center text-[9px] font-medium text-secondary-foreground">30%</div>
            <div className="flex-[1] bg-primary"></div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default AdminDashboardHome
