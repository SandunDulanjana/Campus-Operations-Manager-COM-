import { useEffect, useRef, useState } from 'react'
import {
  BadgeCheckIcon,
  Building2Icon,
  CameraIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SmartphoneIcon,
  UserIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field as UiField,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getProfile, updatePassword, updateProfile, updateProfilePicture } from '../api/profileApi'
import { confirmPassword, disable2FA, sendSmsOtp, setupTotp, verifyPhone, verifyTotp } from '../api/twoFactorApi'
import { useAuth } from '../context/useAuth'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function compressImage(file, maxWidth = 400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = event.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function formatMemberSince(createdAt) {
  if (!createdAt) return 'Unknown'
  return new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Feedback({ type, message }) {
  if (!message) return null
  return (
    <Alert variant={type === 'error' ? 'destructive' : 'default'}>
      {type === 'error' ? <ShieldIcon /> : <CheckIcon />}
      <AlertTitle>{type === 'error' ? 'Request failed' : 'Saved'}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
        <Icon />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value || '-'}</p>
      </div>
    </div>
  )
}

function ProfileField({ icon: Icon, label, children }) {
  return (
    <UiField>
      <FieldLabel>
        <Icon />
        {label}
      </FieldLabel>
      {children}
    </UiField>
  )
}

function PasswordInput({ value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
        required={required}
        className="pr-9"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-1 -translate-y-1/2"
        onClick={() => setShow((current) => !current)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}

function PasswordStrength({ password }) {
  if (!password) return null

  const label = password.length < 8
    ? 'Too short'
    : password.length < 12
      ? 'Weak'
      : password.length < 16
        ? 'Good'
        : 'Strong'

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1">
        {[8, 12, 16].map((target) => (
          <span
            key={target}
            className={password.length >= target ? 'h-1.5 flex-1 rounded-full bg-primary' : 'h-1.5 flex-1 rounded-full bg-muted'}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

function TwoFactorSection({ user, onStatusChange }) {
  const enabled = user?.twoFactorEnabled
  const method = user?.twoFactorMethod
  const hasPassword = user?.hasPassword
  const [flow, setFlow] = useState(null)
  const [step, setStep] = useState('select')
  const [actionType, setActionType] = useState(null)
  const [authPassword, setAuthPassword] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [qrData, setQrData] = useState(null)
  const [totpSecret, setTotpSecret] = useState('')
  const [devCode, setDevCode] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  function reset() {
    setFlow(null)
    setStep('select')
    setActionType(null)
    setAuthPassword('')
    setPhoneInput('')
    setQrData(null)
    setTotpSecret('')
    setDevCode('')
    setCode('')
    setErr('')
    setOk('')
  }

  async function doDisable() {
    setBusy(true)
    try {
      await disable2FA(authPassword)
      setOk('Two-step verification has been disabled.')
      onStatusChange()
      reset()
    } catch (ex) {
      setErr(ex?.response?.data || 'Failed to disable two-step verification.')
    } finally {
      setBusy(false)
    }
  }

  async function handlePasswordGate(event) {
    event.preventDefault()
    if (!authPassword.trim()) {
      setErr('Please enter your password.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      await confirmPassword(authPassword)
      if (actionType === 'disable') {
        await doDisable()
      } else {
        setStep('select')
        setActionType(null)
        setAuthPassword('')
      }
    } catch (ex) {
      setErr(ex?.response?.data || 'Incorrect password. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function triggerDisable() {
    setErr('')
    setOk('')
    if (!hasPassword) {
      void doDisable()
      return
    }
    setActionType('disable')
    setStep('auth')
  }

  function triggerSwitch() {
    setErr('')
    setOk('')
    if (!hasPassword) {
      setStep('select')
      return
    }
    setActionType('switch')
    setStep('auth')
  }

  async function startTotp() {
    setBusy(true)
    setErr('')
    try {
      const data = await setupTotp()
      setTotpSecret(data.secret)
      setQrData(data.qrCode)
      setFlow('TOTP')
      setStep('scan')
    } catch {
      setErr('Failed to generate QR code. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function confirmTotp(event) {
    event.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await verifyTotp(totpSecret, code)
      setOk('Authenticator app enabled.')
      onStatusChange()
      reset()
    } catch (ex) {
      setErr(ex?.response?.data || 'Invalid code. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSendOtp(event) {
    event.preventDefault()
    if (!phoneInput.trim()) {
      setErr('Please enter your phone number.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      const data = await sendSmsOtp(phoneInput.trim())
      setDevCode(data.devCode || '')
      setStep('otp')
    } catch (ex) {
      setErr(ex?.response?.data || 'Failed to send OTP. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function confirmSms(event) {
    event.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await verifyPhone(code)
      setOk('SMS two-step verification enabled.')
      onStatusChange()
      reset()
    } catch (ex) {
      setErr(ex?.response?.data || 'Invalid or expired code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              {enabled ? <ShieldCheckIcon /> : <ShieldIcon />}
            </span>
            <div>
              <CardTitle>Two-step verification</CardTitle>
              <CardDescription>Add extra protection to your account.</CardDescription>
            </div>
          </div>
          {enabled ? (
            <Badge variant="secondary" className="w-fit">
              <BadgeCheckIcon data-icon="inline-start" />
              Active · {method === 'TOTP' ? 'Authenticator app' : 'SMS'}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Feedback type="success" message={ok} />
        <Feedback type="error" message={err} />

        {step === 'auth' ? (
          <form onSubmit={handlePasswordGate} className="rounded-lg border p-4">
            <FieldGroup>
            <div>
              <p className="font-medium">Confirm identity</p>
              <p className="text-sm text-muted-foreground">
                Enter current password to {actionType === 'disable' ? 'disable' : 'change'} two-step verification.
              </p>
            </div>
            <PasswordInput
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Current password"
              required
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={reset}>Cancel</Button>
              <Button type="submit" disabled={busy || !authPassword.trim()}>
                {busy ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <CheckIcon data-icon="inline-start" />}
                Continue
              </Button>
            </div>
            </FieldGroup>
          </form>
        ) : null}

        {enabled && step === 'select' && !flow ? (
          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                {method === 'TOTP' ? <QrCodeIcon /> : <SmartphoneIcon />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{method === 'TOTP' ? 'Authenticator app' : 'SMS to phone'}</p>
                <p className="text-sm text-muted-foreground">
                  {method === 'TOTP' ? 'Using a TOTP-compatible app.' : `Code sent to ${user?.phone || 'your registered phone'}.`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={triggerSwitch} disabled={busy}>Switch method</Button>
              <Button variant="destructive" onClick={triggerDisable} disabled={busy}>Disable 2FA</Button>
            </div>
          </div>
        ) : null}

        {(!enabled || (step === 'select' && actionType === null && !flow)) && step === 'select' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 p-4 text-left"
              onClick={() => {
                setFlow('SMS')
                setStep('phone')
              }}
              disabled={busy}
            >
              <SmartphoneIcon />
              <span>
                <span className="block font-medium">SMS code</span>
                <span className="block text-xs text-muted-foreground">Verify with a phone code.</span>
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 p-4 text-left"
              onClick={startTotp}
              disabled={busy}
            >
              <QrCodeIcon />
              <span>
                <span className="block font-medium">Authenticator app</span>
                <span className="block text-xs text-muted-foreground">Use Google Authenticator or Authy.</span>
              </span>
            </Button>
          </div>
        ) : null}

        {flow === 'SMS' && step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="rounded-lg border p-4">
            <FieldGroup>
            <ProfileField icon={PhoneIcon} label="Mobile number">
              <Input
                type="tel"
                placeholder="+94 77 123 4567"
                value={phoneInput}
                onChange={(event) => setPhoneInput(event.target.value)}
                autoFocus
                required
              />
            </ProfileField>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={reset}>Back</Button>
              <Button type="submit" disabled={busy || !phoneInput.trim()}>
                {busy ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <SmartphoneIcon data-icon="inline-start" />}
                Send OTP
              </Button>
            </div>
            </FieldGroup>
          </form>
        ) : null}

        {flow === 'SMS' && step === 'otp' ? (
          <form onSubmit={confirmSms} className="rounded-lg border p-4">
            <FieldGroup>
            {devCode ? (
              <Alert>
                <KeyRoundIcon />
                <AlertTitle>Dev code</AlertTitle>
                <AlertDescription>{devCode}</AlertDescription>
              </Alert>
            ) : null}
            <ProfileField icon={KeyRoundIcon} label="Verification code">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
            </ProfileField>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setStep('phone')
                setCode('')
                setDevCode('')
              }}>Back</Button>
              <Button type="submit" disabled={busy || code.length !== 6}>
                {busy ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <ShieldCheckIcon data-icon="inline-start" />}
                Activate
              </Button>
            </div>
            </FieldGroup>
          </form>
        ) : null}

        {flow === 'TOTP' && step === 'scan' ? (
          <form onSubmit={confirmTotp} className="rounded-lg border p-4">
            <FieldGroup>
            {qrData ? (
              <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/40 p-4">
                <img src={qrData} alt="Scan in authenticator app" className="size-48 rounded-lg border bg-background p-2" />
                <p className="text-center text-xs text-muted-foreground">
                  Compatible with Google Authenticator, Authy, and Microsoft Authenticator.
                </p>
              </div>
            ) : null}
            <ProfileField icon={KeyRoundIcon} label="Authenticator code">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
            </ProfileField>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={reset}>Back</Button>
              <Button type="submit" disabled={busy || code.length !== 6}>
                {busy ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <ShieldCheckIcon data-icon="inline-start" />}
                Activate
              </Button>
            </div>
            </FieldGroup>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    department: '',
    emailNotificationsEnabled: true,
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [picLoading, setPicLoading] = useState(false)
  const [picError, setPicError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((fresh) => {
        if (cancelled) return
        updateUser(fresh)
        setProfileForm({
          name: fresh.name || '',
          phone: fresh.phone || '',
          department: fresh.department || '',
          emailNotificationsEnabled: fresh.emailNotificationsEnabled ?? true,
        })
      })
      .catch(() => {
        if (user) {
          setProfileForm({
            name: user.name || '',
            phone: user.phone || '',
            department: user.department || '',
            emailNotificationsEnabled: user.emailNotificationsEnabled ?? true,
          })
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initials = getInitials(user?.name)
  const memberSince = formatMemberSince(user?.createdAt)

  async function handlePictureChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPicError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPicError('Image must be less than 5 MB.')
      return
    }
    setPicLoading(true)
    setPicError('')
    try {
      const compressed = await compressImage(file)
      const updated = await updateProfilePicture(compressed)
      updateUser(updated)
    } catch {
      setPicError('Failed to upload picture.')
    } finally {
      setPicLoading(false)
      event.target.value = ''
    }
  }

  async function handleProfileSave(event) {
    event.preventDefault()
    setProfileLoading(true)
    setProfileSuccess('')
    setProfileError('')
    try {
      const updated = await updateProfile(profileForm)
      updateUser(updated)
      setProfileForm({
        name: updated.name || '',
        phone: updated.phone || '',
        department: updated.department || '',
        emailNotificationsEnabled: updated.emailNotificationsEnabled ?? true,
      })
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      setProfileError(err?.response?.data?.message || err?.response?.data || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordSave(event) {
    event.preventDefault()
    setPwSuccess('')
    setPwError('')

    if (user?.hasPassword && !pwForm.currentPassword.trim()) {
      setPwError('Please enter your current password.')
      return
    }
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
      setPwSuccess('Password updated successfully.')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwError(err?.response?.data || err?.response?.data?.message || 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  async function handleTwoFactorChange() {
    try {
      const updated = await getProfile()
      updateUser(updated)
      setProfileForm({
        name: updated.name || '',
        phone: updated.phone || '',
        department: updated.department || '',
        emailNotificationsEnabled: updated.emailNotificationsEnabled ?? true,
      })
    } catch {
      // keep current profile state
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="flex flex-col justify-between gap-8 border-b bg-muted/30 p-6 lg:border-r lg:border-b-0">
              <div className="flex flex-col gap-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Account Center</p>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">Profile settings</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Manage identity, security, and campus account preferences.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="size-20 border bg-background">
                    <AvatarImage src={user?.profilePicture || ''} alt={user?.name || 'Profile picture'} />
                    <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="icon-sm"
                    className="absolute -right-1 -bottom-1 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={picLoading}
                    aria-label="Upload profile photo"
                  >
                    {picLoading ? <Loader2Icon className="animate-spin" /> : <CameraIcon />}
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold">{user?.name || '-'}</h2>
                  <p className="truncate text-sm text-muted-foreground">{user?.email || '-'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge>{user?.role || 'USER'}</Badge>
                    {user?.twoFactorEnabled ? (
                      <Badge variant="secondary">
                        <ShieldCheckIcon data-icon="inline-start" />
                        2FA active
                      </Badge>
                    ) : null}
                    {!user?.hasPassword ? (
                      <Badge variant="outline">
                        <GoogleMark />
                        Google
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <Feedback type="error" message={picError} />
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2">
              <InfoRow icon={MailIcon} label="Email" value={user?.email} />
              <InfoRow icon={UserIcon} label="University ID" value={user?.username} />
              <InfoRow icon={Building2Icon} label="Department" value={user?.department} />
              <InfoRow icon={BadgeCheckIcon} label="Member since" value={memberSince} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="m-0">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>Update display name, phone, department, and notification preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave}>
                <FieldGroup>
                <Feedback type="success" message={profileSuccess} />
                <Feedback type="error" message={profileError} />
                <div className="grid gap-4 md:grid-cols-2">
                  <ProfileField icon={UserIcon} label="Full name">
                    <Input
                      value={profileForm.name}
                      onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Your full name"
                      required
                    />
                  </ProfileField>
                  <ProfileField icon={PhoneIcon} label="Phone number">
                    <Input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="+94 77 123 4567"
                    />
                  </ProfileField>
                </div>
                <ProfileField icon={Building2Icon} label="Department / Faculty">
                  <Input
                    value={profileForm.department}
                    onChange={(event) => setProfileForm((current) => ({ ...current, department: event.target.value }))}
                    placeholder="Faculty of Computing"
                  />
                </ProfileField>
                <UiField orientation="horizontal" className="rounded-lg border p-4">
                  <FieldContent>
                    <FieldTitle>Receive email notifications</FieldTitle>
                    <FieldDescription>
                      Booking, ticket, and comment updates. Registration and password alerts are always sent.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={profileForm.emailNotificationsEnabled}
                    onCheckedChange={(checked) =>
                      setProfileForm((current) => ({ ...current, emailNotificationsEnabled: checked }))
                    }
                    aria-label="Receive email notifications"
                  />
                </UiField>
                <div className="flex justify-end">
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <CheckIcon data-icon="inline-start" />}
                    Save changes
                  </Button>
                </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="m-0">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Campus password</CardTitle>
                <CardDescription>
                  {user?.hasPassword ? 'Update campus login password.' : 'Set campus password while keeping Google login.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSave}>
                  <FieldGroup>
                  <Feedback type="success" message={pwSuccess} />
                  <Feedback type="error" message={pwError} />
                  {!user?.hasPassword ? (
                    <Alert>
                      <GoogleMark />
                      <AlertTitle>Google account</AlertTitle>
                      <AlertDescription>
                        Setting password enables campus login. Google login remains available.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  {user?.hasPassword ? (
                    <ProfileField icon={LockIcon} label="Current password">
                      <PasswordInput
                        value={pwForm.currentPassword}
                        onChange={(event) => setPwForm((current) => ({ ...current, currentPassword: event.target.value }))}
                        placeholder="Enter current password"
                        required
                      />
                    </ProfileField>
                  ) : null}
                  <ProfileField icon={LockIcon} label="New password">
                    <PasswordInput
                      value={pwForm.newPassword}
                      onChange={(event) => setPwForm((current) => ({ ...current, newPassword: event.target.value }))}
                      placeholder="At least 8 characters"
                      required
                    />
                  </ProfileField>
                  <ProfileField icon={LockIcon} label="Confirm new password">
                    <PasswordInput
                      value={pwForm.confirmPassword}
                      onChange={(event) => setPwForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      placeholder="Re-enter new password"
                      required
                    />
                  </ProfileField>
                  <PasswordStrength password={pwForm.newPassword} />
                  <Separator />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={pwLoading}>
                      {pwLoading ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <LockIcon data-icon="inline-start" />}
                      Update password
                    </Button>
                  </div>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>

            <TwoFactorSection user={user} onStatusChange={handleTwoFactorChange} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
