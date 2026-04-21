import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/useAuth'

function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const { login }      = useAuth()
  const navigate       = useNavigate()
  const hasProcessed   = useRef(false)

  const status       = searchParams.get('status')
  const token        = searchParams.get('token')
  const pendingToken = searchParams.get('pendingToken')
  const reason       = searchParams.get('reason')

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    // ── New user: needs to enter University ID ─────────────────────────────
    if (status === 'needs_university_id' && pendingToken) {
      navigate(`/enter-university-id?pendingToken=${encodeURIComponent(pendingToken)}`, { replace: true })
      return
    }

    // ── Non-token statuses are handled by the JSX below (no redirect) ─────
    if (status === 'pending_approval' || status === 'rejected' || status === 'disabled') {
      return  // render the status UI below
    }

    // ── Normal login ───────────────────────────────────────────────────────
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    axios.get('http://localhost:8081/api/auth/me')
      .then(res => {
        login(res.data, token)
        setTimeout(() => navigate('/', { replace: true }), 200)
      })
      .catch(() => navigate('/login', { replace: true }))
  }, [status, token, pendingToken, login, navigate])

  // ── Pending approval screen ──────────────────────────────────────────────
  if (status === 'pending_approval') {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
          <h2 style={{ margin: '0 0 0.5rem' }}>Registration Pending</h2>
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
            Your registration request has been submitted and is waiting for admin approval.
            You will receive an email once your account is activated.
          </p>
          <Link to="/login" style={{ display: 'inline-block', marginTop: '1.2rem', color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  // ── Rejected screen ──────────────────────────────────────────────────────
  if (status === 'rejected') {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❌</div>
          <h2 style={{ margin: '0 0 0.5rem', color: '#dc2626' }}>Registration Declined</h2>
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
            Your registration request was not approved.
          </p>
          {reason && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.9rem', margin: '0.8rem 0', textAlign: 'left' }}>
              <strong style={{ color: '#991b1b', fontSize: '0.85rem' }}>Reason:</strong>
              <p style={{ margin: '0.3rem 0 0', color: '#7f1d1d', fontSize: '0.9rem' }}>{reason}</p>
            </div>
          )}
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            Contact your campus administrator if you believe this is a mistake.
          </p>
          <Link to="/login" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  // ── Disabled / loading ───────────────────────────────────────────────────
  if (status === 'disabled') {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
          <h2 style={{ margin: '0 0 0.5rem' }}>Account Disabled</h2>
          <p style={{ color: '#6b7280' }}>This account has been disabled. Contact your administrator.</p>
          <Link to="/login" style={{ display: 'inline-block', marginTop: '1.2rem', color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  // ── Loading / processing ─────────────────────────────────────────────────
  return (
    <div className="login-page">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Signing you in with Google…</p>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Please wait a moment…</p>
      </div>
    </div>
  )
}

export default OAuthCallback