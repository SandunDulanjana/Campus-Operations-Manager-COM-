import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { getProfile, updateProfile, updatePassword, updateProfilePicture } from '../api/profileApi'
import { setupTotp, verifyTotp, sendSmsOtp, verifyPhone, disable2FA, confirmPassword } from '../api/twoFactorApi'

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ kind, size = '1em' }) {
  const s = { width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0, display: 'block' }
  if (kind === 'camera')     return <svg viewBox="0 0 24 24" style={s}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  if (kind === 'user')       return <svg viewBox="0 0 24 24" style={s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  if (kind === 'lock')       return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  if (kind === 'mail')       return <svg viewBox="0 0 24 24" style={s}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
  if (kind === 'phone')      return <svg viewBox="0 0 24 24" style={s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.4h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.1 6.1l1.96-1.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  if (kind === 'building')   return <svg viewBox="0 0 24 24" style={s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  if (kind === 'check')      return <svg viewBox="0 0 24 24" style={s}><polyline points="20 6 9 17 4 12"/></svg>
  if (kind === 'eye')        return <svg viewBox="0 0 24 24" style={s}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  if (kind === 'eye-off')    return <svg viewBox="0 0 24 24" style={s}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  if (kind === 'shield')     return <svg viewBox="0 0 24 24" style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  if (kind === 'shield-on')  return <svg viewBox="0 0 24 24" style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
  if (kind === 'smartphone') return <svg viewBox="0 0 24 24" style={s}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
  if (kind === 'qr')         return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3"/><rect x="16" y="5" width="3" height="3"/><rect x="5" y="16" width="3" height="3"/><path d="M14 14h3v3"/><path d="M17 17h3v3"/><path d="M14 20h3"/></svg>
  if (kind === 'google')     return <svg viewBox="0 0 24 24" style={{ ...s, fill: 'none' }}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  return null
}

function compressImage(file, maxWidth = 400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1)
        canvas.width = img.width * ratio; canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject; img.src = e.target.result
    }
    reader.onerror = reject; reader.readAsDataURL(file)
  })
}

