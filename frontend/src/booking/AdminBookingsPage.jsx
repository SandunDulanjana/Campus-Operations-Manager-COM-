import { useEffect, useMemo, useState } from 'react'
import { fetchAllBookings, updateBookingStatus } from '../api/bookingApi'
import { fetchResources } from '../api/resourceApi'
import { useAuth } from '../context/AuthContext'
import StatusBanner from '../components/ui/StatusBanner'
import StatusBadge from '../components/ui/StatusBadge'
import ActionButton from '../components/ui/ActionButton'

const DEFAULT_FILTERS = {
  timePeriod: '',
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
      const now = new Date()
      const today = now.toISOString().slice(0, 10)
      const dateFilter = filters.timePeriod === 'TODAY' ? today : undefined

      const response = await fetchAllBookings(
        {
          date: dateFilter,
          resourceType: filters.resourceType || undefined,
          status: filters.status || undefined,
        },
        user,
      )

      const filtered = response.filter((booking) => {
        if (filters.timePeriod === 'THIS_WEEK') {
          const bookingDate = new Date(`${booking.bookingDate}T00:00:00`)
          const startOfWeek = new Date(now)
          startOfWeek.setHours(0, 0, 0, 0)
          startOfWeek.setDate(now.getDate() - now.getDay())
          const endOfWeek = new Date(startOfWeek)
          endOfWeek.setDate(startOfWeek.getDate() + 6)
          return bookingDate >= startOfWeek && bookingDate <= endOfWeek
        }

        if (filters.timePeriod === 'THIS_MONTH') {
          const bookingDate = new Date(`${booking.bookingDate}T00:00:00`)
          return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear()
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
    <section className="admin-bookings-page">
      <div className="panel-header">
        <div>
          <h1>Admin Booking Review</h1>
          <p>Review booking requests and approve or reject with reasons.</p>
        </div>
      </div>

      <StatusBanner type="error" message={errorMessage} />
      <StatusBanner type="success" message={successMessage} />

      <form className="admin-filter-row" onSubmit={applyFilters}>
        <label>
          Time Period
          <select value={filters.timePeriod} onChange={(event) => updateFilter('timePeriod', event.target.value)}>
            <option value="">All</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
          </select>
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
