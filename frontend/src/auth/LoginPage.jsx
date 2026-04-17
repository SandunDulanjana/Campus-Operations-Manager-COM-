import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithCredentials } from '../api/authApi'
import { verifyTwoFactorLogin } from '../api/twoFactorApi'
import { useAuth } from '../context/useAuth'

function LoginBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 16.5V8.2c0-.7.36-1.34.96-1.7L12 3.5l5.04 3c.6.36.96 1 .96 1.7v8.3c0 .7-.36 1.34-.96 1.7L12 21l-5.04-2.8A1.97 1.97 0 0 1 6 16.5Z" />
      <path d="M9.2 10.8 12 9l2.8 1.8V14L12 15.8 9.2 14v-3.2Z" />
      <path d="M12 3.5v5.4" />
    </svg>
  )
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // ── step 1: credentials ────────────────────────────────────────────────────
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  // ── step 2: 2FA code ───────────────────────────────────────────────────────
  const [twoFactorStep, setTwoFactorStep]       = useState(false)
  const [twoFactorMethod, setTwoFactorMethod]   = useState('')
  const [tempToken, setTempToken]               = useState('')
  const [devCode, setDevCode]                   = useState('')   // dev-mode only
  const [tfCode, setTfCode]                     = useState('')
  const [tfLoading, setTfLoading]               = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginWithCredentials(username, password)

      if (data.requiresTwoFactor) {
        setTwoFactorMethod(data.twoFactorMethod)
        setTempToken(data.tempToken)
        if (data.devCode) setDevCode(data.devCode) // dev only
        setTwoFactorStep(true)
        return
      }

      login({
        id: data.id, name: data.name, email: data.email,
        role: data.role, profilePicture: data.profilePicture,
      }, data.token)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify2FA(event) {
    event.preventDefault()
    setError('')
    setTfLoading(true)
    try {
      const data = await verifyTwoFactorLogin(tempToken, tfCode)
      login({
        id: data.id, name: data.name, email: data.email,
        role: data.role, profilePicture: data.profilePicture,
      }, data.token)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data || 'Invalid verification code. Please try again.')
    } finally {
      setTfLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon"><LoginBrandIcon /></div>
          <div>
            <h1 className="login-title">Smart Campus</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Operations Hub</p>
          </div>
        </div>

        {!twoFactorStep ? (
          // ── Step 1: Credentials ──────────────────────────────────────────
          <>
            <p style={{ margin: '0 0 1.2rem', color: '#374151', fontWeight: 600 }}>Sign in to your account</p>
            {error && <p className="login-error">{error}</p>}
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-inputs-row">
                <label>
                  Username
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. s12345"
                    autoComplete="username"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="profile-save-btn login-submit-btn"
                disabled={loading}
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              {/* ← ADD THIS BLOCK */}
              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <a href="/forgot-password" 
                  style={{ fontSize: '0.85rem', color: 'var(--brand-600)', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </a>
              </div>
              
            </form>
            
            

            <div className="login-divider">or</div>
            <button
              type="button"
              className="google-login-btn"
              onClick={() => { window.location.href = 'http://localhost:8081/oauth2/authorization/google' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </>
        ) : (
          // ── Step 2: 2FA Code ─────────────────────────────────────────────
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <div style={{
                width: '3.2rem', height: '3.2rem', borderRadius: '999px',
                background: 'linear-gradient(135deg, var(--brand-600), var(--accent-700))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.85rem', boxShadow: '0 8px 20px rgba(20,108,105,0.22)'
              }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-strong)', fontWeight: 700 }}>
                Two-Step Verification
              </h2>
              <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {twoFactorMethod === 'SMS'
                  ? 'Enter the 6-digit code sent to your phone'
                  : 'Enter the code from your authenticator app'}
              </p>
            </div>

            {/* Dev mode notice */}
            {devCode && (
              <div style={{
                background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.65rem',
                padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#92400e'
              }}>
                <strong>🔧 Dev Mode:</strong> Your code is <strong style={{ letterSpacing: '0.12em' }}>{devCode}</strong>
                <span style={{ display: 'block', marginTop: '0.2rem', fontSize: '0.78rem', opacity: 0.75 }}>
                  In production this would be sent via SMS
                </span>
              </div>
            )}

            {error && <p className="login-error">{error}</p>}

            <form className="login-form" onSubmit={handleVerify2FA}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, color: '#374151' }}>
                Verification Code
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={tfCode}
                  onChange={e => setTfCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  style={{ letterSpacing: '0.25em', fontSize: '1.3rem', textAlign: 'center', padding: '0.7rem' }}
                  autoFocus
                  required
                />
              </label>
              <button
                type="submit"
                className="profile-save-btn"
                disabled={tfLoading || tfCode.length !== 6}
                style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
              >
                {tfLoading ? 'Verifying…' : 'Verify & Sign in'}
              </button>
              <button
                type="button"
                onClick={() => { setTwoFactorStep(false); setError(''); setTfCode(''); setDevCode('') }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.88rem', marginTop: '0.5rem' }}
              >
                ← Back to login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginPage