import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircleIcon, ArrowLeftIcon, KeyRoundIcon, ShieldIcon } from 'lucide-react'
import sliderImage1 from '../assets/home_image/1.jpg'
import sliderImage2 from '../assets/home_image/2.jpg'
import sliderImage3 from '../assets/home_image/3.jpg'
import { loginWithCredentials } from '../api/authApi'
import { verifyTwoFactorLogin } from '../api/twoFactorApi'
import { useAuth } from '../context/useAuth'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'
import { Separator } from '../components/ui/separator'
import { getAuthDestination } from '@/lib/auth'

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const sliderImages = [sliderImage1, sliderImage2, sliderImage3]
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  function getDestination(userData) {
    return getAuthDestination({
      user: userData,
      searchParams,
      locationState: location.state,
    })
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
    <main className="flex min-h-screen bg-background">
      {/* Left Side: Slider (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-end items-center relative p-12 overflow-hidden bg-slate-900">
        {/* Background Slider Images */}
        <div className="absolute inset-0 w-full h-full">
          {[sliderImage1, sliderImage2, sliderImage3].map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`Slider ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentImageIndex === idx ? 'opacity-100' : 'opacity-0'}`} 
            />
          ))}
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        {/* Overlaid Content */}
        <div className="relative z-10 text-center text-white mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif tracking-tight drop-shadow-md">
            Manage your institution Easily<br/>and perfectly !!
          </h2>
          <p className="text-slate-200 max-w-md mx-auto text-sm md:text-base leading-relaxed drop-shadow-sm">
            Trusted by the education industry since 2000.<br/>
            Over 800 implementation by our dedicated team.
          </p>
        </div>

        {/* Slider Dots */}
        <div className="absolute bottom-12 z-10 flex gap-3">
          {[0, 1, 2].map((idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`size-3 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-3 mb-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-xl bg-slate-900 text-white mb-2">
              <LoginBrandIcon />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Smart <span className="font-light">CAMPUS</span></h1>
              <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mt-2">Operations Hub</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
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
              <svg className="mr-2 size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
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
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
