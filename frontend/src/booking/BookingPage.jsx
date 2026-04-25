import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  CalendarIcon,
  Clock3Icon,
  FileUpIcon,
  HistoryIcon,
  PlusIcon,
  RefreshCwIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import {
  createBooking,
  deleteBooking,
  fetchApprovedWeeklyBookings,
  fetchMyBookings,
  resubmitBooking,
  updateBookingStatus,
} from '../api/bookingApi'
import { fetchResources } from '../api/resourceApi'
import { fetchWeeklyTimetable, uploadTimetable } from '../api/timetableApi'
import { useAuth } from '../context/useAuth'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Textarea } from '../components/ui/textarea'

const RESOURCE_TYPE_WITH_ATTENDEES = new Set(['MEETING_ROOM', 'LECTURE_HALL', 'LAB'])
const EMPTY_SELECT_VALUE = '__none__'

const DEFAULT_FORM = {
  resourceId: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: '',
  equipmentType: '',
}

const SLOT_START_HOUR = 6
const SLOT_END_HOUR = 22

function getErrorMessage(error, fallbackMessage) {
  const status = error?.response?.status

  if (status === 401) {
    return 'Session expired or missing. Please log in again.'
  }

  if (status === 403) {
    return 'You do not have permission to access bookings.'
  }

  return error?.response?.data?.error || fallbackMessage
}

function formatLabel(value) {
  return value ? value.replaceAll('_', ' ') : '-'
}

function getBookingBadgeVariant(status) {
  if (status === 'APPROVED') return 'secondary'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'destructive'
  return 'outline'
}

