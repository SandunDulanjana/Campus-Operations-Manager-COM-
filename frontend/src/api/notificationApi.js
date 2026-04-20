import axios from 'axios'

const BASE = 'http://localhost:8081/api/notifications'

// ── USER ──────────────────────────────────────────────────────────────────────

export async function fetchMyNotifications() {
  const res = await axios.get(BASE)
  return res.data   // NotificationDTO[]
}

export async function fetchUnreadCount() {
  const res = await axios.get(`${BASE}/unread-count`)
  return res.data.count  // number
}

export async function markNotificationRead(id) {
  const res = await axios.patch(`${BASE}/${id}/read`)
  return res.data
}

export async function markAllNotificationsRead() {
  const res = await axios.patch(`${BASE}/read-all`)
  return res.data
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export async function fetchAllNotificationsAdmin() {
  const res = await axios.get(`${BASE}/admin/all`)
  return res.data
}

export async function createBroadcastNotification(payload) {
  // payload: { title, message, audienceRoles: [], published: true }
  const res = await axios.post(BASE, payload)
  return res.data
}

export async function toggleNotificationPublished(id) {
  const res = await axios.patch(`${BASE}/${id}/toggle-published`)
  return res.data
}

export async function deleteNotification(id) {
  await axios.delete(`${BASE}/${id}`)
}