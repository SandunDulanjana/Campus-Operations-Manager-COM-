import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/authApi'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading]       = useState(false)
  const [devKeyword, setDevKeyword] = useState('')
  const [error, setError]           = useState('')
  const [sent, setSent]             = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!identifier.trim()) { setError('Please enter your username or email.'); return }
    setLoading(true); setError('')
    try {
      const data = await forgotPassword(identifier.trim())
      setDevKeyword(data.devKeyword || '')
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
              Enter your username or email address and we&apos;ll send you a reset keyword.
            </p>
            {error && <p className="login-error">{error}</p>}
            <form className="login-form" onSubmit={handleSubmit}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, color: '#374151' }}>
                Username or Email
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="e.g. s12345 or user@example.com"
                  autoFocus
                  required
                />
              </label>
              <button
                type="submit"
                className="profile-save-btn"
                disabled={loading}
                style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Sending…' : 'Send Reset Keyword'}
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
              padding: '1.1rem', marginBottom: '1rem', textAlign: 'center'
            }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem', display: 'block' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <p style={{ margin: 0, fontWeight: 700, color: '#166534', fontSize: '0.97rem' }}>
                Reset keyword sent!
              </p>
              <p style={{ margin: '0.3rem 0 0', color: '#166534', fontSize: '0.85rem' }}>
                Check your email for the keyword to reset your password.
              </p>
            </div>

            {/* Dev mode: show keyword */}
            {devKeyword && (
              <div style={{
                background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.72rem',
                padding: '0.85rem 1rem', marginBottom: '1rem'
              }}>
                <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: '#92400e', fontWeight: 700 }}>
                  🔧 Dev Mode — Your reset keyword:
                </p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.2em', color: '#78350f', textAlign: 'center' }}>
                  {devKeyword}
                </p>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.76rem', color: '#92400e', textAlign: 'center' }}>
                  In production this is emailed to the user
                </p>
              </div>
            )}

            <Link
              to="/reset-password"
              style={{
                display: 'block', textAlign: 'center', padding: '0.78rem',
                background: 'linear-gradient(135deg, var(--brand-600), var(--accent-700))',
                color: '#fff', borderRadius: '0.9rem', fontWeight: 700,
                textDecoration: 'none', marginBottom: '0.75rem'
              }}
            >
              Enter Reset Keyword →
            </Link>
            <p style={{ textAlign: 'center', fontSize: '0.88rem' }}>
              <Link to="/login" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
                ← Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}