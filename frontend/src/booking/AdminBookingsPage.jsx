import { useEffect, useMemo, useState } from 'react'
import { fetchAllBookings, updateBookingStatus } from '../api/bookingApi'
import { fetchResources } from '../api/resourceApi'
import { useAuth } from '../context/AuthContext'

const DEFAULT_FILTERS = {
  date: '',
  resourceType: '',
  status: '',
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
          date: filters.date || undefined,
          resourceType: filters.resourceType || undefined,
          status: filters.status || undefined,
        },
        user,
      )
      setBookings(response)
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to load admin bookings')
    } finally {
      setLoading(false)
    }
  }

  function updateFilter(field, value) {
    setFilters((current) => ({
      ...current,
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

  if (user.role !== 'ADMIN') {
    return (
      <section className="booking-page">
        <div className="table-panel">
          <h1>Admin Booking Review</h1>
          <p className="status-banner error">
            Switch role to ADMIN from the profile menu to access review actions.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="booking-page">
      <div className="panel-header">
        <div>
          <h1>Admin Booking Review</h1>
          <p>Review booking requests and approve or reject with reasons.</p>
        </div>
      </div>

      {errorMessage ? <p className="status-banner error">{errorMessage}</p> : null}
      {successMessage ? <p className="status-banner success">{successMessage}</p> : null}

      <form className="filter-form" onSubmit={applyFilters}>
        <label>
          Date
          <input type="date" value={filters.date} onChange={(event) => updateFilter('date', event.target.value)} />
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
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
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
                  <td>{booking.userId}</td>
                  <td>
                    {booking.resourceName}
                    <small className="muted">{booking.resourceType}</small>
                  </td>
                  <td>{booking.bookingDate}</td>
                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td>
                    <span className={`badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
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
                        <button
                          type="button"
                          className="approve-btn"
                          onClick={() => approveBooking(booking.id)}
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => rejectBooking(booking.id)}
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </div>
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

export default AdminBookingsPage
