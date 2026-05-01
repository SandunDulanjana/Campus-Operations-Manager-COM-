import { useEffect, useMemo, useState } from 'react'
import { AlertCircleIcon, RefreshCwIcon, TicketIcon, ActivityIcon, AlertTriangleIcon } from 'lucide-react'
import { fetchAssignedTickets } from '../api/ticketApi'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'

const DATE_RANGES = [
  { value: 'ALL', label: 'All time' },
  { value: '7D', label: 'Last 7 days' },
  { value: '30D', label: 'Last 30 days' },
  { value: '90D', label: 'Last 90 days' },
]

function TechnicianTicketAnalysis() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('ALL')

  useEffect(() => {
    void loadTickets()
  }, [])

  async function loadTickets() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAssignedTickets()
      setTickets(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = useMemo(() => {
    if (dateRange === 'ALL') return tickets

    const cutoff = new Date()
    if (dateRange === '7D') cutoff.setDate(cutoff.getDate() - 7)
    if (dateRange === '30D') cutoff.setDate(cutoff.getDate() - 30)
    if (dateRange === '90D') cutoff.setDate(cutoff.getDate() - 90)

    return tickets.filter((ticket) => new Date(ticket.createdAt) >= cutoff)
  }, [dateRange, tickets])

  const total = filteredTickets.length
  const slaBreached = filteredTickets.filter((ticket) => ticket.slaBreached).length
  const slaOk = total - slaBreached

  const statusData = useMemo(
    () => [
      countTickets(filteredTickets, 'status', 'IN_PROGRESS', 'In progress', '#3b82f6'),
      countTickets(filteredTickets, 'status', 'RESOLVED', 'Resolved', '#10b981'),
      countTickets(filteredTickets, 'status', 'CLOSED', 'Closed', '#64748b'),
      countTickets(filteredTickets, 'status', 'REJECTED', 'Rejected', '#f43f5e'),
      countTickets(filteredTickets, 'status', 'OPEN', 'Open', '#f59e0b'),
    ],
    [filteredTickets]
  )

  const priorityData = useMemo(
    () => [
      countTickets(filteredTickets, 'priority', 'LOW', 'Low', '#10b981'),
      countTickets(filteredTickets, 'priority', 'MEDIUM', 'Medium', '#f59e0b'),
      countTickets(filteredTickets, 'priority', 'HIGH', 'High', '#f97316'),
      countTickets(filteredTickets, 'priority', 'CRITICAL', 'Critical', '#e11d48'),
    ],
    [filteredTickets]
  )

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ticket Analysis</h2>
          <p className="text-muted-foreground mt-1">
            Monitor assigned ticket distribution, priority pressure, and SLA health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger aria-label="Date range" className="w-40 bg-white shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DATE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={loadTickets} disabled={loading} className="shadow-sm">
            <RefreshCwIcon className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <AnalysisSkeleton />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard 
              title="Filtered tickets" 
              value={total} 
              detail={selectedRangeLabel(dateRange)} 
              icon={TicketIcon}
              colorTheme={{ main: '#3b82f6', bg: '#eff6ff' }}
            />
            <MetricCard
              title="Active work"
              value={statusData.find((item) => item.key === 'IN_PROGRESS')?.count || 0}
              detail="Tickets still in progress"
              icon={ActivityIcon}
              colorTheme={{ main: '#f59e0b', bg: '#fffbeb' }}
            />
            <MetricCard
              title="Critical priority"
              value={priorityData.find((item) => item.key === 'CRITICAL')?.count || 0}
              detail="Needs fastest response"
              icon={AlertTriangleIcon}
              colorTheme={{ main: '#ef4444', bg: '#fef2f2' }}
            />
            <MetricCard 
              title="SLA breached" 
              value={slaBreached} 
              detail={`${slaOk} within SLA`} 
              icon={AlertCircleIcon}
              colorTheme={{ main: '#8b5cf6', bg: '#f5f3ff' }}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DistributionCard
              title="Status distribution"
              description="Current ticket states in selected date range."
              items={statusData}
              total={total}
            />
            <DistributionCard
              title="Priority distribution"
              description="Priority mix for assigned technician workload."
              items={priorityData}
              total={total}
            />
          </div>
        </>
      )}
    </section>
  )
}

function countTickets(tickets, field, key, label, color) {
  return {
    key,
    label,
    color,
    count: tickets.filter((ticket) => ticket[field] === key).length,
  }
}

function selectedRangeLabel(value) {
  return DATE_RANGES.find((range) => range.value === value)?.label || 'Selected range'
}

function MetricCard({ title, value, detail, icon: Icon, colorTheme }) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md border-l-4" style={{ borderLeftColor: colorTheme?.main || '#cbd5e1' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="font-medium text-muted-foreground">{title}</CardDescription>
        {Icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: colorTheme?.bg || '#f1f5f9', color: colorTheme?.main || '#64748b' }}>
            <Icon className="size-5" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{detail}</p>
      </CardContent>
    </Card>
  )
}

function DistributionCard({ title, description, items, total }) {
  const segments = getChartSegments(items, total)

  return (
    <Card className="overflow-hidden border-t-4 border-t-slate-200 hover:shadow-md transition-all duration-300">
      <CardHeader className="bg-slate-50/50 pb-4 border-b">
        <CardTitle className="text-lg font-semibold text-slate-800">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        {total === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-slate-50">
            No tickets in this range.
          </div>
        ) : (
          <DonutDistribution segments={segments} total={total} label="Tickets" />
        )}
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
      color: item.color || `hsl(var(--chart-${(index % 5) + 1}))`,
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

function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Card key={item}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <Card key={item}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TechnicianTicketAnalysis
