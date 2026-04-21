import axios from 'axios'

const API_BASE_URL = 'http://localhost:8081'

// ─── TICKETS ─────────────────────────────────────────────────

export async function createTicket(payload) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/tickets`, payload)
  return response.data
}

export async function fetchAllTickets(filters = {}) {
  const response = await axios.get(`${API_BASE_URL}/api/v1/tickets`, {
    params: filters,
  })
  return response.data
}

export async function fetchMyTickets() {
  const response = await axios.get(`${API_BASE_URL}/api/v1/tickets/my`)
  return response.data
}

export async function fetchAssignedTickets() {
  const response = await axios.get(`${API_BASE_URL}/api/v1/tickets/assigned`)
  return response.data
}

export async function fetchTicketById(id) {
  const response = await axios.get(`${API_BASE_URL}/api/v1/tickets/${id}`)
  return response.data
}

export async function updateTicketStatus(id, payload) {
  const response = await axios.patch(
    `${API_BASE_URL}/api/v1/tickets/${id}/status`,
    payload
  )
  return response.data
}

export async function deleteTicket(id) {
  const response = await axios.delete(`${API_BASE_URL}/api/v1/tickets/${id}`)
  return response.data
}

// ─── COMMENTS ────────────────────────────────────────────────

export async function addComment(ticketId, content) {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/tickets/${ticketId}/comments`,
    { content }
  )
  return response.data
}

export async function updateComment(ticketId, commentId, content) {
  const response = await axios.put(
    `${API_BASE_URL}/api/v1/tickets/${ticketId}/comments/${commentId}`,
    { content }
  )
  return response.data
}

export async function deleteComment(ticketId, commentId) {
  const response = await axios.delete(
    `${API_BASE_URL}/api/v1/tickets/${ticketId}/comments/${commentId}`
  )
  return response.data
}

// ─── ATTACHMENTS ─────────────────────────────────────────────

export async function uploadAttachment(ticketId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/tickets/${ticketId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data
}

export function getAttachmentUrl(ticketId, attachmentId) {
  return `${API_BASE_URL}/api/v1/tickets/${ticketId}/attachments/${attachmentId}/data`
}

export async function deleteAttachment(ticketId, attachmentId) {
  const response = await axios.delete(
    `${API_BASE_URL}/api/v1/tickets/${ticketId}/attachments/${attachmentId}`
  )
  return response.data
}

// ─── CONSTANTS ───────────────────────────────────────────────

export const TICKET_CATEGORIES = [
  'ELECTRICAL',
  'PLUMBING',
  'IT_EQUIPMENT',
  'FURNITURE',
  'HVAC',
  'SECURITY',
  'CLEANING',
  'OTHER',
]

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
]

export const ALLOWED_TRANSITIONS = {
  OPEN:        ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
  REJECTED:    [],
}

// ─── HELPERS ─────────────────────────────────────────────────

export function formatTicketLabel(value) {
  if (!value) return ''
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatTicketDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(minutes) {
  if (minutes == null) return '—'
  if (minutes < 1) return '< 1m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'OPEN':        return 'badge pending'
    case 'IN_PROGRESS': return 'badge approved'
    case 'RESOLVED':    return 'badge approved'
    case 'CLOSED':      return 'badge cancelled'
    case 'REJECTED':    return 'badge rejected'
    default:            return 'badge'
  }
}

export function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'CRITICAL': return 'badge rejected'
    case 'HIGH':     return 'badge pending'
    case 'MEDIUM':   return 'badge approved'
    case 'LOW':      return 'badge cancelled'
    default:         return 'badge'
  }
}

// Fetch all users with TECHNICIAN role for the assign dropdown
export async function fetchTechnicians() {
  const response = await axios.get('http://localhost:8081/api/users')
  // Filter to only TECHNICIAN role users
  return response.data.filter((u) => u.role === 'TECHNICIAN')
}