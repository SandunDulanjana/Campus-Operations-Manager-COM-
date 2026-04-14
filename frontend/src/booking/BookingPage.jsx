import { Fragment, useEffect, useMemo, useState } from 'react'
import { createBooking, fetchApprovedWeeklyBookings, fetchMyBookings, updateBookingStatus } from '../api/bookingApi'
import { fetchResources } from '../api/resourceApi'
import { fetchWeeklyTimetable, uploadTimetable } from '../api/timetableApi'
import { useAuth } from '../context/AuthContext'
import bookingIllustration from '../assets/hero.jpg'
import HeroSection from '../components/layout/HeroSection'
import StatusBanner from '../components/ui/StatusBanner'
import StatusBadge from '../components/ui/StatusBadge'
import ActionButton from '../components/ui/ActionButton'

const RESOURCE_TYPE_WITH_ATTENDEES = new Set(['MEETING_ROOM', 'LECTURE_HALL', 'LAB'])

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

  useEffect(() => {
    void loadResources()
  }, [])

  useEffect(() => {
    void loadMyBookings()
  }, [user.id, user.role])

  useEffect(() => {
    if (showTimetableModal) {
      void loadWeeklyBookings()
    }
  }, [showTimetableModal, timetableWeek])

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === Number(formData.resourceId)) ?? null,
    [resources, formData.resourceId],
  )

  const showExpectedAttendees =
    selectedResource && RESOURCE_TYPE_WITH_ATTENDEES.has(selectedResource.type)

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
    } catch {
      setErrorMessage('Failed to load resources')
    }
  }

  async function loadMyBookings() {
    try {
      const data = await fetchMyBookings(user)
      setMyBookings(data)
    } catch {
      setErrorMessage('Failed to load bookings')
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

      await createBooking(payload, user)
      setFormData(DEFAULT_FORM)
      setShowForm(false)
      setSuccessMessage('Booking request created with status PENDING')
      await loadMyBookings()
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to create booking request')
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
      setErrorMessage(error?.response?.data?.error || 'Failed to cancel booking')
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
      setErrorMessage(error?.response?.data?.error || 'Failed to upload timetable')
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
      setErrorMessage(error?.response?.data?.error || 'Failed to load bookings')
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

  return (
    <section className="booking-page">
      <HeroSection
        title="Booking Management"
        description="Request campus resources by selecting date, time range, and purpose. The system keeps the workflow structured and blocks conflicting schedules."
        imageSrc={bookingIllustration}
        imageAlt="Booking and scheduling illustration"
        actions={
          <ActionButton kind="primary" onClick={() => setShowForm(true)}>
            Request a Booking
          </ActionButton>
        }
      />

      <StatusBanner type="error" message={errorMessage} />
      <StatusBanner type="success" message={successMessage} />

      <div className="booking-actions-row">
        {user.role === 'ADMIN' && (
          <ActionButton kind="primary" onClick={() => setShowUploadModal(true)}>
            Upload Timetable
          </ActionButton>
        )}
        <ActionButton kind="secondary" onClick={() => { setTimetableWeek(getWeekStart(new Date())); setShowTimetableModal(true); }}>
          View All Bookings
        </ActionButton>
      </div>

      {showForm ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowForm(false)}>
          <div className="modal-window" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Request a Booking</h2>
              <ActionButton kind="ghost" className="modal-close-icon" aria-label="Close" onClick={() => setShowForm(false)}>
                &#10005;
              </ActionButton>
            </div>

            <form className="booking-form" onSubmit={submitBooking}>
              <label>
                Resource
                <select
                  required
                  value={formData.resourceId}
                  onChange={(event) => updateField('resourceId', event.target.value)}
                >
                  <option value="">Select a resource</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  required
                  value={formData.bookingDate}
                  onChange={(event) => updateField('bookingDate', event.target.value)}
                />
              </label>

              <div className="time-row">
                <label>
                  Start Time
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(event) => updateField('startTime', event.target.value)}
                  />
                </label>

                <label>
                  End Time
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(event) => updateField('endTime', event.target.value)}
                  />
                </label>
              </div>

              <label>
                Purpose
                <textarea
                  required
                  maxLength={500}
                  value={formData.purpose}
                  onChange={(event) => updateField('purpose', event.target.value)}
                />
              </label>

              {showExpectedAttendees ? (
                <label>
                  Expected Attendees
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.expectedAttendees}
                    onChange={(event) => updateField('expectedAttendees', event.target.value)}
                  />
                </label>
              ) : (
                <label>
                  Equipment Type
                  <input
                    type="text"
                    required
                    value={formData.equipmentType}
                    onChange={(event) => updateField('equipmentType', event.target.value)}
                  />
                </label>
              )}

              <ActionButton kind="primary" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Booking Request'}
              </ActionButton>
            </form>
          </div>
        </div>
      ) : null}

      <div className="table-panel">
        <div className="panel-header">
          <div>
            <h2>My Bookings</h2>
            <p>Track your current requests, approval status, and any review notes from administrators.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.resourceName}</td>
                  <td>{booking.resourceType}</td>
                  <td>{booking.bookingDate}</td>
                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td>{booking.purpose}</td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                  <td>{booking.reviewReason || '-'}</td>
                  <td>
                    {booking.status === 'APPROVED' ? (
                      <ActionButton kind="danger" onClick={() => cancelBooking(booking.id)} disabled={loading}>
                        Cancel
                      </ActionButton>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadModal && (
        <div className="modal-backdrop" role="presentation" onClick={() => { setShowUploadModal(false); setUploadResult(null); setUploadFile(null); }}>
          <div className="modal-window" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Timetable</h2>
              <ActionButton kind="ghost" className="modal-close-icon" aria-label="Close" onClick={() => { setShowUploadModal(false); setUploadResult(null); setUploadFile(null); }}>
                &#10005;
              </ActionButton>
            </div>
            <div className="booking-form">
              <label>
                Select CSV File
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
              </label>
              {uploadResult && (
                <div className="status-banner success">
                  Uploaded: {uploadResult.inserted} rows, Skipped: {uploadResult.skipped}
                </div>
              )}
              <ActionButton kind="primary" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {showTimetableModal && (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowTimetableModal(false)}>
          <div className="modal-window" style={{ maxWidth: '900px' }} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Approved Bookings</h2>
              <ActionButton kind="ghost" className="modal-close-icon" aria-label="Close" onClick={() => setShowTimetableModal(false)}>
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
      )}
    </section>
  )
}

export default BookingPage
