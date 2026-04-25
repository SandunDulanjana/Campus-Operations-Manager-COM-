import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { validateInviteToken, completeInvite } from '../api/adminApi'
import { useAuth } from '../context/useAuth'

export default function SetupAccountPage() {
  const [searchParams]        = useSearchParams()
  const token                 = searchParams.get('token') || ''
  const navigate              = useNavigate()
  const { login }             = useAuth()

  const [info, setInfo]       = useState(null)   // { email, name, username, role }
  const [tokenError, setTokenError] = useState('')
  const [loading, setLoading] = useState(true)

  // Password-path state
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [pwError, setPwError]     = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  // ── Validate token on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setTokenError('No invite token found in this link.'); setLoading(false); return }
    validateInviteToken(token)
      .then(data => { setInfo(data); setLoading(false) })
      .catch(err => {
        setTokenError(err?.response?.data || 'This invite link is invalid or has expired.')
        setLoading(false)
      })
  }, [token])

  // ── Password path ──────────────────────────────────────────────────────────
  async function handlePasswordSetup(e) {
    e.preventDefault()
    setPwError('')
    if (password.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    if (password !== confirm)  { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    try {
      const data = await completeInvite(token, password)
      login(data)           // save JWT + user in AuthContext (same as after normal login)
      navigate('/', { replace: true })
    } catch (err) {
      setPwError(err?.response?.data || 'Something went wrong. Please try again.')
    } finally { setPwLoading(false) }
  }

  // ── Google path ────────────────────────────────────────────────────────────
  function handleGoogleSetup() {
    // Triggers normal Google OAuth. The backend's findOrCreateUser()
    // detects the pending invite by email and consumes the token automatically.
    window.location.href = 'http://localhost:8081/oauth2/authorization/google'
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Verifying your invite link…</p>
        </div>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', display: 'block' }}>
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 style={{ margin: '0 0 0.5rem', textAlign: 'center' }}>Invalid invite link</h2>
          <p style={{ color: '#6b7280', textAlign: 'center', fontSize: '0.9rem' }}>{tokenError}</p>
          <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.88rem', color: '#6b7280' }}>
            Please contact your administrator for a new invite.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '440px' }}>

        {/* Header */}
        <div className="login-brand" style={{ marginBottom: '1.5rem' }}>
          <div style={{
            width: '3rem', height: '3rem', borderRadius: '0.85rem',
            background: 'linear-gradient(145deg, var(--accent-700), var(--brand-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(20,108,105,0.22)'
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div>
            <h1 className="login-title" style={{ fontSize: '1.3rem', margin: 0 }}>Set up your account</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Smart Campus Operations Hub</p>
          </div>
        </div>

        <p style={{ margin: '0 0 1.4rem', color: '#374151', fontSize: '0.92rem', lineHeight: 1.55 }}>
          Welcome, <strong>{info.name}</strong>! You've been invited as <strong>{info.role}</strong>.
          Choose how you'd like to sign in from now on.
        </p>

        {/* ── Card A: Campus password ── */}
        <div style={{
          border: '1.5px solid #e5e7eb', borderRadius: '1rem',
          padding: '1.2rem 1.4rem', marginBottom: '1rem',
          background: '#fff'
        }}>
          <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem' }}>
            🔑 Campus Login
          </h3>
          {info.username && (
            <p style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', color: '#6b7280' }}>
              Your University ID: <strong style={{ color: '#1f2937' }}>{info.username}</strong>
            </p>
          )}
          {pwError && (
            <p className="login-error" style={{ marginBottom: '0.7rem' }}>{pwError}</p>
          )}
          <form onSubmit={handlePasswordSetup} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Choose a password (min 8 chars)"
              required
              style={{ padding: '0.65rem 0.9rem', borderRadius: '0.65rem', border: '1.5px solid #d1d5db', fontSize: '0.9rem' }}
            />
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm password"
              required
              style={{ padding: '0.65rem 0.9rem', borderRadius: '0.65rem', border: '1.5px solid #d1d5db', fontSize: '0.9rem' }}
            />
            <button
              type="submit"
              className="profile-save-btn"
              disabled={pwLoading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.2rem' }}
            >
              {pwLoading ? 'Setting up…' : 'Activate campus account'}
            </button>
          </form>
        </div>

        {/* ── Divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0.4rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.83rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* ── Card B: Google ── */}
        <div style={{
          border: '1.5px solid #e5e7eb', borderRadius: '1rem',
          padding: '1.2rem 1.4rem', marginTop: '0.4rem',
          background: '#fff'
        }}>
          <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem' }}>
            🌐 Google Account
          </h3>
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.85rem', color: '#6b7280' }}>
            Sign in instantly with your Google account — no password needed.
          </p>
          <button
            type="button"
            onClick={handleGoogleSetup}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.7rem', padding: '0.72rem 1rem', borderRadius: '0.7rem',
              border: '1.5px solid #d1d5db', background: '#fff',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              color: '#374151'
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

      </div>
    </div>
  )
}