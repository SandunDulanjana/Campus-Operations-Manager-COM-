import axios from 'axios'

const API_URL = 'http://localhost:8081/api'

export const loginWithCredentials = async (username, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { username, password })
  return response.data
}

export const startGoogleLogin = () => {
  window.location.href = `${API_URL}/auth/google`
}

/** Feature 5: Request a password reset keyword (sent to email / shown in dev mode) */
export const forgotPassword = async (identifier) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { identifier })
  return response.data // { message, devKeyword }
}

/** Feature 5: Reset password using the keyword received by email */
export const resetPassword = async (keyword, newPassword) => {
  const response = await axios.post(`${API_URL}/auth/reset-password`, { keyword, newPassword })
  return response.data
}