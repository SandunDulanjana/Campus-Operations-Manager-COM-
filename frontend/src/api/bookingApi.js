import axios from 'axios'

const API_BASE_URL = 'http://localhost:8081'

export async function createBooking(payload, user) {
  const response = await axios.post(`${API_BASE_URL}/api/bookings`, payload)
  return response.data
}

export async function fetchMyBookings(user) {
  const response = await axios.get(`${API_BASE_URL}/api/bookings/me`)
  return response.data
}

export async function fetchAllBookings(filters, user) {
  const response = await axios.get(`${API_BASE_URL}/api/bookings`, {
    params: filters,
  })
  return response.data
}

export async function fetchApprovedWeeklyBookings(weekStart, user) {
  const response = await axios.get(`${API_BASE_URL}/api/bookings/approved-weekly`, {
    params: { weekStart },
  })
  return response.data
}

export async function updateBookingStatus(bookingId, payload, user) {
  const response = await axios.patch(`${API_BASE_URL}/api/bookings/${bookingId}`, payload)
  return response.data
}