function BookingPage() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTimetableModal, setShowTimetableModal] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [weeklyBookings, setWeeklyBookings] = useState([])
  const [timetableWeek, setTimetableWeek] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(today.setDate(diff)).toISOString().slice(0, 10)
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingBookingId, setEditingBookingId] = useState(null)

  useEffect(() => {
    void loadResources()
  }, [])

  useEffect(() => {
    void loadMyBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.role])

  useEffect(() => {
    if (showTimetableModal) {
      void loadWeeklyBookings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTimetableModal, timetableWeek])

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === Number(formData.resourceId)) ?? null,
    [resources, formData.resourceId],
  )

  const showExpectedAttendees =
    selectedResource && RESOURCE_TYPE_WITH_ATTENDEES.has(selectedResource.type)

  const bookingStats = useMemo(() => {
    const pending = myBookings.filter((booking) => booking.status === 'PENDING').length
    const approved = myBookings.filter((booking) => booking.status === 'APPROVED').length
    const rejected = myBookings.filter((booking) => booking.status === 'REJECTED').length

    return {
      total: myBookings.length,
      pending,
      approved,
      rejected,
    }
  }, [myBookings])

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
      const data = await fetchResources()
      setResources(data.filter((resource) => resource.status === 'ACTIVE'))
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load resources'))
    }
  }

  async function loadMyBookings() {
    try {
      const data = await fetchMyBookings(user)
      setMyBookings(data)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load bookings'))
    }
  }

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function clearMessages() {
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function submitBooking(event) {
    event.preventDefault()
    clearMessages()

    if (!selectedResource) {
      setErrorMessage('Please select a resource')
      return
    }

    if (formData.startTime >= formData.endTime) {
      setErrorMessage('Start time must be before end time')
      return
    }

    if (showExpectedAttendees && (!formData.expectedAttendees || Number(formData.expectedAttendees) <= 0)) {
      setErrorMessage('Expected attendees must be a positive number')
      return
    }

    if (!showExpectedAttendees && !formData.equipmentType.trim()) {
      setErrorMessage('Equipment type is required for equipment booking')
      return
    }

    setLoading(true)
    try {
      const payload = {
        resourceId: selectedResource.id,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        expectedAttendees: showExpectedAttendees ? Number(formData.expectedAttendees) : null,
        equipmentType: showExpectedAttendees ? null : formData.equipmentType,
      }

      if (editingBookingId) {
        await resubmitBooking(editingBookingId, payload)
        setSuccessMessage('Booking request resubmitted with status PENDING')
      } else {
        await createBooking(payload, user)
        setSuccessMessage('Booking request created with status PENDING')
      }

      setFormData(DEFAULT_FORM)
      setEditingBookingId(null)
      setShowForm(false)
      await loadMyBookings()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to create booking request'))
    } finally {
      setLoading(false)
    }
  }

  async function cancelBooking(bookingId) {
    clearMessages()
    setLoading(true)
    try {
      await updateBookingStatus(
        bookingId,
        {
          status: 'CANCELLED',
          reviewReason: 'Cancelled by user',
        },
        user,
      )
      setSuccessMessage('Booking cancelled successfully')
      await loadMyBookings()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to cancel booking'))
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteBooking(bookingId) {
    if (!window.confirm('Delete this booking request? This cannot be undone.')) {
      return
    }

    clearMessages()
    setLoading(true)
    try {
      await deleteBooking(bookingId)
      setSuccessMessage('Booking deleted successfully')
      await loadMyBookings()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to delete booking'))
    } finally {
      setLoading(false)
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
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to upload timetable'))
    } finally {
      setUploading(false)
    }
  }

  async function loadWeeklyBookings() {
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
      setErrorMessage(getErrorMessage(error, 'Failed to load bookings'))
    }
  }

  function getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff)).toISOString().slice(0, 10)
  }

  function formatTime(timeStr) {
    if (!timeStr) return ''
    return timeStr.slice(0, 5)
  }

  function toDateKey(dateValue) {
    const year = dateValue.getFullYear()
    const month = String(dateValue.getMonth() + 1).padStart(2, '0')
    const day = String(dateValue.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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

  function getBookingsForSlot(dateValue, hour) {
    const dayKey = toDateKey(dateValue)
    const slotStart = hour * 60
    const slotEnd = (hour + 1) * 60

    return weeklyBookings
      .filter((booking) => {
        if (booking.bookingDate !== dayKey) {
          return false
        }

        const bookingStart = toMinutes(booking.startTime)
        const bookingEnd = toMinutes(booking.endTime)
        return bookingStart < slotEnd && bookingEnd > slotStart
      })
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
  }

  function openResubmitForm(booking) {
    setEditingBookingId(booking.id)
    setFormData({
      resourceId: String(booking.resourceId),
      bookingDate: booking.bookingDate,
      startTime: booking.startTime?.slice(0, 5) || '',
      endTime: booking.endTime?.slice(0, 5) || '',
      purpose: booking.purpose || '',
      expectedAttendees: booking.expectedAttendees ? String(booking.expectedAttendees) : '',
      equipmentType: booking.equipmentType || '',
    })
    clearMessages()
    setShowForm(true)
  }

  function closeBookingForm() {
    setShowForm(false)
    setEditingBookingId(null)
    setFormData(DEFAULT_FORM)
  }

  function closeUploadDialog() {
    setShowUploadModal(false)
    setUploadResult(null)
    setUploadFile(null)
  }

  return (
    <section className="flex flex-col gap-6">
      <Card>
        <CardHeader className="gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit">Booking workspace</Badge>
            <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">Booking Management</CardTitle>
            <CardDescription>
              Request campus resources by selecting date, time range, and purpose. Track approvals and weekly availability from one place.
            </CardDescription>
          </div>
          <CardAction className="flex flex-wrap gap-2">
            {user.role === 'ADMIN' ? (
              <Button variant="outline" onClick={() => setShowUploadModal(true)}>
                <FileUpIcon data-icon="inline-start" />
                Upload timetable
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={() => {
                setTimetableWeek(getWeekStart(new Date()))
                setShowTimetableModal(true)
              }}
            >
              <CalendarDaysIcon data-icon="inline-start" />
              View all bookings
            </Button>
            <Button
              onClick={() => {
                setEditingBookingId(null)
                setFormData(DEFAULT_FORM)
                setShowForm(true)
              }}
            >
              <PlusIcon data-icon="inline-start" />
              Request booking
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert>
          <SendIcon />
          <AlertTitle>Request complete</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total bookings</CardDescription>
            <CardTitle className="text-3xl font-semibold">{bookingStats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending review</CardDescription>
            <CardTitle className="text-3xl font-semibold">{bookingStats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl font-semibold">{bookingStats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl font-semibold">{bookingStats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Track current requests, approval status, and administrator review notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myBookings.length > 0 ? myBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.resourceName}</TableCell>
                  <TableCell>{formatLabel(booking.resourceType)}</TableCell>
                  <TableCell>{booking.bookingDate}</TableCell>
                  <TableCell>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</TableCell>
                  <TableCell className="max-w-64 truncate">{booking.purpose}</TableCell>
                  <TableCell>
                    <Badge variant={getBookingBadgeVariant(booking.status)}>{formatLabel(booking.status)}</Badge>
                  </TableCell>
                  <TableCell className="max-w-56 truncate">{booking.reviewReason || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'APPROVED' ? (
                        <Button variant="destructive" size="sm" onClick={() => cancelBooking(booking.id)} disabled={loading}>
                          <XIcon data-icon="inline-start" />
                          Cancel
                        </Button>
                      ) : null}
                      {booking.status === 'REJECTED' ? (
                        <Button variant="outline" size="sm" onClick={() => openResubmitForm(booking)} disabled={loading}>
                          <RefreshCwIcon data-icon="inline-start" />
                          Revise
                        </Button>
                      ) : null}
                      {['PENDING', 'REJECTED', 'CANCELLED'].includes(booking.status) ? (
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBooking(booking.id)} disabled={loading}>
                          <Trash2Icon data-icon="inline-start" />
                          Delete
                        </Button>
                      ) : null}
                      {!['APPROVED', 'REJECTED', 'PENDING', 'CANCELLED'].includes(booking.status) ? (
                        <span className="text-muted-foreground">-</span>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No booking requests yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={(open) => (open ? setShowForm(true) : closeBookingForm())}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBookingId ? 'Revise and Resubmit Booking' : 'Request a Booking'}</DialogTitle>
            <DialogDescription>Select resource, date, time, and request details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitBooking}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="booking-resource">Resource</FieldLabel>
                <Select
                  value={formData.resourceId || EMPTY_SELECT_VALUE}
                  onValueChange={(value) => updateField('resourceId', value === EMPTY_SELECT_VALUE ? '' : value)}
                >
                  <SelectTrigger id="booking-resource" className="w-full">
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={EMPTY_SELECT_VALUE}>Select a resource</SelectItem>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={String(resource.id)}>
                          {resource.name} ({formatLabel(resource.type)})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="booking-date">Date</FieldLabel>
                <Input
                  id="booking-date"
                  type="date"
                  required
                  value={formData.bookingDate}
                  onChange={(event) => updateField('bookingDate', event.target.value)}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="booking-start">Start Time</FieldLabel>
                  <Input
                    id="booking-start"
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(event) => updateField('startTime', event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="booking-end">End Time</FieldLabel>
                  <Input
                    id="booking-end"
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(event) => updateField('endTime', event.target.value)}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="booking-purpose">Purpose</FieldLabel>
                <Textarea
                  id="booking-purpose"
                  required
                  maxLength={500}
                  value={formData.purpose}
                  onChange={(event) => updateField('purpose', event.target.value)}
                />
                <FieldDescription>Maximum 500 characters.</FieldDescription>
              </Field>

              {showExpectedAttendees ? (
                <Field>
                  <FieldLabel htmlFor="booking-attendees">Expected Attendees</FieldLabel>
                  <Input
                    id="booking-attendees"
                    type="number"
                    min="1"
                    required
                    value={formData.expectedAttendees}
                    onChange={(event) => updateField('expectedAttendees', event.target.value)}
                  />
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="booking-equipment">Equipment Type</FieldLabel>
                  <Input
                    id="booking-equipment"
                    type="text"
                    required
                    value={formData.equipmentType}
                    onChange={(event) => updateField('equipmentType', event.target.value)}
                  />
                </Field>
              )}
            </FieldGroup>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={closeBookingForm}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                <SendIcon data-icon="inline-start" />
                {loading ? 'Submitting...' : editingBookingId ? 'Resubmit Booking Request' : 'Submit Booking Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadModal} onOpenChange={(open) => (open ? setShowUploadModal(true) : closeUploadDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Timetable</DialogTitle>
            <DialogDescription>Upload CSV, XLS, or XLSX timetable data.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="timetable-file">Timetable file</FieldLabel>
              <Input
                id="timetable-file"
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
              />
            </Field>
            {uploadResult ? (
              <Alert>
                <FileUpIcon />
                <AlertTitle>Upload complete</AlertTitle>
                <AlertDescription>
                  Uploaded: {uploadResult.inserted} rows, skipped: {uploadResult.skipped}
                </AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeUploadDialog}>Cancel</Button>
            <Button type="button" onClick={handleUpload} disabled={uploading}>
              <FileUpIcon data-icon="inline-start" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTimetableModal} onOpenChange={setShowTimetableModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>All Approved Bookings</DialogTitle>
            <DialogDescription>
              {timetableWeek} - {toDateKey(weekEnd)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setTimetableWeek(getWeekStart(new Date(new Date(timetableWeek).getTime() - 7 * 24 * 60 * 60 * 1000)))}
            >
              <HistoryIcon data-icon="inline-start" />
              Previous
            </Button>
            <Badge variant="secondary">
              <CalendarIcon data-icon="inline-start" />
              Week view
            </Badge>
            <Button
              variant="outline"
              type="button"
              onClick={() => setTimetableWeek(getWeekStart(new Date(new Date(timetableWeek).getTime() + 7 * 24 * 60 * 60 * 1000)))}
            >
              Next
              <CalendarDaysIcon data-icon="inline-end" />
            </Button>
          </div>

          <div className="overflow-auto rounded-xl border">
            <div className="grid min-w-[900px] grid-cols-[96px_repeat(7,minmax(112px,1fr))] bg-card text-sm">
              <div className="border-b border-r p-3 font-medium text-muted-foreground">Time</div>
              {weekDates.map((dateValue) => (
                <div key={toDateKey(dateValue)} className="flex flex-col gap-1 border-b border-r p-3 last:border-r-0">
                  <span className="font-medium">{dateValue.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                  <span className="text-xs text-muted-foreground">{toDateKey(dateValue)}</span>
                </div>
              ))}

              {hourSlots.map((hour) => (
                <Fragment key={`row-${hour}`}>
                  <div className="border-b border-r p-3 text-xs text-muted-foreground">
                    <Clock3Icon className="mr-1 inline" />
                    {formatHourLabel(hour)}
                  </div>
                  {weekDates.map((dateValue) => {
                    const bookingsInSlot = getBookingsForSlot(dateValue, hour)
                    return (
                      <div key={`${toDateKey(dateValue)}-${hour}`} className="min-h-24 border-b border-r p-2 last:border-r-0">
                        <div className="flex flex-col gap-2">
                          {bookingsInSlot.map((booking) => (
                            <div key={booking.id} className="rounded-lg border bg-muted/50 p-2">
                              <div className="truncate font-medium">{booking.resourceName}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatTime(booking.startTime)}-{formatTime(booking.endTime)}
                              </div>
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
            <Alert>
              <CalendarDaysIcon />
              <AlertTitle>No bookings found</AlertTitle>
              <AlertDescription>No approved bookings or lecture reservations found for this week.</AlertDescription>
            </Alert>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default BookingPage
