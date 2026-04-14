import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setError('No token received from Google login.')
      return
    }

    // Set token temporarily to fetch user info
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    axios.get('http://localhost:8081/api/auth/me')
      .then((response) => {
        // Store the user + token in AuthContext
        login(response.data, token)
        navigate('/')
      })
      .catch(() => {
        setError('Failed to retrieve user info after Google login.')
      })
  }, [])

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