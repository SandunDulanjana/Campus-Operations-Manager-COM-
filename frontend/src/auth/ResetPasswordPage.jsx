import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircleIcon, CheckIcon, KeyRoundIcon } from 'lucide-react'
import { resetPassword } from '../api/authApi'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const kw = searchParams.get('keyword')
    if (kw) setKeyword(kw.toUpperCase())
  }, [searchParams])

  const strength = newPassword.length < 8 ? 'Too short' : newPassword.length < 12 ? 'Weak' : newPassword.length < 16 ? 'Good' : 'Strong'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!keyword.trim()) { setError('Please enter your reset keyword.'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      await resetPassword(keyword.trim().toUpperCase(), newPassword)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err?.response?.data || 'Failed to reset password. Please try again.')
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
              <KeyRoundIcon />
            </div>
            <div>
              <CardTitle className="text-2xl">New Password</CardTitle>
              <CardDescription>Smart Campus Operations Hub</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!success ? (
            <>
              <CardDescription>
                {searchParams.get('keyword')
                  ? 'Identity verified. Choose your new password below.'
                  : 'Enter reset keyword from email and choose new password.'}
              </CardDescription>
              {error ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Reset failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  {!searchParams.get('keyword') ? (
                    <Field>
                      <FieldLabel htmlFor="reset-keyword">Reset Keyword</FieldLabel>
                      <Input
                        id="reset-keyword"
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        placeholder="ABC12345"
                        className="font-semibold tracking-[0.18em]"
                        maxLength={8}
                        autoFocus
                        required
                      />
                    </Field>
                  ) : null}
                  <Field>
                    <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                    <Input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 8 characters" autoComplete="new-password" required />
                    {newPassword ? <FieldDescription>Strength: {strength}</FieldDescription> : null}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                    <Input id="confirm-password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Re-enter new password" autoComplete="new-password" required />
                  </Field>
                </FieldGroup>
                <Button type="submit" className="mt-4 w-full" disabled={loading}>
                  {loading ? 'Resetting...' : 'Set New Password'}
                </Button>
              </form>
              <div className="flex justify-center gap-2 text-sm">
                <Link className="font-medium text-primary hover:underline" to="/forgot-password">Request new keyword</Link>
                <span className="text-muted-foreground">·</span>
                <Link className="font-medium text-primary hover:underline" to="/login">Back to login</Link>
              </div>
            </>
          ) : (
            <>
              <Alert>
                <CheckIcon />
                <AlertTitle>Password reset</AlertTitle>
                <AlertDescription>Your password has been updated. Redirecting to login.</AlertDescription>
              </Alert>
              <Button asChild>
                <Link to="/login">Go to Login</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
