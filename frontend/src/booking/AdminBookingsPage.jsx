import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  AlertCircleIcon,
  CalendarIcon,
  CheckIcon,
  Clock3Icon,
  UploadIcon,
  XIcon,
} from 'lucide-react'
import {
  fetchAllBookings,
  fetchApprovedWeeklyBookings,
  fetchBookingDetails,
  updateBookingStatus,
} from '../api/bookingApi'
import { fetchResources } from '../api/resourceApi'
import { fetchWeeklyTimetable, uploadTimetable } from '../api/timetableApi'
import { useAuth } from '../context/useAuth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

const SLOT_START_HOUR = 6
const SLOT_END_HOUR = 22

function getBookingBadge(status) {
  if (status === 'APPROVED') return 'secondary'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'destructive'
  return 'outline'
}

function getErrorMessage(error, fallbackMessage) {
  const status = error?.response?.status
  if (status === 401) return 'Session expired or missing. Please log in again.'
  if (status === 403) return 'You do not have permission to view admin bookings.'
  return error?.response?.data?.error || fallbackMessage
}

function getWeekStart(date) {
  const value = new Date(date)
  const day = value.getDay()
  const diff = value.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(value.setDate(diff)).toISOString().slice(0, 10)
}

function toDateKey(dateValue) {
  const year = dateValue.getFullYear()
  const month = String(dateValue.getMonth() + 1).padStart(2, '0')
  const day = String(dateValue.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(timeStr) {
  return timeStr ? timeStr.slice(0, 5) : ''
}

function formatHourLabel(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12
  return `${normalizedHour}:00 ${suffix}`
}

function toMinutes(timeStr) {
  const [hours, minutes] = formatTime(timeStr).split(':').map(Number)
  return hours * 60 + minutes
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '-'
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
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
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTimetableModal, setShowTimetableModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [weeklyBookings, setWeeklyBookings] = useState([])
  const [timetableWeek, setTimetableWeek] = useState(() => getWeekStart(new Date()))

  useEffect(() => {
    void loadResources()
  }, [])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      void loadBookings()
    }
  }, [user?.role])

  useEffect(() => {
    if (showTimetableModal) {
      void loadWeeklyBookings()
    }
  }, [showTimetableModal, timetableWeek])

  const resourceTypes = useMemo(
    () => [...new Set(resources.map((resource) => resource.type))].sort(),
    [resources],
  )

  const bookingStats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === 'PENDING').length,
      approved: bookings.filter((booking) => booking.status === 'APPROVED').length,
      rejected: bookings.filter((booking) => booking.status === 'REJECTED').length,
    }),
    [bookings],
  )

  const weekDates = useMemo(() => {
    const start = new Date(timetableWeek)
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
  }, [timetableWeek])

  const hourSlots = useMemo(
    () => Array.from({ length: SLOT_END_HOUR - SLOT_START_HOUR }, (_, index) => SLOT_START_HOUR + index),
    [],
  )

  const weekEnd = useMemo(() => {
    const end = new Date(timetableWeek)
    end.setDate(end.getDate() + 6)
    return end
  }, [timetableWeek])

  async function loadResources() {
    try {
      setResources(await fetchResources())
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load resources'))
    }
  }

  async function loadBookings(activeFilters = filters) {
    setLoading(true)
    setErrorMessage('')
    try {
      const response = await fetchAllBookings(
        {
          resourceType: activeFilters.resourceType || undefined,
          status: activeFilters.status || undefined,
        },
        user,
      )

      const filtered = response.filter((booking) => {
        if (activeFilters.selectedDate) return booking.bookingDate === activeFilters.selectedDate
        if (activeFilters.selectedMonth) return booking.bookingDate.startsWith(activeFilters.selectedMonth)
        return true
      })

      setBookings(filtered)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load admin bookings'))
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
    await loadBookings(filters)
  }

  async function resetFilters() {
    const clearedFilters = { ...DEFAULT_FILTERS }
    setFilters(clearedFilters)
    await loadBookings(clearedFilters)
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
      setErrorMessage(getErrorMessage(error, 'Failed to approve booking'))
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
      setErrorMessage(getErrorMessage(error, 'Failed to reject booking'))
      setLoading(false)
    }
  }

  async function viewBookingDetails(bookingId) {
    setDetailsLoading(true)
    setErrorMessage('')
    try {
      setSelectedBookingDetails(await fetchBookingDetails(bookingId))
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load booking details'))
    } finally {
      setDetailsLoading(false)
    }
  }

  async function handleUpload() {
    if (!uploadFile) {
      setErrorMessage('Please select a file')
      return
    }

    setUploading(true)
    setErrorMessage('')
    try {
      const result = await uploadTimetable(uploadFile, user)
      setUploadResult(result)
      setSuccessMessage('Timetable uploaded successfully')
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to upload timetable'))
    } finally {
      setUploading(false)
    }
  }

  async function loadWeeklyBookings() {
    setErrorMessage('')
    try {
      const [approvedBookings, timetableSlots] = await Promise.all([
        fetchApprovedWeeklyBookings(timetableWeek, user),
        fetchWeeklyTimetable(timetableWeek, user),
      ])

      const normalizedTimetableSlots = timetableSlots.map((slot) => ({
        id: `timetable-${slot.id}`,
        resourceName: slot.resourceName,
        bookingDate: slot.slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }))

      setWeeklyBookings([...approvedBookings, ...normalizedTimetableSlots])
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load booking timeslots'))
    }
  }

  function closeUploadModal() {
    setShowUploadModal(false)
    setUploadResult(null)
    setUploadFile(null)
  }

  function getBookingsForSlot(dateValue, hour) {
    const dayKey = toDateKey(dateValue)
    const slotStart = hour * 60
    const slotEnd = (hour + 1) * 60

    return weeklyBookings
      .filter((booking) => {
        if (booking.bookingDate !== dayKey) return false
        return toMinutes(booking.startTime) < slotEnd && toMinutes(booking.endTime) > slotStart
      })
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total bookings', value: bookingStats.total, icon: CalendarIcon },
          { label: 'Pending', value: bookingStats.pending, icon: Clock3Icon },
          { label: 'Approved', value: bookingStats.approved, icon: CheckIcon },
          { label: 'Rejected', value: bookingStats.rejected, icon: XIcon },
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Booking Queue</CardTitle>
              <CardDescription>Filter requests. Approve, reject, inspect history, or manage timetables.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setShowTimetableModal(true)}>
                <CalendarIcon data-icon="inline-start" />
                View Timeslots
              </Button>
              <Button onClick={() => setShowUploadModal(true)}>
                <UploadIcon data-icon="inline-start" />
                Upload Timetable
              </Button>
            </div>
          </div>
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
              <Input id="booking-date" type="date" value={filters.selectedDate} onChange={(event) => updateFilter('selectedDate', event.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="booking-month">Month</label>
              <Input id="booking-month" type="month" value={filters.selectedMonth} onChange={(event) => updateFilter('selectedMonth', event.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Resource Type</label>
              <Select value={filters.resourceType || '__all__'} onValueChange={(value) => updateFilter('resourceType', value === '__all__' ? '' : value)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
            <div className="flex items-end gap-2">
              <Button className="flex-1" type="submit" disabled={loading}>{loading ? 'Loading...' : 'Apply'}</Button>
              <Button variant="outline" type="button" disabled={loading} onClick={() => { void resetFilters() }}>Reset</Button>
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
                    <TableCell className="font-medium">{booking.userName || booking.userId}</TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{booking.resourceName}</span>
                        <span className="text-sm text-muted-foreground">{booking.resourceType}</span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.bookingDate}</TableCell>
                    <TableCell>{formatTimeRange(booking.startTime, booking.endTime)}</TableCell>
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
                      <div className="flex justify-end gap-2">
                        {booking.status === 'PENDING' ? (
                          <>
                            <Button size="sm" onClick={() => approveBooking(booking.id)} disabled={loading}>
                              <CheckIcon data-icon="inline-start" />
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => rejectBooking(booking.id)} disabled={loading}>
                              <XIcon data-icon="inline-start" />
                              Reject
                            </Button>
                          </>
                        ) : null}
                        <Button variant="outline" size="sm" onClick={() => viewBookingDetails(booking.id)} disabled={detailsLoading}>
                          View Details
                        </Button>
                      </div>
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

      <Dialog open={Boolean(selectedBookingDetails)} onOpenChange={(open) => { if (!open) setSelectedBookingDetails(null) }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Booking Request Details</DialogTitle>
            <DialogDescription>Full request details and resubmission history.</DialogDescription>
          </DialogHeader>
          {selectedBookingDetails ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Requester</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm">
                    <Detail label="User Name" value={selectedBookingDetails.booking.userName || 'Unknown User'} />
                    <Detail label="User ID" value={selectedBookingDetails.booking.userId} />
                    <Detail label="Status" value={<Badge variant={getBookingBadge(selectedBookingDetails.booking.status)}>{selectedBookingDetails.booking.status}</Badge>} />
                    <Detail label="Review Note" value={selectedBookingDetails.booking.reviewReason || '-'} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Booking</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm">
                    <Detail label="Resource" value={selectedBookingDetails.booking.resourceName} />
                    <Detail label="Date" value={selectedBookingDetails.booking.bookingDate} />
                    <Detail label="Time" value={formatTimeRange(selectedBookingDetails.booking.startTime, selectedBookingDetails.booking.endTime)} />
                    <Detail label="Purpose" value={selectedBookingDetails.booking.purpose} />
                    <Detail label="Expected Attendees" value={selectedBookingDetails.booking.expectedAttendees ?? '-'} />
                    <Detail label="Equipment Type" value={selectedBookingDetails.booking.equipmentType || '-'} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Request History</CardTitle>
                  <CardDescription>Older booking versions created by resubmission.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {selectedBookingDetails.history.length > 0 ? selectedBookingDetails.history.map((entry) => (
                    <div key={entry.id} className="rounded-xl border bg-muted/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{entry.userName || 'Unknown User'}</span>
                        <span className="text-sm text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                        <Detail label="Status" value={entry.status} />
                        <Detail label="Date" value={entry.bookingDate || '-'} />
                        <Detail label="Time" value={formatTimeRange(entry.startTime, entry.endTime)} />
                        <Detail label="Purpose" value={entry.purpose || '-'} />
                        <Detail label="Attendees" value={entry.expectedAttendees ?? '-'} />
                        <Detail label="Reason" value={entry.reviewReason || 'No review reason provided.'} />
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No review history available yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadModal} onOpenChange={(open) => { if (!open) closeUploadModal(); else setShowUploadModal(true) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Timetable</DialogTitle>
            <DialogDescription>Upload CSV, XLS, or XLSX timetable data.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input type="file" accept=".csv,.xls,.xlsx" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} />
            {uploadResult ? (
              <Alert>
                <CheckIcon />
                <AlertTitle>Upload complete</AlertTitle>
                <AlertDescription>Uploaded: {uploadResult.inserted} rows. Skipped: {uploadResult.skipped}.</AlertDescription>
              </Alert>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeUploadModal}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTimetableModal} onOpenChange={setShowTimetableModal}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Booking Timeslots</DialogTitle>
            <DialogDescription>{timetableWeek} - {toDateKey(weekEnd)}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setTimetableWeek(getWeekStart(new Date(new Date(timetableWeek).getTime() - 7 * 24 * 60 * 60 * 1000)))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setTimetableWeek(getWeekStart(new Date(new Date(timetableWeek).getTime() + 7 * 24 * 60 * 60 * 1000)))}
            >
              Next
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border">
            <div className="grid min-w-[900px]" style={{ gridTemplateColumns: '92px repeat(7, minmax(110px, 1fr))' }}>
              <div className="border-b border-r bg-muted/50 p-3 text-sm font-medium">Time</div>
              {weekDates.map((dateValue) => (
                <div key={toDateKey(dateValue)} className="border-b border-r bg-muted/50 p-3 text-sm">
                  <div className="font-medium">{dateValue.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div className="text-muted-foreground">{toDateKey(dateValue)}</div>
                </div>
              ))}
              {hourSlots.map((hour) => (
                <Fragment key={`row-${hour}`}>
                  <div className="border-b border-r p-3 text-sm text-muted-foreground">{formatHourLabel(hour)}</div>
                  {weekDates.map((dateValue) => {
                    const bookingsInSlot = getBookingsForSlot(dateValue, hour)
                    return (
                      <div key={`${toDateKey(dateValue)}-${hour}`} className="min-h-20 border-b border-r p-2">
                        <div className="flex flex-col gap-1">
                          {bookingsInSlot.map((booking) => (
                            <div key={booking.id} className="rounded-md bg-muted px-2 py-1 text-xs">
                              <div className="font-medium">{booking.resourceName}</div>
                              <div className="text-muted-foreground">{formatTime(booking.startTime)}-{formatTime(booking.endTime)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </Fragment>
              ))}
            </div>
          </div>
          {weeklyBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved bookings or lecture reservations found for this week.</p>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

export default AdminBookingsPage
