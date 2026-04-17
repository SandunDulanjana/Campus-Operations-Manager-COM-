import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { updateProfile, updatePassword, updateProfilePicture } from '../api/profileApi'

// ── small icon helpers ────────────────────────────────────────────────────────
function Icon({ kind }) {
  if (kind === 'camera')   return <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  if (kind === 'user')     return <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  if (kind === 'lock')     return <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  if (kind === 'mail')     return <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
  if (kind === 'phone')    return <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.4h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.1 6.1l1.96-1.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  if (kind === 'building') return <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  if (kind === 'check')    return <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
  if (kind === 'eye')      return <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  if (kind === 'eye-off')  return <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  if (kind === 'google')   return <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  return null
}

// ── compress image via canvas before uploading ────────────────────────────────
function compressImage(file, maxWidth = 400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1)
        canvas.width  = img.width  * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── role badge colour map ─────────────────────────────────────────────────────
const ROLE_COLOURS = {
  ADMIN:          { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  TECHNICIAN:     { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
  MAINTENANCEMNG: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  RECOURSEMNG:    { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  BOOKINGMNG:     { bg: '#fce7f3', color: '#9d174d', border: '#f9a8d4' },
  USER:           { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
}

function RoleBadge({ role }) {
  const s = ROLE_COLOURS[role] ?? ROLE_COLOURS.USER
  return (
    <span className="profile-role-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {role}
    </span>
  )
}

// ── reusable field row ────────────────────────────────────────────────────────
function FieldRow({ iconKind, label, value, locked, children }) {
  return (
    <div className="profile-field-row">
      <label className="profile-field-label">
        <span className="profile-field-icon"><Icon kind={iconKind} /></span>
        {label}
        {locked && <span className="profile-field-locked-badge">locked</span>}
      </label>
      {locked
        ? <div className="profile-field-locked">{value || <span className="profile-field-empty">—</span>}</div>
        : children}
    </div>
  )
}

// ── password input with show/hide toggle ─────────────────────────────────────
function PasswordInput({ id, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="profile-pw-wrap">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className="profile-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
      />
      <button type="button" className="profile-pw-eye" onClick={() => setShow(s => !s)} aria-label="Toggle password">
        <Icon kind={show ? 'eye-off' : 'eye'} />
      </button>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name:       user?.name       || '',
    phone:      user?.phone      || '',
    department: user?.department || '',
  })
  const [profileLoading,  setProfileLoading]  = useState(false)
  const [profileSuccess,  setProfileSuccess]  = useState('')
  const [profileError,    setProfileError]    = useState('')

  // Password form state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError,   setPwError]   = useState('')

  // Picture state
  const [picLoading,  setPicLoading]  = useState(false)
  const [picError,    setPicError]    = useState('')
  const fileInputRef = useRef(null)

  // Keep form in sync when user object changes (e.g. after picture upload)
  useEffect(() => {
    if (user) {
      setProfileForm({
        name:       user.name       || '',
        phone:      user.phone      || '',
        department: user.department || '',
      })
    }
  }, [user])

  const initials = user?.name
    ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  // ── picture upload ──────────────────────────────────────────────────────────
  async function handlePictureChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setPicError('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setPicError('Image must be less than 5 MB.'); return }

    setPicLoading(true)
    setPicError('')
    try {
      const compressed = await compressImage(file)
      const updated = await updateProfilePicture(compressed)
      updateUser(updated)
    } catch {
      setPicError('Failed to upload picture. Please try again.')
    } finally {
      setPicLoading(false)
      e.target.value = ''
    }
  }

  // ── profile info save ───────────────────────────────────────────────────────
  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileSuccess('')
    setProfileError('')
    try {
      const updated = await updateProfile(profileForm)
      updateUser(updated)
      setProfileSuccess('Profile updated successfully!')
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  // ── password save ───────────────────────────────────────────────────────────
  async function handlePasswordSave(e) {
    e.preventDefault()
    setPwSuccess('')
    setPwError('')
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }
    setPwLoading(true)
    try {
      await updatePassword({
        currentPassword: user?.hasPassword ? pwForm.currentPassword : undefined,
        newPassword: pwForm.newPassword,
      })
      setPwSuccess('Password updated successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwError(err?.response?.data || err?.response?.data?.message || 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="profile-page">

      {/* ── hero banner ───────────────────────────────────────── */}
      <div className="profile-hero">
        <div className="profile-hero-content">

          {/* picture */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-ring">
              {user?.profilePicture
                ? <img src={user.profilePicture} alt={user.name} className="profile-avatar-img" />
                : <span className="profile-avatar-initials">{initials}</span>
              }
              {picLoading && <div className="profile-avatar-overlay"><span className="profile-spinner" /></div>}
            </div>
            <button
              type="button"
              className="profile-camera-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile picture"
              disabled={picLoading}
            >
              <Icon kind="camera" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePictureChange}
            />
            {picError && <p className="profile-pic-error">{picError}</p>}
          </div>

          {/* hero copy */}
          <div className="profile-hero-info">
            <h1 className="profile-hero-name">{user?.name || '—'}</h1>
            <RoleBadge role={user?.role || 'USER'} />
            {user?.email && <p className="profile-hero-email">{user.email}</p>}
            {memberSince && <p className="profile-hero-since">Member since {memberSince}</p>}
            {!user?.hasPassword && (
              <div className="profile-google-badge">
                <span className="profile-google-icon"><Icon kind="google" /></span>
                <span>Signed in with Google</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── two-column body ───────────────────────────────────── */}
      <div className="profile-body">

        {/* ── LEFT: personal info ──────────────────────────────── */}
        <section className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon"><Icon kind="user" /></span>
            <div>
              <h2 className="profile-card-title">Personal Information</h2>
              <p className="profile-card-sub">Update your display name, phone and department</p>
            </div>
          </div>

          {profileSuccess && <p className="profile-banner success"><Icon kind="check" />{profileSuccess}</p>}
          {profileError   && <p className="profile-banner error">{profileError}</p>}

          <form className="profile-form" onSubmit={handleProfileSave}>

            <FieldRow iconKind="mail" label="Email address" locked value={user?.email} />
            {user?.username && (
              <FieldRow iconKind="user" label="Username" locked value={user.username} />
            )}

            <FieldRow iconKind="user" label="Full name">
              <input
                className="profile-input"
                value={profileForm.name}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
                required
              />
            </FieldRow>

            <FieldRow iconKind="phone" label="Phone number">
              <input
                className="profile-input"
                value={profileForm.phone}
                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+94 77 123 4567"
                type="tel"
              />
            </FieldRow>

            <FieldRow iconKind="building" label="Department / Faculty">
              <input
                className="profile-input"
                value={profileForm.department}
                onChange={e => setProfileForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Faculty of Computing"
              />
            </FieldRow>

            <div className="profile-form-footer">
              <button type="submit" className="profile-save-btn" disabled={profileLoading}>
                {profileLoading ? <span className="profile-spinner profile-spinner-sm" /> : <Icon kind="check" />}
                {profileLoading ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        {/* ── RIGHT: change password ────────────────────────────── */}
        <section className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon"><Icon kind="lock" /></span>
            <div>
              <h2 className="profile-card-title">Change Password</h2>
              <p className="profile-card-sub">
                {user?.hasPassword
                  ? 'Update your campus account password'
                  : 'Set a campus password — your Google login stays unchanged'}
              </p>
            </div>
          </div>

          {pwSuccess && <p className="profile-banner success"><Icon kind="check" />{pwSuccess}</p>}
          {pwError   && <p className="profile-banner error">{pwError}</p>}

          {!user?.hasPassword && (
            <div className="profile-google-note">
              <Icon kind="google" />
              <span>You currently sign in with Google. Setting a password here will also let you log in with a username &amp; password — your Google login is unaffected.</span>
            </div>
          )}

          <form className="profile-form" onSubmit={handlePasswordSave}>

            {user?.hasPassword && (
              <FieldRow iconKind="lock" label="Current password">
                <PasswordInput
                  id="current-pw"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </FieldRow>
            )}

            <FieldRow iconKind="lock" label="New password">
              <PasswordInput
                id="new-pw"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="At least 8 characters"
              />
            </FieldRow>

            <FieldRow iconKind="lock" label="Confirm new password">
              <PasswordInput
                id="confirm-pw"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
              />
            </FieldRow>

            {pwForm.newPassword && (
              <div className="profile-pw-strength">
                <div className="pw-strength-bar">
                  {[8, 12, 16].map((threshold) => (
                    <span
                      key={threshold}
                      className={`pw-strength-seg${pwForm.newPassword.length >= threshold ? ' active' : ''}`}
                    />
                  ))}
                </div>
                <span className="pw-strength-label">
                  {pwForm.newPassword.length < 8 ? 'Too short'
                    : pwForm.newPassword.length < 12 ? 'Weak'
                    : pwForm.newPassword.length < 16 ? 'Good'
                    : 'Strong'}
                </span>
              </div>
            )}

            <div className="profile-form-footer">
              <button type="submit" className="profile-save-btn" disabled={pwLoading}>
                {pwLoading ? <span className="profile-spinner profile-spinner-sm" /> : <Icon kind="lock" />}
                {pwLoading ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  )
}