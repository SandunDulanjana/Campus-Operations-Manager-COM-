import axios from 'axios'

const BASE = 'http://localhost:8081/api'

// ─── Admin: create pending user (invite-based) ────────────────────────────────
export async function createPendingUser(payload) {
  const res = await axios.post(`${BASE}/users`, payload)
  return res.data  // { user: UserDTO, inviteUrl: string }
}

// ─── Admin: list all users ────────────────────────────────────────────────────
export async function fetchAllUsers() {
  const res = await axios.get(`${BASE}/users`)
  return res.data  // UserDTO[]
}

// ─── Admin: update role ───────────────────────────────────────────────────────
export async function updateUserRole(userId, role) {
  const res = await axios.put(`${BASE}/users/${userId}/role`, { role })
  return res.data
}

// ─── Admin: deactivate (soft-delete) ─────────────────────────────────────────
export async function deactivateUser(userId) {
  await axios.delete(`${BASE}/users/${userId}`)
}

// ─── Invite: validate token (public — no JWT needed) ─────────────────────────
export async function validateInviteToken(token) {
  const res = await axios.get(`${BASE}/auth/invite/validate`, { params: { token } })
  return res.data  // { email, name, username, role }
}

// ─── Invite: complete setup with password (public) ───────────────────────────
export async function completeInvite(token, password) {
  const res = await axios.post(`${BASE}/auth/invite/complete`, { token, password })
  return res.data  // LoginResponse (JWT + user info)
}

// ─── Registration request management ─────────────────────────────────────────

export async function fetchRegistrationRequests() {
  const res = await axios.get(`${BASE}/users/registration-requests`)
  return res.data   // UserDTO[] with registrationStatus = "PENDING_APPROVAL"
}

export async function approveRegistration(userId, dummyPassword) {
  const res = await axios.post(`${BASE}/users/${userId}/approve`, { dummyPassword })
  return res.data   // { message, devEmail: { to, subject, body, devNote } }
}

export async function rejectRegistration(userId, reason) {
  const res = await axios.post(`${BASE}/users/${userId}/reject`, { reason })
  return res.data
}

// ─── Permanent delete (only for disabled users) ───────────────────────────────
export async function permanentDeleteUser(userId) {
  await axios.delete(`${BASE}/users/${userId}/permanent`)
}