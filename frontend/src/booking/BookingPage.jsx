import { useEffect, useMemo, useState } from 'react'
import { createBooking, fetchMyBookings, updateBookingStatus } from '../api/bookingApi'
import { fetchResources } from '../api/resourceApi'
import { useAuth } from '../context/AuthContext'
import bookingIllustration from '../assets/hero.png'

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

function BookingPage() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    void loadResources()
  }, [])

  useEffect(() => {
    void loadMyBookings()
  }, [user.id, user.role])

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === Number(formData.resourceId)) ?? null,
    [resources, formData.resourceId],
  )

  const showExpectedAttendees =
    selectedResource && RESOURCE_TYPE_WITH_ATTENDEES.has(selectedResource.type)

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

  return (
    <section className="booking-page">
      <div className="booking-hero">
        <div className="hero-copy">
          <p className="eyebrow">Module B</p>
          <h1>Booking Management</h1>
          <p>
            Request campus resources by selecting date, time range, and purpose. The system keeps the workflow
            structured and blocks conflicting schedules.
          </p>
          <button className="primary-btn" type="button" onClick={() => setShowForm(true)}>
            Request a Booking
          </button>
        </div>

        <div className="hero-media">
          <img src={bookingIllustration} alt="Booking and scheduling illustration" />
        </div>
      </div>

      {errorMessage ? <p className="status-banner error">{errorMessage}</p> : null}
      {successMessage ? <p className="status-banner success">{successMessage}</p> : null}

      {showForm ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowForm(false)}>
          <div className="modal-window" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Request a Booking</h2>
              <button type="button" className="ghost-btn" onClick={() => setShowForm(false)}>
                Close
              </button>
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

              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <div className="table-panel">
        <h2>My Bookings</h2>
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
                    <span className={`badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  </td>
                  <td>{booking.reviewReason || '-'}</td>
                  <td>
                    {booking.status === 'APPROVED' ? (
                      <button
                        className="danger-btn"
                        type="button"
                        onClick={() => cancelBooking(booking.id)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
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
    </section>
  )
}

export default BookingPage
