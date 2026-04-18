import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword } from '../api/authApi'

export default function ResetPasswordPage() {
  const navigate  = useNavigate()
  const [keyword, setKeyword]         = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(false)

  const strength = newPassword.length < 8 ? 'Too short' : newPassword.length < 12 ? 'Weak' : newPassword.length < 16 ? 'Good' : 'Strong'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!keyword.trim())                    { setError('Please enter your reset keyword.');          return }
    if (newPassword.length < 8)             { setError('Password must be at least 8 characters.');  return }
    if (newPassword !== confirm)            { setError('Passwords do not match.');                   return }

    setLoading(true)
    try {
      await resetPassword(keyword.trim().toUpperCase(), newPassword)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err?.response?.data || 'Failed to reset password. Please try again.')
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h1 className="login-title" style={{ fontSize: '1.3rem' }}>New Password</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Smart Campus Operations Hub</p>
          </div>
        </div>

        {!success ? (
          <>
            <p style={{ margin: '0 0 1.2rem', color: '#374151', fontSize: '0.92rem', lineHeight: 1.55 }}>
              Enter the reset keyword from your email and choose a new password.
            </p>
            {error && <p className="login-error">{error}</p>}
            <form className="login-form" onSubmit={handleSubmit}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, color: '#374151' }}>
                Reset Keyword
                <input
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g. ABC12345"
                  style={{ letterSpacing: '0.18em', fontWeight: 700, fontSize: '1.1rem' }}
                  maxLength={8}
                  autoFocus
                  required
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, color: '#374151' }}>
                New Password
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
                {newPassword && (
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', marginTop: '0.25rem' }}>
                    {[8, 12, 16].map(t => (
                      <div key={t} style={{
                        flex: 1, height: 4, borderRadius: 999,
                        background: newPassword.length >= t ? 'var(--brand-500)' : '#e2e8f0',
                        transition: 'background 200ms'
                      }} />
                    ))}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, minWidth: '4rem' }}>
                      {strength}
                    </span>
                  </div>
                )}
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, color: '#374151' }}>
                Confirm Password
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  required
                />
              </label>
              <button
                type="submit"
                className="profile-save-btn"
                disabled={loading}
                style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Resetting…' : 'Set New Password'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.88rem' }}>
              <Link to="/" style={{ color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>
                Home
              </Link>
              {' · '}
              <Link to="/forgot-password" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
                Request a new keyword
              </Link>
              {' · '}
              <Link to="/login" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
                Back to login
              </Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.75rem', display: 'block' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h2 style={{ margin: '0 0 0.5rem', color: '#166534' }}>Password reset!</h2>
            <p style={{ margin: '0 0 1rem', color: '#374151', fontSize: '0.92rem' }}>
              Your password has been updated. Redirecting to login…
            </p>
            <Link to="/login" className="profile-save-btn" style={{ display: 'inline-flex', justifyContent: 'center', textDecoration: 'none' }}>
              Go to Login
            </Link>
            <p style={{ marginTop: '0.85rem' }}>
              <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Back to home</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
