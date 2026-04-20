import { Fragment, useEffect, useMemo, useState } from 'react'
import { fetchAllBookings, fetchApprovedWeeklyBookings, fetchBookingDetails, updateBookingStatus } from '../api/bookingApi'
import { fetchResources } from '../api/resourceApi'
import { fetchWeeklyTimetable, uploadTimetable } from '../api/timetableApi'
import { useAuth } from '../context/useAuth'
import StatusBanner from '../components/ui/StatusBanner'
import StatusBadge from '../components/ui/StatusBadge'
import ActionButton from '../components/ui/ActionButton'

function BookingStatIcon({ kind }) {
  if (kind === 'pending') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.6v4.7l3 1.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    )
  }

  if (kind === 'approved') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.7 12.2 2.2 2.3 4.5-4.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="6" width="15" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 4.5v3M16 4.5v3M4.8 9.5h14.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  )
}

const DEFAULT_FILTERS = {
  selectedDate: '',
  selectedMonth: '',
  resourceType: '',
  status: '',
}

const SLOT_START_HOUR = 6
const SLOT_END_HOUR = 22

function getErrorMessage(error, fallbackMessage) {
  const status = error?.response?.status

  if (status === 401) {
    return 'Session expired or missing. Please log in again.'
  }

  if (status === 403) {
    return 'You do not have permission to view admin bookings.'
  }

  return error?.response?.data?.error || fallbackMessage
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
      if (user.role === 'ADMIN') {
        void loadBookings()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.role])

  useEffect(() => {
    if (showTimetableModal) {
      void loadWeeklyBookings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const data = await fetchResources()
      setResources(data)
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
        if (activeFilters.selectedDate) {
          return booking.bookingDate === activeFilters.selectedDate
        }

        if (activeFilters.selectedMonth) {
          return booking.bookingDate.startsWith(activeFilters.selectedMonth)
        }

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
      const details = await fetchBookingDetails(bookingId)
      setSelectedBookingDetails(details)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load booking details'))
    } finally {
      setDetailsLoading(false)
    }
  }

  function closeBookingDetails() {
    setSelectedBookingDetails(null)
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

  function closeTimeslotModal() {
    setShowTimetableModal(false)
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
    return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`
  }

  return (
    <section className="admin-bookings-page">
      <div className="panel-header">
        <div>
          <h1>Admin Booking Review</h1>
          <p>Review booking requests and approve or reject with reasons.</p>
        </div>
      </div>

      <StatusBanner type="error" message={errorMessage} />
      <StatusBanner type="success" message={successMessage} />

      <div className="admin-stat-grid booking-stat-grid">
        <article className="admin-stat-card booking-stat-card">
          <div className="booking-stat-card__icon booking-stat-card__icon--total">
            <BookingStatIcon kind="total" />
          </div>
          <div>
            <p>Total Bookings</p>
            <h2>{bookingStats.total}</h2>
          </div>
        </article>

        <article className="admin-stat-card booking-stat-card">
          <div className="booking-stat-card__icon booking-stat-card__icon--pending">
            <BookingStatIcon kind="pending" />
          </div>
          <div>
            <p>Pending Bookings</p>
            <h2>{bookingStats.pending}</h2>
          </div>
        </article>

        <article className="admin-stat-card booking-stat-card">
          <div className="booking-stat-card__icon booking-stat-card__icon--approved">
            <BookingStatIcon kind="approved" />
          </div>
          <div>
            <p>Approved Bookings</p>
            <h2>{bookingStats.approved}</h2>
          </div>
        </article>
      </div>

      <div className="admin-bookings-actions-row">
        <ActionButton kind="primary" onClick={() => setShowUploadModal(true)}>
          Upload Timetable
        </ActionButton>
        <ActionButton kind="secondary" onClick={() => { setTimetableWeek(getWeekStart(new Date())); setShowTimetableModal(true) }}>
          View Booking Timeslot
        </ActionButton>
      </div>

      <form className="admin-filter-row" onSubmit={applyFilters}>
        <label>
          Date
          <input
            type="date"
            value={filters.selectedDate}
            onChange={(event) => updateFilter('selectedDate', event.target.value)}
          />
        </label>

        <label>
          Month
          <input
            type="month"
            value={filters.selectedMonth}
            onChange={(event) => updateFilter('selectedMonth', event.target.value)}
          />
        </label>

        <label>
          Resource Type
          <select
            value={filters.resourceType}
            onChange={(event) => updateFilter('resourceType', event.target.value)}
          >
            <option value="">All</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>

        <div className="admin-filter-actions">
          <ActionButton kind="primary" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Apply'}
          </ActionButton>
          <ActionButton kind="ghost" type="button" disabled={loading} onClick={() => { void resetFilters() }}>
            Reset
          </ActionButton>
        </div>
      </form>

      <div className="table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Resource</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Reject Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.userName || booking.userId}</td>
                  <td>
                    {booking.resourceName}
                    <small className="muted">{booking.resourceType}</small>
                  </td>
                  <td>{booking.bookingDate}</td>
                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                  <td>
                    {booking.status === 'PENDING' ? (
                      <input
                        type="text"
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
                      booking.reviewReason || '-'
                    )}
                  </td>
                  <td>
                    {booking.status === 'PENDING' ? (
                      <div className="action-row">
                       <ActionButton kind="approve" onClick={() => approveBooking(booking.id)} disabled={loading}>
                          Approve
                        </ActionButton>
                        <ActionButton kind="danger" onClick={() => rejectBooking(booking.id)} disabled={loading}>
                          Reject
                        </ActionButton>
                        <ActionButton kind="ghost" onClick={() => viewBookingDetails(booking.id)} disabled={loading || detailsLoading}>
                          View Details
                        </ActionButton>
                      </div>
                    ) : (
                      <ActionButton kind="ghost" onClick={() => viewBookingDetails(booking.id)} disabled={detailsLoading}>
                        View Details
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBookingDetails ? (
        <div className="modal-backdrop" role="presentation" onClick={closeBookingDetails}>
          <div className="modal-window booking-details-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Booking Request Details</h2>
                <p className="booking-details-modal__subhead">Review the full request before making a decision.</p>
              </div>
              <ActionButton kind="ghost" className="modal-close-icon" aria-label="Close" onClick={closeBookingDetails}>
                &#10005;
              </ActionButton>
            </div>

            <div className="booking-details-grid">
              <div className="booking-details-card">
                <h3>Requester</h3>
                <dl>
                  <div>
                    <dt>User Name</dt>
                    <dd>{selectedBookingDetails.booking.userName || 'Unknown User'}</dd>
                  </div>
                  <div>
                    <dt>User ID</dt>
                    <dd>{selectedBookingDetails.booking.userId}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd><StatusBadge status={selectedBookingDetails.booking.status} /></dd>
                  </div>
                  <div>
                    <dt>Review Note</dt>
                    <dd>{selectedBookingDetails.booking.reviewReason || '-'}</dd>
                  </div>
                </dl>
              </div>

              <div className="booking-details-card">
                <h3>Booking Details</h3>
                <dl>
                  <div>
                    <dt>Resource</dt>
                    <dd>{selectedBookingDetails.booking.resourceName}</dd>
                  </div>
                  <div>
                    <dt>Resource Type</dt>
                    <dd>{selectedBookingDetails.booking.resourceType}</dd>
                  </div>
                  <div>
                    <dt>Date</dt>
                    <dd>{selectedBookingDetails.booking.bookingDate}</dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd>{selectedBookingDetails.booking.startTime} - {selectedBookingDetails.booking.endTime}</dd>
                  </div>
                  <div>
                    <dt>Purpose</dt>
                    <dd>{selectedBookingDetails.booking.purpose}</dd>
                  </div>
                  <div>
                    <dt>Expected Attendees</dt>
                    <dd>{selectedBookingDetails.booking.expectedAttendees ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Equipment Type</dt>
                    <dd>{selectedBookingDetails.booking.equipmentType || '-'}</dd>
                  </div>
                  <div>
                    <dt>Submitted</dt>
                    <dd>{formatDateTime(selectedBookingDetails.booking.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Last Updated</dt>
                    <dd>{formatDateTime(selectedBookingDetails.booking.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="booking-details-card booking-history-card">
              <h3>Request History</h3>
              {selectedBookingDetails.history.length > 0 ? (
                <div className="booking-history-list">
                  {selectedBookingDetails.history.map((entry) => (
                    <article key={entry.id} className="booking-history-item">
                      <div className="booking-history-item__top">
                        <strong>{entry.userName || 'Unknown User'}</strong>
                        <span>{formatDateTime(entry.createdAt)}</span>
                      </div>
                      <p className="booking-history-item__status">
                        {entry.status}
                      </p>
                      <div className="booking-history-item__details">
                        <div>
                          <span>Date</span>
                          <strong>{entry.bookingDate || '-'}</strong>
                        </div>
                        <div>
                          <span>Time</span>
                          <strong>{formatTimeRange(entry.startTime, entry.endTime)}</strong>
                        </div>
                        <div>
                          <span>Purpose</span>
                          <strong>{entry.purpose || '-'}</strong>
                        </div>
                        <div>
                          <span>Attendees</span>
                          <strong>{entry.expectedAttendees ?? '-'}</strong>
                        </div>
                        <div>
                          <span>Equipment</span>
                          <strong>{entry.equipmentType || '-'}</strong>
                        </div>
                        <div>
                          <span>Reason</span>
                          <strong>{entry.reviewReason || 'No review reason provided.'}</strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="booking-history-empty">No review history available yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showUploadModal ? (
        <div className="modal-backdrop" role="presentation" onClick={closeUploadModal}>
          <div className="modal-window" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Timetable</h2>
              <ActionButton kind="ghost" className="modal-close-icon" aria-label="Close" onClick={closeUploadModal}>
                &#10005;
              </ActionButton>
            </div>
            <div className="booking-form">
              <label>
                Select CSV File
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                />
              </label>
              {uploadResult ? (
                <div className="status-banner success">
                  Uploaded: {uploadResult.inserted} rows, Skipped: {uploadResult.skipped}
                </div>
              ) : null}
              <ActionButton kind="primary" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </ActionButton>
            </div>
          </div>
        </div>
      ) : null}

      {showTimetableModal ? (
        <div className="modal-backdrop" role="presentation" onClick={closeTimeslotModal}>
          <div className="modal-window" style={{ maxWidth: '900px' }} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Timeslots</h2>
              <ActionButton kind="ghost" className="modal-close-icon" aria-label="Close" onClick={closeTimeslotModal}>
                &#10005;
              </ActionButton>
            </div>
            <div className="timetable-controls">
              <ActionButton
                kind="ghost"
                className="timetable-nav-btn"
                aria-label="Previous week"
                onClick={() => setTimetableWeek(getWeekStart(new Date(new Date(timetableWeek).getTime() - 7 * 24 * 60 * 60 * 1000)))}
              >
                &#8592;
              </ActionButton>
              <span>{timetableWeek} - {toDateKey(weekEnd)}</span>
              <ActionButton
                kind="ghost"
                className="timetable-nav-btn"
                aria-label="Next week"
                onClick={() => setTimetableWeek(getWeekStart(new Date(new Date(timetableWeek).getTime() + 7 * 24 * 60 * 60 * 1000)))}
              >
                &#8594;
              </ActionButton>
            </div>
            <div className="booking-calendar-wrap">
              <div className="booking-calendar-grid">
                <div className="calendar-corner">Time</div>
                {weekDates.map((dateValue) => (
                  <div key={toDateKey(dateValue)} className="calendar-day-header">
                    <strong>{dateValue.toLocaleDateString(undefined, { weekday: 'short' })}</strong>
                    <span>{toDateKey(dateValue)}</span>
                  </div>
                ))}

                {hourSlots.map((hour) => (
                  <Fragment key={`row-${hour}`}>
                    <div className="calendar-time-label">
                      {formatHourLabel(hour)}
                    </div>
                    {weekDates.map((dateValue) => {
                      const bookingsInSlot = getBookingsForSlot(dateValue, hour)
                      return (
                        <div
                          key={`${toDateKey(dateValue)}-${hour}`}
                          className={`calendar-cell${bookingsInSlot.length > 0 ? ' has-booking' : ''}`}
                        >
                          {bookingsInSlot.map((booking) => (
                            <div key={booking.id} className="booking-cell-item">
                              <span className="booking-cell-resource">{booking.resourceName}</span>
                              <span className="booking-cell-time">
                                {formatTime(booking.startTime)}-{formatTime(booking.endTime)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
              {weeklyBookings.length === 0 ? (
                <p className="calendar-empty-state">No approved bookings or lecture reservations found for this week</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AdminBookingsPage
