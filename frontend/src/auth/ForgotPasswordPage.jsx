import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircleIcon, ArrowLeftIcon, CheckIcon, LockKeyholeIcon, SendIcon } from 'lucide-react'
import { forgotPassword } from '../api/authApi'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Field, FieldGroup, FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (!universityId.trim()) { setError('Please enter your University ID.'); return }
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email.trim(), universityId.trim())
      setSent(true)
    } catch (err) {
      setError(err?.response?.data || 'Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl border bg-muted">
              <LockKeyholeIcon />
            </div>
            <div>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>Smart Campus Operations Hub</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!sent ? (
            <>
              <CardDescription>Enter your registered email and University ID to receive reset instructions.</CardDescription>
              {error ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Request failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="forgot-email">Registered Email</FieldLabel>
                    <Input id="forgot-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@example.com" autoFocus required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="forgot-university-id">University ID</FieldLabel>
                    <Input id="forgot-university-id" value={universityId} onChange={(event) => setUniversityId(event.target.value)} placeholder="e.g. s12345" required />
                  </Field>
                </FieldGroup>
                <Button type="submit" className="mt-4 w-full" disabled={loading}>
                  <SendIcon data-icon="inline-start" />
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </Button>
              </form>
              <Button variant="ghost" asChild>
                <Link to="/login">
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back to login
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Alert>
                <CheckIcon />
                <AlertTitle>Check your inbox</AlertTitle>
                <AlertDescription>A password reset link has been sent to {email}.</AlertDescription>
              </Alert>
              <CardDescription>Did not receive email? Check spam or try again in a few minutes.</CardDescription>
              <Button asChild>
                <Link to="/login">Return to Login</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
