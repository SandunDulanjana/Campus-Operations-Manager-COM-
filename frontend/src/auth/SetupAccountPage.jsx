import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircleIcon, CheckIcon, KeyRoundIcon, UserPlusIcon } from 'lucide-react'
import { validateInviteToken, completeInvite } from '../api/adminApi'
import { useAuth } from '../context/useAuth'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Field, FieldGroup, FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'
import { Separator } from '../components/ui/separator'
import { Skeleton } from '../components/ui/skeleton'

export default function SetupAccountPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const { login } = useAuth()
  const [info, setInfo] = useState(null)
  const [tokenError, setTokenError] = useState('')
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenError('No invite token found in this link.')
      setLoading(false)
      return
    }
    validateInviteToken(token)
      .then((data) => { setInfo(data); setLoading(false) })
      .catch((err) => {
        setTokenError(err?.response?.data || 'This invite link is invalid or has expired.')
        setLoading(false)
      })
  }, [token])

  async function handlePasswordSetup(event) {
    event.preventDefault()
    setPwError('')
    if (password.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    try {
      const data = await completeInvite(token, password)
      login(data)
      navigate('/', { replace: true })
    } catch (err) {
      setPwError(err?.response?.data || 'Something went wrong. Please try again.')
    } finally {
      setPwLoading(false)
    }
  }

  function handleGoogleSetup() {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google'
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </main>
    )
  }

  if (tokenError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid invite link</CardTitle>
            <CardDescription>Please contact your administrator for a new invite.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Invite unavailable</AlertTitle>
              <AlertDescription>{tokenError}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl border bg-muted">
              <UserPlusIcon />
            </div>
            <div>
              <CardTitle className="text-2xl">Set up your account</CardTitle>
              <CardDescription>Smart Campus Operations Hub</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert>
            <CheckIcon />
            <AlertTitle>Welcome, {info.name}</AlertTitle>
            <AlertDescription>You have been invited as {info.role}. Choose how to sign in.</AlertDescription>
          </Alert>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Campus Login</CardTitle>
              {info.username ? <CardDescription>University ID: {info.username}</CardDescription> : null}
            </CardHeader>
            <CardContent>
              {pwError ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Setup failed</AlertTitle>
                  <AlertDescription>{pwError}</AlertDescription>
                </Alert>
              ) : null}
              <form className="mt-3" onSubmit={handlePasswordSetup}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="setup-password">Password</FieldLabel>
                    <Input id="setup-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Choose password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="setup-confirm">Confirm Password</FieldLabel>
                    <Input id="setup-confirm" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm password" required />
                  </Field>
                </FieldGroup>
                <Button type="submit" className="mt-4 w-full" disabled={pwLoading}>
                  <KeyRoundIcon data-icon="inline-start" />
                  {pwLoading ? 'Setting up...' : 'Activate campus account'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Google Account</CardTitle>
              <CardDescription>Use your Google account without campus password.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSetup}>
                Continue with Google
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </main>
  )
}
