import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/useAuth'

function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const hasRun = useRef(false) // prevents double-run in React StrictMode

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const token = searchParams.get('token')

    if (!token) {
      // Use setTimeout to avoid synchronous setState inside effect
      setTimeout(() => setError('No token received from Google login.'), 0)
      return
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    axios
      .get('http://localhost:8081/api/auth/me')
      .then((response) => {
        login(response.data, token)
        navigate('/')
      })
      .catch(() => {
        setError('Failed to retrieve user info after Google login.')
      })
  }, [searchParams, login, navigate]) // fixed: all dependencies listed

  if (error) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p className="login-error">{error}</p>
          <a href="/login">Back to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <p>Signing you in with Google...</p>
      </div>
    </div>
  )
}

export default OAuthCallback