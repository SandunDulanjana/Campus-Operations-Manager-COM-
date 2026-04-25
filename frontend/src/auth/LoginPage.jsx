import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircleIcon, ArrowLeftIcon, KeyRoundIcon, ShieldIcon } from 'lucide-react'
import { loginWithCredentials } from '../api/authApi'
import { verifyTwoFactorLogin } from '../api/twoFactorApi'
import { useAuth } from '../context/useAuth'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'
import { Separator } from '../components/ui/separator'

function LoginBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-current stroke-2">
      <path d="M6 16.5V8.2c0-.7.36-1.34.96-1.7L12 3.5l5.04 3c.6.36.96 1 .96 1.7v8.3c0 .7-.36 1.34-.96 1.7L12 21l-5.04-2.8A1.97 1.97 0 0 1 6 16.5Z" />
      <path d="M9.2 10.8 12 9l2.8 1.8V14L12 15.8 9.2 14v-3.2Z" />
      <path d="M12 3.5v5.4" />
    </svg>
  )
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [twoFactorStep, setTwoFactorStep] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [devCode, setDevCode] = useState('')
  const [tfCode, setTfCode] = useState('')
  const [tfLoading, setTfLoading] = useState(false)

  function getRoleHome(userData) {
    if (!userData) return '/'
    if (userData.role === 'ADMIN') return '/admin/dashboard'
    if (userData.role === 'TECHNICIAN') return '/technician/dashboard'
    if (userData.role === 'MAINTENANCEMNG') return '/maintenance-dashboard'
    if (userData.role === 'RECOURSEMNG') return '/resource-dashboard'
    if (userData.role === 'BOOKINGMNG') return '/booking-dashboard'
    return '/'
  }

  function getDestination(userData) {
    const returnTo = searchParams.get('returnTo')
    if (returnTo) return decodeURIComponent(returnTo)
    const fromPath = location.state?.from?.pathname
    if (fromPath && fromPath !== '/login') return fromPath
    return getRoleHome(userData)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginWithCredentials(username, password)

      if (data.requiresTwoFactor) {
        setTwoFactorMethod(data.twoFactorMethod)
        setTempToken(data.tempToken)
        if (data.devCode) setDevCode(data.devCode)
        setTwoFactorStep(true)
        return
      }

      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        profilePicture: data.profilePicture,
      }
      login(userData, data.token)
      navigate(getDestination(userData), { replace: true })
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
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        profilePicture: data.profilePicture,
      }
      login(userData, data.token)
      navigate(getDestination(userData), { replace: true })
    } catch (err) {
      setError(err?.response?.data || 'Invalid verification code. Please try again.')
    } finally {
      setTfLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl border bg-muted text-foreground">
              <LoginBrandIcon />
            </div>
            <div>
              <CardTitle className="text-2xl">Smart Campus</CardTitle>
              <CardDescription>Operations Hub</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {!twoFactorStep ? (
            <>
              <Alert>
                <KeyRoundIcon />
                <AlertTitle>New user?</AlertTitle>
                <AlertDescription>
                  Use Continue with Google and enter your University ID. Account activates after admin approval.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="username">University ID</FieldLabel>
                    <Input
                      id="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="e.g. s12345"
                      autoComplete="username"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Your password"
                      autoComplete="current-password"
                      required
                    />
                  </Field>
                </FieldGroup>
                <div className="mt-4 flex flex-col gap-3">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                  <Link className="text-right text-sm font-medium text-primary hover:underline" to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>
              </form>

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => { window.location.href = 'http://localhost:8081/oauth2/authorization/google' }}
              >
                Continue with Google
              </Button>
            </>
          ) : (
            <form onSubmit={handleVerify2FA}>
              <FieldGroup>
                <Field>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-12 items-center justify-center rounded-xl border bg-muted">
                      <ShieldIcon />
                    </div>
                    <div>
                      <CardTitle>Two-Step Verification</CardTitle>
                      <FieldDescription>
                        {twoFactorMethod === 'SMS'
                          ? 'Enter the 6-digit code sent to your phone.'
                          : 'Enter the code from your authenticator app.'}
                      </FieldDescription>
                    </div>
                  </div>
                </Field>
                {devCode ? (
                  <Alert>
                    <KeyRoundIcon />
                    <AlertTitle>Dev mode</AlertTitle>
                    <AlertDescription>Your code is {devCode}. In production this would be sent via SMS.</AlertDescription>
                  </Alert>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="two-factor-code">Verification Code</FieldLabel>
                  <Input
                    id="two-factor-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={tfCode}
                    onChange={(event) => setTfCode(event.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="text-center text-lg tracking-[0.35em]"
                    autoFocus
                    required
                  />
                </Field>
              </FieldGroup>
              <div className="mt-4 flex flex-col gap-2">
                <Button type="submit" disabled={tfLoading || tfCode.length !== 6}>
                  {tfLoading ? 'Verifying...' : 'Verify & Sign in'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setTwoFactorStep(false); setError(''); setTfCode(''); setDevCode('') }}
                >
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back to login
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default LoginPage
