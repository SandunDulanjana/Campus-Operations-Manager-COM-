import axios from 'axios'

const BASE = 'http://localhost:8081/api/2fa'

export async function get2FAStatus() {
  const res = await axios.get(`${BASE}/status`)
  return res.data
}

// ─── TOTP ─────────────────────────────────────────────────────────────────────

export async function setupTotp() {
  const res = await axios.post(`${BASE}/setup/totp`)
  return res.data // { secret, qrCode }
}

export async function verifyTotp(secret, code) {
  const res = await axios.post(`${BASE}/verify/totp`, { secret, code })
  return res.data
}

// ─── SMS — 2-step flow ────────────────────────────────────────────────────────

/** Step 1: Send OTP to the given phone number */
export async function sendSmsOtp(phone) {
  const res = await axios.post(`${BASE}/setup/sms/send-otp`, { phone })
  return res.data // { message, devCode }
}

/** Step 2: Verify the OTP and enable SMS 2FA */
export async function verifyPhone(code) {
  const res = await axios.post(`${BASE}/setup/sms/verify-phone`, { code })
  return res.data
}

// ─── Password confirmation (before disable / switch) ─────────────────────────

export async function confirmPassword(password) {
  const res = await axios.post(`${BASE}/confirm-password`, { password })
  return res.data // { verified: true }
}

// ─── Disable (requires password) ──────────────────────────────────────────────

export async function disable2FA(password) {
  const res = await axios.delete(`${BASE}/disable`, { data: { password } })
  return res.data
}

// ─── Login-time 2FA ───────────────────────────────────────────────────────────

export async function verifyTwoFactorLogin(tempToken, code) {
  const res = await axios.post('http://localhost:8081/api/auth/verify-2fa', { tempToken, code })
  return res.data
}