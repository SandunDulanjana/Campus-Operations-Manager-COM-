import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function EnterUniversityIdPage() {
  const [searchParams]       = useSearchParams()
  const pendingToken         = searchParams.get('pendingToken') || ''

  const [universityId, setUniversityId] = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [submitted, setSubmitted]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!universityId.trim()) { setError('Please enter your University ID.'); return }
    if (!pendingToken)        { setError('Session expired. Please sign in with Google again.'); return }
    setError(''); setLoading(true)
    try {
      await axios.post('http://localhost:8081/api/auth/submit-university-id', {
        pendingToken,
        universityId: universityId.trim()
      })
      setSubmitted(true)
    } catch (err) {
      setError(err?.response?.data || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  if (submitted) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>✅</div>
          <h2 style={{ margin: '0 0 0.5rem' }}>Request Submitted!</h2>
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
            Your registration request has been submitted with University ID&nbsp;
            <strong style={{ color: '#1f2937' }}>{universityId}</strong>.
          </p>
          <div style={{
            background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.75rem',
            padding: '0.9rem 1rem', margin: '1rem 0', textAlign: 'left'
          }}>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#92400e', lineHeight: 1.55 }}>
              ⏳ <strong>Please wait</strong> — an admin will review and approve your account.
              You will receive an email with your temporary password once approved.
            </p>
          </div>
          <Link to="/login" style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand" style={{ marginBottom: '1.4rem' }}>
          <div style={{
            width: '3rem', height: '3rem', borderRadius: '0.85rem',
            background: 'linear-gradient(145deg, var(--accent-700), var(--brand-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div>
            <h1 className="login-title" style={{ fontSize: '1.25rem', margin: 0 }}>
              Almost there!
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
              Smart Campus Operations Hub
            </p>
          </div>
        </div>

        <p style={{ margin: '0 0 1.2rem', color: '#374151', fontSize: '0.92rem', lineHeight: 1.6 }}>
          Google sign-in was successful. Please enter your <strong>University ID</strong> to complete registration.
          Your account will be activated after admin approval.
        </p>

        {error && (
          <p style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.65rem', padding: '0.65rem 0.9rem', margin: '0 0 1rem', fontSize: '0.88rem' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>
            University ID
            <input
              type="text"
              value={universityId}
              onChange={e => setUniversityId(e.target.value)}
              placeholder="e.g. s12345"
              autoFocus
              required
              style={{ padding: '0.68rem 0.9rem', borderRadius: '0.65rem', border: '1.5px solid #d1d5db', fontSize: '0.95rem' }}
            />
          </label>
          <button
            type="submit"
            className="profile-save-btn"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.2rem' }}
          >
            {loading ? 'Submitting…' : 'Submit Registration Request'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.1rem', fontSize: '0.86rem' }}>
          <Link to="/login" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}