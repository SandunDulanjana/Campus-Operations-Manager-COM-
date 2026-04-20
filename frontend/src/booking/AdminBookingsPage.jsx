import { useEffect, useMemo, useState } from 'react'
import { fetchAllBookings, updateBookingStatus } from '../api/bookingApi'
import { fetchResources } from '../api/resourceApi'
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

  const bookingStats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === 'PENDING').length,
      approved: bookings.filter((booking) => booking.status === 'APPROVED').length,
    }),
    [bookings],
  )

  async function loadResources() {
    try {
      const data = await fetchResources()
      setResources(data)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load resources'))
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

        <ActionButton kind="primary" type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Apply'}
        </ActionButton>
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