const ROLE_COLOURS = {
  ADMIN:          { bg: '#EEF2FC', color: '#6F86C7', border: '#DCE4F5' },
  TECHNICIAN:     { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  MAINTENANCEMNG: { bg: '#EFF6FF', color: '#1D4ED8', border: '#DBEAFE' },
  RECOURSEMNG:    { bg: '#ECFDF5', color: '#059669', border: '#D1FAE5' },
  BOOKINGMNG:     { bg: '#FFF1F2', color: '#E11D48', border: '#FFE4E6' },
  USER:           { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' },
}

function RoleBadge({ role }) {
  const s = ROLE_COLOURS[role] ?? ROLE_COLOURS.USER
  return <span className="profile-role-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>{role}</span>
}

function FieldRow({ iconKind, label, value, locked, children }) {
  return (
    <div className="profile-field-row">
      <label className="profile-field-label">
        <span className="profile-field-icon"><Icon kind={iconKind} /></span>
        {label}
        {locked && <span className="profile-field-locked-badge">locked</span>}
      </label>
      {locked ? <div className="profile-field-locked">{value || <span className="profile-field-empty">—</span>}</div> : children}
    </div>
  )
}

function PasswordInput({ id, value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false)
  return (
    <div className="profile-pw-wrap">
      <input id={id} type={show ? 'text' : 'password'} className="profile-input"
        value={value} onChange={onChange} placeholder={placeholder}
        autoComplete="new-password" required={required} />
      <button type="button" className="profile-pw-eye" onClick={() => setShow(s => !s)} aria-label="Toggle">
        <Icon kind={show ? 'eye-off' : 'eye'} />
      </button>
    </div>
  )
}

function Banner({ type, msg }) {
  if (!msg) return null
  return (
    <p className={`profile-banner ${type}`}>
      {type === 'success' && <Icon kind="check" size="1rem" />}
      {msg}
    </p>
  )
}

// ── Two-Factor Section ────────────────────────────────────────────────────────
function TwoFactorSection({ user, onStatusChange }) {
  const enabled = user?.twoFactorEnabled
  const method  = user?.twoFactorMethod
  const hasPassword = user?.hasPassword

  // Step tracking
  const [flow, setFlow]     = useState(null)     // null | 'SMS' | 'TOTP'
  const [step, setStep]     = useState('select') // 'select' | 'auth' | 'phone' | 'otp' | 'scan' | 'totp-verify'
  const [actionType, setActionType] = useState(null) // 'disable' | 'switch'

  // Form values
  const [authPassword, setAuthPassword] = useState('')
  const [phoneInput, setPhoneInput]     = useState('')
  const [qrData, setQrData]             = useState(null)
  const [totpSecret, setTotpSecret]     = useState('')
  const [devCode, setDevCode]           = useState('')
  const [code, setCode]                 = useState('')

  // Status
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState('')
  const [ok, setOk]     = useState('')

  function reset() {
    setFlow(null); setStep('select'); setActionType(null)
    setAuthPassword(''); setPhoneInput(''); setQrData(null)
    setTotpSecret(''); setDevCode(''); setCode('')
    setErr(''); setOk('')
  }

  // ── Password gate (Feature 2) ─────────────────────────────────────────────
  async function handlePasswordGate(e) {
    e.preventDefault()
    if (!authPassword.trim()) { setErr('Please enter your password.'); return }
    setBusy(true); setErr('')
    try {
      await confirmPassword(authPassword)
      // Password verified — proceed to next step
      if (actionType === 'disable') {
        await doDisable()
      } else if (actionType === 'switch') {
        setStep('select')
        setActionType(null)
        setAuthPassword('')
      }
    } catch (ex) {
      setErr(ex?.response?.data || 'Incorrect password. Please try again.')
    } finally { setBusy(false) }
  }

  async function doDisable() {
    setBusy(true)
    try {
      await disable2FA(authPassword)
      setOk('Two-step verification has been disabled.')
      onStatusChange()
      reset()
    } catch (ex) {
      setErr(ex?.response?.data || 'Failed to disable 2FA.')
    } finally { setBusy(false) }
  }

  function triggerDisable() {
    setErr(''); setOk('')
    if (!hasPassword) {
      // Google-only user — no password needed
      doDisable()
    } else {
      setActionType('disable')
      setStep('auth')
    }
  }

  function triggerSwitch() {
    setErr(''); setOk('')
    if (!hasPassword) {
      // Google-only — skip password gate
      setStep('select')
    } else {
      setActionType('switch')
      setStep('auth')
    }
  }

  // ── TOTP flow ─────────────────────────────────────────────────────────────
  async function startTotp() {
    setBusy(true); setErr('')
    try {
      const data = await setupTotp()
      setTotpSecret(data.secret); setQrData(data.qrCode)
      setFlow('TOTP'); setStep('scan')
    } catch { setErr('Failed to generate QR code. Please try again.') }
    finally { setBusy(false) }
  }

  async function confirmTotp(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      await verifyTotp(totpSecret, code)
      setOk('Authenticator app enabled! Your account is now protected.')
      onStatusChange(); reset()
    } catch (ex) { setErr(ex?.response?.data || 'Invalid code. Try again.') }
    finally { setBusy(false) }
  }

  // ── SMS flow (Feature 1) ──────────────────────────────────────────────────
  async function handleSendOtp(e) {
    e.preventDefault()
    if (!phoneInput.trim()) { setErr('Please enter your phone number.'); return }
    setBusy(true); setErr('')
    try {
      const data = await sendSmsOtp(phoneInput.trim())
      setDevCode(data.devCode || '')
      setStep('otp')
    } catch (ex) { setErr(ex?.response?.data || 'Failed to send OTP. Please try again.') }
    finally { setBusy(false) }
  }

  async function confirmSms(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      await verifyPhone(code)
      setOk('SMS two-step verification enabled successfully!')
      onStatusChange(); reset()
    } catch (ex) { setErr(ex?.response?.data || 'Invalid or expired code.') }
    finally { setBusy(false) }
  }

  return (
    <section className="profile-card tfa-card">
      <div className="profile-card-header">
        <span className="profile-card-icon tfa-icon">
          <Icon kind={enabled ? 'shield-on' : 'shield'} size="1.1rem" />
        </span>
        <div>
          <h2 className="profile-card-title">Two-Step Verification</h2>
          <p className="profile-card-sub">Add an extra layer of security to your account</p>
        </div>
        {enabled && (
          <span className="tfa-active-badge">
            <Icon kind="check" size="0.75rem" />
            Active · {method === 'TOTP' ? 'Authenticator App' : 'SMS'}
          </span>
        )}
      </div>

      <Banner type="success" msg={ok} />
      <Banner type="error"   msg={err} />

      {/* ── Password gate (Feature 2) ── */}
      {step === 'auth' && (
        <div className="tfa-setup-flow">
          <div className="tfa-step-header">
            <span className="tfa-step-num">🔒</span>
            <div>
              <strong>Confirm your identity</strong>
              <p>Enter your current password to {actionType === 'disable' ? 'disable' : 'change'} two-step verification</p>
            </div>
          </div>
          <form onSubmit={handlePasswordGate} className="tfa-code-form">
            <input
              className="profile-input"
              type="password"
              placeholder="Your current password"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              autoFocus
              required
            />
            <div className="tfa-form-actions">
              <button type="button" className="tfa-back-btn" onClick={reset}>← Cancel</button>
              <button type="submit" className="profile-save-btn" disabled={busy || !authPassword.trim()}>
                {busy ? 'Verifying…' : <><Icon kind="check" size="1rem" />Continue</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Enabled status (shown when no active flow) ── */}
      {enabled && step === 'select' && !flow && (
        <div className="tfa-enabled-state">
          <div className="tfa-enabled-info">
            <div className="tfa-method-icon">
              <Icon kind={method === 'TOTP' ? 'qr' : 'smartphone'} size="1.4rem" />
            </div>
            <div>
              <p className="tfa-method-label">{method === 'TOTP' ? 'Authenticator App' : 'SMS to Phone'}</p>
              <p className="tfa-method-sub">
                {method === 'TOTP'
                  ? 'Using Google Authenticator, Authy, or similar app'
                  : `Code sent to ${user?.phone || 'your registered phone'}`}
              </p>
            </div>
          </div>
          <div className="tfa-enabled-actions">
            <button className="tfa-switch-btn" onClick={triggerSwitch} disabled={busy}>Switch method</button>
            <button className="tfa-disable-btn" onClick={triggerDisable} disabled={busy}>
              {busy ? 'Disabling…' : 'Disable 2FA'}
            </button>
          </div>
        </div>
      )}

      {/* ── Method selection (when adding or switching) ── */}
      {(!enabled || (step === 'select' && actionType === null && !flow)) && step === 'select' && (
        <>
          <p className="tfa-intro-text">Choose how you&apos;d like to verify your identity each time you sign in:</p>
          <div className="tfa-methods">
            <button className="tfa-method-card" onClick={() => { setFlow('SMS'); setStep('phone') }} disabled={busy}>
              <div className="tfa-method-card-icon sms"><Icon kind="smartphone" size="1.5rem" /></div>
              <div className="tfa-method-card-body">
                <strong>SMS Code</strong>
                <span>Verify your phone number and receive a code each time you sign in</span>
              </div>
              <span className="tfa-method-card-arrow">→</span>
            </button>
            <button className="tfa-method-card" onClick={startTotp} disabled={busy}>
              <div className="tfa-method-card-icon totp"><Icon kind="qr" size="1.5rem" /></div>
              <div className="tfa-method-card-body">
                <strong>Authenticator App</strong>
                <span>Use Google Authenticator, Authy, or any TOTP-compatible app</span>
              </div>
              <span className="tfa-method-card-arrow">→</span>
            </button>
          </div>
          {enabled && (
            <button type="button" onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.88rem', padding: 0 }}>
              ← Cancel
            </button>
          )}
        </>
      )}

      {/* ── SMS: Phone number entry (Feature 1 - Step 1) ── */}
      {flow === 'SMS' && step === 'phone' && (
        <div className="tfa-setup-flow">
          <div className="tfa-step-header">
            <span className="tfa-step-num">1</span>
            <div>
              <strong>Enter your mobile number</strong>
              <p>We&apos;ll send a 6-digit verification code to confirm this number</p>
            </div>
          </div>
          <form onSubmit={handleSendOtp} className="tfa-code-form">
            <input
              className="profile-input"
              type="tel"
              placeholder="+94 77 123 4567"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              autoFocus
              required
            />
            <div className="tfa-form-actions">
              <button type="button" className="tfa-back-btn" onClick={reset}>← Back</button>
              <button type="submit" className="profile-save-btn" disabled={busy || !phoneInput.trim()}>
                {busy ? 'Sending…' : <><Icon kind="smartphone" size="1rem" />Send OTP</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SMS: OTP verification (Feature 1 - Step 2) ── */}
      {flow === 'SMS' && step === 'otp' && (
        <div className="tfa-setup-flow">
          <div className="tfa-step-header">
            <span className="tfa-step-num">2</span>
            <div>
              <strong>Enter the verification code</strong>
              <p>Code sent to <strong>{phoneInput}</strong> — expires in 10 minutes</p>
            </div>
          </div>
          {devCode && (
            <div className="tfa-dev-banner">
              <span>🔧 Dev Mode — Code:</span>
              <strong style={{ letterSpacing: '0.18em' }}>{devCode}</strong>
              <span style={{ opacity: 0.7, fontSize: '0.78rem' }}>(use SMS in production)</span>
            </div>
          )}
          <form onSubmit={confirmSms} className="tfa-code-form">
            <input className="tfa-code-input" type="text" inputMode="numeric" maxLength={6}
              placeholder="000000" value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus required />
            <div className="tfa-form-actions">
              <button type="button" className="tfa-back-btn" onClick={() => { setStep('phone'); setCode(''); setDevCode('') }}>← Back</button>
              <button type="submit" className="profile-save-btn" disabled={busy || code.length !== 6}>
                {busy ? 'Activating…' : <><Icon kind="shield-on" size="1rem" />Activate</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TOTP: Scan QR ── */}
      {flow === 'TOTP' && step === 'scan' && (
        <div className="tfa-setup-flow">
          <div className="tfa-step-header">
            <span className="tfa-step-num">1</span>
            <div><strong>Scan QR Code</strong><p>Open your authenticator app and scan the code below</p></div>
          </div>
          {qrData && (
            <div className="tfa-qr-wrap">
              <img src={qrData} alt="Scan in authenticator app" className="tfa-qr-img" />
              <div className="tfa-qr-apps">
                <span>Compatible with:</span>
                <strong>Google Authenticator · Authy · Microsoft Authenticator</strong>
              </div>
            </div>
          )}
          <div className="tfa-step-header" style={{ marginTop: '1.2rem' }}>
            <span className="tfa-step-num">2</span>
            <div><strong>Enter the 6-digit code</strong><p>Type the code shown in your app to confirm setup</p></div>
          </div>
          <form onSubmit={confirmTotp} className="tfa-code-form">
            <input className="tfa-code-input" type="text" inputMode="numeric" maxLength={6}
              placeholder="000000" value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus required />
            <div className="tfa-form-actions">
              <button type="button" className="tfa-back-btn" onClick={reset}>← Back</button>
              <button type="submit" className="profile-save-btn" disabled={busy || code.length !== 6}>
                {busy ? 'Activating…' : <><Icon kind="shield-on" size="1rem" />Activate</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

// ── Main ProfilePage ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  // Feature 3 FIX: always initialize form from empty strings; useEffect + API fetch sets real values
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', department: '', emailNotificationsEnabled: true })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError,   setProfileError]   = useState('')

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError,   setPwError]   = useState('')

  const [picLoading, setPicLoading] = useState(false)
  const [picError,   setPicError]   = useState('')
  const fileInputRef = useRef(null)

  // Feature 3 FIX: fetch fresh data from API on every mount — this ensures
  // phone and department (not included in LoginResponse) are always populated.
  useEffect(() => {
    let cancelled = false
    getProfile().then(fresh => {
      if (cancelled) return
      updateUser(fresh)
      setProfileForm({
        name:       fresh.name       || '',
        phone:      fresh.phone      || '',
        department: fresh.department || '',
        emailNotificationsEnabled: fresh.emailNotificationsEnabled ?? true,
      })
    }).catch(() => {
      // Fallback to context user if API fails (e.g. token expired)
      if (user) setProfileForm({ 
        name: user.name || '', 
        phone: user.phone || '', 
        department: user.department || '', 
        emailNotificationsEnabled: user.emailNotificationsEnabled ?? true 
      })
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  async function handlePictureChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setPicError('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024)    { setPicError('Image must be less than 5 MB.');  return }
    setPicLoading(true); setPicError('')
    try {
      const compressed = await compressImage(file)
      const updated = await updateProfilePicture(compressed)
      updateUser(updated)
    } catch { setPicError('Failed to upload picture.') }
    finally { setPicLoading(false); e.target.value = '' }
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileLoading(true); setProfileSuccess(''); setProfileError('')
    try {
      const updated = await updateProfile(profileForm)
      // Feature 3 FIX: update context AND explicitly sync form from response
      updateUser(updated)
      setProfileForm({
        name:       updated.name       || '',
        phone:      updated.phone      || '',
        department: updated.department || '',
        emailNotificationsEnabled: updated.emailNotificationsEnabled ?? true,
      })
      setProfileSuccess('Profile updated successfully!')
    } catch (err) {
      setProfileError(err?.response?.data?.message || err?.response?.data || 'Failed to update profile.')
    } finally { setProfileLoading(false) }
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    setPwSuccess(''); setPwError('')

    // Feature 4 FIX: enforce current password is entered and non-empty
    if (user?.hasPassword && !pwForm.currentPassword.trim()) {
      setPwError('Please enter your current password.')
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('New passwords do not match.'); return }
    if (pwForm.newPassword.length < 8)                 { setPwError('Password must be at least 8 characters.'); return }

    setPwLoading(true)
    try {
      await updatePassword({
        currentPassword: user?.hasPassword ? pwForm.currentPassword : undefined,
        newPassword:     pwForm.newPassword,
      })
      setPwSuccess('Password updated successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      // Backend returns plain string for 400 errors
      setPwError(err?.response?.data || err?.response?.data?.message || 'Failed to update password.')
    } finally { setPwLoading(false) }
  }

  async function handleTwoFactorChange() {
    try {
      const updated = await getProfile()
      updateUser(updated)
      setProfileForm({
        name:       updated.name       || '',
        phone:      updated.phone      || '',
        department: updated.department || '',
      })
    } catch { /* silent */ }
  }

  return (
    <div className="profile-page">

      {/* ── Hero ── */}
      <div className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-ring">
              {user?.profilePicture
                ? <img src={user.profilePicture} alt={user.name} className="profile-avatar-img" />
                : <span className="profile-avatar-initials">{initials}</span>}
              {picLoading && <div className="profile-avatar-overlay"><span className="profile-spinner" /></div>}
            </div>
            <button type="button" className="profile-camera-btn" onClick={() => fileInputRef.current?.click()} disabled={picLoading} aria-label="Upload photo">
              <Icon kind="camera" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePictureChange} />
            {picError && <p className="profile-pic-error">{picError}</p>}
          </div>

          <div className="profile-hero-info">
            <h1 className="profile-hero-name">{user?.name || '—'}</h1>
            <RoleBadge role={user?.role || 'USER'} />
            {user?.email     && <p className="profile-hero-email">{user.email}</p>}
            {memberSince     && <p className="profile-hero-since">Member since {memberSince}</p>}
            {user?.twoFactorEnabled && (
              <span className="profile-2fa-hero-badge">
                <Icon kind="shield-on" size="0.85rem" />
                2FA Active · {user.twoFactorMethod === 'TOTP' ? 'Authenticator App' : 'SMS'}
              </span>
            )}
            {!user?.hasPassword && (
              <div className="profile-google-badge">
                <span className="profile-google-icon"><Icon kind="google" /></span>
                <span>Signed in with Google</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body Grid ── */}
      <div className="profile-body">

        {/* Personal Info */}
        <section className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon"><Icon kind="user" size="1.1rem" /></span>
            <div>
              <h2 className="profile-card-title">Personal Information</h2>
              <p className="profile-card-sub">Update your display name, phone and department</p>
            </div>
          </div>
          <Banner type="success" msg={profileSuccess} />
          <Banner type="error"   msg={profileError} />
          <form className="profile-form" onSubmit={handleProfileSave}>
            <FieldRow iconKind="mail" label="Email address" locked value={user?.email} />
            {user?.username && <FieldRow iconKind="user" label="University ID" locked value={user.username} />}
            <FieldRow iconKind="user" label="Full name">
              <input className="profile-input" value={profileForm.name}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name" required />
            </FieldRow>
            <FieldRow iconKind="phone" label="Phone number">
              <input className="profile-input" type="tel" value={profileForm.phone}
                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+94 77 123 4567" />
            </FieldRow>
            <FieldRow iconKind="building" label="Department / Faculty">
              <input className="profile-input" value={profileForm.department}
                onChange={e => setProfileForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Faculty of Computing" />
            </FieldRow>

            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={profileForm.emailNotificationsEnabled}
                  onChange={e => setProfileForm(f => ({ ...f, emailNotificationsEnabled: e.target.checked }))}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--brand-600)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>Receive Email Notifications</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Get updates about bookings, tickets, and comments. Registration and password alerts are always sent.</div>
                </div>
              </label>
            </div>

            <div className="profile-form-footer">
              <button type="submit" className="profile-save-btn" disabled={profileLoading}>
                {profileLoading
                  ? <><span className="profile-spinner profile-spinner-sm" />Saving…</>
                  : <><Icon kind="check" size="1rem" />Save changes</>}
              </button>
            </div>
          </form>
        </section>

        {/* Change Password */}
        <section className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon"><Icon kind="lock" size="1.1rem" /></span>
            <div>
              <h2 className="profile-card-title">Change Password</h2>
              <p className="profile-card-sub">
                {user?.hasPassword ? 'Update your campus account password' : 'Set a campus password — Google login stays unchanged'}
              </p>
            </div>
          </div>
          <Banner type="success" msg={pwSuccess} />
          <Banner type="error"   msg={pwError} />
          {!user?.hasPassword && (
            <div className="profile-google-note">
              <Icon kind="google" />
              <span>You currently sign in with Google. Setting a password here also enables campus login — your Google login is unaffected.</span>
            </div>
          )}
          <form className="profile-form" onSubmit={handlePasswordSave}>
            {/* Feature 4: always show current password field for users who have one */}
            {user?.hasPassword && (
              <FieldRow iconKind="lock" label="Current password">
                <PasswordInput id="current-pw" value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="Enter current password" required />
              </FieldRow>
            )}
            <FieldRow iconKind="lock" label="New password">
              <PasswordInput id="new-pw" value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="At least 8 characters" required />
            </FieldRow>
            <FieldRow iconKind="lock" label="Confirm new password">
              <PasswordInput id="confirm-pw" value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password" required />
            </FieldRow>
            {pwForm.newPassword && (
              <div className="profile-pw-strength">
                <div className="pw-strength-bar">
                  {[8, 12, 16].map(t => (
                    <span key={t} className={`pw-strength-seg${pwForm.newPassword.length >= t ? ' active' : ''}`} />
                  ))}
                </div>
                <span className="pw-strength-label">
                  {pwForm.newPassword.length < 8 ? 'Too short' : pwForm.newPassword.length < 12 ? 'Weak' : pwForm.newPassword.length < 16 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}
            <div className="profile-form-footer">
              <button type="submit" className="profile-save-btn" disabled={pwLoading}>
                {pwLoading
                  ? <><span className="profile-spinner profile-spinner-sm" />Updating…</>
                  : <><Icon kind="lock" size="1rem" />Update password</>}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* ── Two-Factor (full width) ── */}
      <TwoFactorSection user={user} onStatusChange={handleTwoFactorChange} />
    </div>
  )
}