import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { AlertCircleIcon, CheckIcon, GraduationCapIcon, SendIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Field, FieldGroup, FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'

export default function EnterUniversityIdPage() {
  const [searchParams] = useSearchParams()
  const pendingToken = searchParams.get('pendingToken') || ''
  const [universityId, setUniversityId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!universityId.trim()) { setError('Please enter your University ID.'); return }
    if (!pendingToken) { setError('Session expired. Please sign in with Google again.'); return }
    setError('')
    setLoading(true)
    try {
      await axios.post('http://localhost:8081/api/auth/submit-university-id', {
        pendingToken,
        universityId: universityId.trim(),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err?.response?.data || 'Something went wrong. Please try again.')
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
              <GraduationCapIcon />
            </div>
            <div>
              <CardTitle className="text-2xl">{submitted ? 'Request Submitted' : 'Almost there'}</CardTitle>
              <CardDescription>Smart Campus Operations Hub</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {submitted ? (
            <>
              <Alert>
                <CheckIcon />
                <AlertTitle>Registration request sent</AlertTitle>
                <AlertDescription>
                  University ID {universityId} submitted. Admin will review and approve your account.
                </AlertDescription>
              </Alert>
              <Button asChild variant="outline">
                <Link to="/login">Back to login</Link>
              </Button>
            </>
          ) : (
            <>
              <CardDescription>
                Google sign-in succeeded. Enter University ID to complete registration.
              </CardDescription>
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
                    <FieldLabel htmlFor="university-id">University ID</FieldLabel>
                    <Input id="university-id" value={universityId} onChange={(event) => setUniversityId(event.target.value)} placeholder="e.g. s12345" autoFocus required />
                  </Field>
                </FieldGroup>
                <Button type="submit" className="mt-4 w-full" disabled={loading}>
                  <SendIcon data-icon="inline-start" />
                  {loading ? 'Submitting...' : 'Submit Registration Request'}
                </Button>
              </form>
              <Button asChild variant="ghost">
                <Link to="/login">Back to login</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
