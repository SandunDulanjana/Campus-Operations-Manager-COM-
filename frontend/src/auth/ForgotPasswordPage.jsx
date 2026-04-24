import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/authApi'

export default function ForgotPasswordPage() {
  const [email, setEmail]               = useState('')
  const [universityId, setUniversityId] = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [sent, setSent]                 = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (!universityId.trim()) { setError('Please enter your University ID.'); return }
    setLoading(true); setError('')
    try {
      await forgotPassword(email.trim(), universityId.trim())
      setSent(true)
    } catch (err) {
      setError(err?.response?.data || 'Request failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand" style={{ marginBottom: '1.5rem' }}>
          <div style={{
            width: '3rem', height: '3rem', borderRadius: '0.85rem',
            background: 'linear-gradient(145deg, var(--accent-700), var(--brand-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(20,108,105,0.22)'
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <h1 className="login-title" style={{ fontSize: '1.3rem' }}>Reset Password</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Smart Campus Operations Hub</p>
          </div>
        </div>

        {!sent ? (
          <>
            <p style={{ margin: '0 0 1.2rem', color: '#374151', fontSize: '0.92rem', lineHeight: 1.55 }}>
              Enter your registered email and University ID to receive a password reset link.
            </p>
            {error && <p className="login-error">{error}</p>}
            <form className="login-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, color: '#374151' }}>
                Registered Email
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  autoFocus
                  required
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, color: '#374151' }}>
                University ID
                <input
                  type="text"
                  value={universityId}
                  onChange={e => setUniversityId(e.target.value)}
                  placeholder="e.g. s12345"
                  required
                />
              </label>
              <button
                type="submit"
                className="profile-save-btn"
                disabled={loading}
                style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Sending link…' : 'Send Reset Link'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.88rem' }}>
              <Link to="/login" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
                ← Back to login
              </Link>
            </p>
          </>
        ) : (
          <>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.85rem',
              padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'center'
            }}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.6rem', display: 'block' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#166534', fontSize: '1.05rem' }}>
                Check Your Inbox!
              </h3>
              <p style={{ margin: '0.5rem 0 0', color: '#166534', fontSize: '0.88rem', lineHeight: 1.5 }}>
                A password reset link has been sent to <strong>{email}</strong>. 
                Please check your email and follow the instructions to reset your password.
              </p>
            </div>

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>

            <Link
              to="/login"
              style={{
                display: 'block', textAlign: 'center', padding: '0.78rem',
                background: 'linear-gradient(135deg, var(--brand-600), var(--accent-700))',
                color: '#fff', borderRadius: '0.9rem', fontWeight: 700,
                textDecoration: 'none', marginBottom: '0.75rem',
                boxShadow: '0 8px 16px rgba(15, 118, 110, 0.2)'
              }}
            >
              Return to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}