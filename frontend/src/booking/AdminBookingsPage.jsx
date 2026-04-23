import { useEffect, useMemo, useState } from 'react'
import { AlertCircleIcon, CalendarIcon, CheckIcon, Clock3Icon, XIcon } from 'lucide-react'
import { fetchAllBookings, updateBookingStatus } from '../api/bookingApi'
import { fetchResources } from '../api/resourceApi'
import { useAuth } from '../context/useAuth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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

const DEFAULT_FILTERS = {
  selectedDate: '',
  selectedMonth: '',
  resourceType: '',
  status: '',
}

function getBookingBadge(status) {
  if (status === 'APPROVED') return 'secondary'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'destructive'
  return 'outline'
}

function AdminBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [rejectReasons, setRejectReasons] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    void loadResources()
  }, [])

    useEffect(() => {
      if (user.role === 'ADMIN') {
        void loadBookings()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.role])

  const resourceTypes = useMemo(
    () => [...new Set(resources.map((resource) => resource.type))].sort(),
    [resources],
  )

  async function loadResources() {
    try {
      const data = await fetchResources()
      setResources(data)
    } catch {
      setErrorMessage('Failed to load resources')
    }
  }

  async function loadBookings() {
    setLoading(true)
    setErrorMessage('')
    try {
      const response = await fetchAllBookings(
        {
          resourceType: filters.resourceType || undefined,
          status: filters.status || undefined,
        },
        user,
      )

      const filtered = response.filter((booking) => {
        if (filters.selectedDate) {
          return booking.bookingDate === filters.selectedDate
        }

        if (filters.selectedMonth) {
          return booking.bookingDate.startsWith(filters.selectedMonth)
        }

        return true
      })

      setBookings(filtered)
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to load admin bookings')
    } finally {
      setLoading(false)
    }
  }

  function updateFilter(field, value) {
    setFilters((current) => ({
      ...current,
      ...(field === 'selectedDate' && value ? { selectedMonth: '' } : {}),
      ...(field === 'selectedMonth' && value ? { selectedDate: '' } : {}),
      [field]: value,
    }))
  }

  async function applyFilters(event) {
    event.preventDefault()
    await loadBookings()
  }

  async function approveBooking(bookingId) {
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await updateBookingStatus(bookingId, { status: 'APPROVED', reviewReason: 'Approved by admin' }, user)
      setSuccessMessage('Booking approved')
      await loadBookings()
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to approve booking')
      setLoading(false)
    }
  }

  async function rejectBooking(bookingId) {
    const reason = rejectReasons[bookingId]?.trim()
    if (!reason) {
      setErrorMessage('Provide a rejection reason before rejecting')
      return
    }

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await updateBookingStatus(bookingId, { status: 'REJECTED', reviewReason: reason }, user)
      setSuccessMessage('Booking rejected')
      setRejectReasons((current) => ({ ...current, [bookingId]: '' }))
      await loadBookings()
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to reject booking')
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total bookings', value: bookings.length, icon: CalendarIcon },
          { label: 'Pending', value: bookings.filter((b) => b.status === 'PENDING').length, icon: Clock3Icon },
          { label: 'Approved', value: bookings.filter((b) => b.status === 'APPROVED').length, icon: CheckIcon },
          { label: 'Rejected', value: bookings.filter((b) => b.status === 'REJECTED').length, icon: XIcon },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-3xl font-semibold tracking-tight">{stat.value}</CardTitle>
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
          <CardTitle>Booking Queue</CardTitle>
          <CardDescription>Filter requests. Approve or reject with reason.</CardDescription>
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
              <CheckIcon />
              <AlertTitle>Updated</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          <form className="grid gap-4 rounded-xl border bg-muted/30 p-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={applyFilters}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="booking-date">Date</label>
              <Input id="booking-date" type="date" value={filters.selectedDate} onChange={(e) => updateFilter('selectedDate', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="booking-month">Month</label>
              <Input id="booking-month" type="month" value={filters.selectedMonth} onChange={(e) => updateFilter('selectedMonth', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Resource Type</label>
              <Select value={filters.resourceType || '__all__'} onValueChange={(value) => updateFilter('resourceType', value === '__all__' ? '' : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="__all__">All</SelectItem>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status || '__all__'} onValueChange={(value) => updateFilter('status', value === '__all__' ? '' : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="__all__">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Loading…' : 'Apply'}
              </Button>
            </div>
          </form>

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reject Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.userId}</TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{booking.resourceName}</span>
                        <span className="text-sm text-muted-foreground">{booking.resourceType}</span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.bookingDate}</TableCell>
                    <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                    <TableCell><Badge variant={getBookingBadge(booking.status)}>{booking.status}</Badge></TableCell>
                    <TableCell className="whitespace-normal">
                      {booking.status === 'PENDING' ? (
                        <Input
                          placeholder="Reason if rejected"
                          value={rejectReasons[booking.id] || ''}
                          onChange={(event) =>
                            setRejectReasons((current) => ({
                              ...current,
                              [booking.id]: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        <span className="text-muted-foreground">{booking.reviewReason || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {booking.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => approveBooking(booking.id)} disabled={loading}>
                            <CheckIcon data-icon="inline-start" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => rejectBooking(booking.id)} disabled={loading}>
                            <XIcon data-icon="inline-start" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="text-right text-muted-foreground">-</div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!bookings.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default AdminBookingsPage
