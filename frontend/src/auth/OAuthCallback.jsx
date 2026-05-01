import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { AlertCircleIcon, CheckCircle2Icon, ClockIcon, Loader2Icon } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { getRoleHome } from '@/lib/auth'

function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()
  const hasProcessed = useRef(false)
  const status = searchParams.get('status')
  const token = searchParams.get('token')
  const pendingToken = searchParams.get('pendingToken')
  const reason = searchParams.get('reason')

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    if (status === 'needs_university_id' && pendingToken) {
      navigate(`/enter-university-id?pendingToken=${encodeURIComponent(pendingToken)}`, { replace: true })
      return
    }

    if (status === 'pending_approval' || status === 'rejected' || status === 'disabled') {
      return
    }

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    axios.defaults.headers.common.Authorization = `Bearer ${token}`
    axios.get('http://localhost:8081/api/auth/me')
      .then((res) => {
        login(res.data, token)
        setTimeout(() => navigate(getRoleHome(res.data), { replace: true }), 200)
      })
      .catch(() => navigate('/login', { replace: true }))
  }, [status, token, pendingToken, login, navigate])

  if (status === 'pending_approval') {
    return (
      <AuthStatusCard
        icon={ClockIcon}
        title="Registration Pending"
        description="Your registration request is waiting for admin approval. You will receive an email once your account is activated."
      />
    )
  }

  if (status === 'rejected') {
    return (
      <AuthStatusCard
        icon={AlertCircleIcon}
        title="Registration Declined"
        description="Your registration request was not approved."
        reason={reason}
        destructive
      />
    )
  }

  if (status === 'disabled') {
    return (
      <AuthStatusCard
        icon={AlertCircleIcon}
        title="Account Disabled"
        description="Your account has been disabled. Please contact your administrator."
        destructive
      />
    )
  }

  return (
    <AuthStatusCard
      icon={Loader2Icon}
      title="Signing you in"
      description="Please wait while we complete Google authentication."
      loading
    />
  )
}

function AuthStatusCard({ icon: Icon, title, description, reason, destructive = false, loading = false }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-xl border bg-muted">
            <Icon className={loading ? 'animate-spin' : undefined} />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {reason ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Reason</AlertTitle>
              <AlertDescription>{reason}</AlertDescription>
            </Alert>
          ) : null}
          {!loading ? (
            <>
              {!destructive ? (
                <Alert>
                  <CheckCircle2Icon />
                  <AlertTitle>Request received</AlertTitle>
                  <AlertDescription>Check your email for the next step.</AlertDescription>
                </Alert>
              ) : null}
              <Button asChild variant="outline">
                <Link to="/login">Back to login</Link>
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}

export default OAuthCallback
