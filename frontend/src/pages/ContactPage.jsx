import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailIcon, PhoneIcon, MapPinIcon, SendIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import CampusMark from '@/components/icons/CampusMark'

function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    agreeToPolicy: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-8 flex min-h-16 items-center justify-between py-3 md:mx-10 lg:mx-12">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-card text-foreground shadow-sm">
              <CampusMark className="size-6" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-semibold">Smart Campus</span>
              <span className="block truncate text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Operations Hub
              </span>
            </span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-8 py-12 md:mx-10 md:py-16 lg:mx-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:gap-12">
          
          {/* Left Column - Contact Info */}
          <div className="flex flex-col gap-6">
            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-8">
              <div className="relative z-10">
                <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Get in touch
                </h1>
                <p className="text-muted-foreground">
                  Our friendly team would love to hear from you.
                </p>
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 size-32 rounded-full bg-primary/10" />
              <div className="absolute bottom-4 right-12 size-16 rounded-full bg-primary/20" />
            </div>

            {/* Contact Info Cards */}
            <div className="flex flex-col gap-4">
              <Card>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MailIcon className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Email</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      support.smartcampus.lk
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PhoneIcon className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Phone</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      +94 11 754 4801
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPinIcon className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Office</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Smart Campus Operations Center,<br />
                      Main Administration Building
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <Card className="h-fit">
            <CardContent className="p-6">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Name Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="flex">
                      <div className="flex shrink-0 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                        LK
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+94 11 754 4801"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Leave us a message..."
                      rows={4}
                      required
                    />
                  </div>

                  {/* Privacy Policy Checkbox */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="policy"
                      checked={formData.agreeToPolicy}
                      onCheckedChange={(checked) => handleChange('agreeToPolicy', checked)}
                    />
                    <Label htmlFor="policy" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the{' '}
                      <Link to="#" className="text-primary hover:underline">
                        privacy policy
                      </Link>
                      .
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !formData.agreeToPolicy}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <SendIcon className="mr-2 size-4" />
                        Send message
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <MailIcon className="size-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-serif text-xl font-semibold text-foreground">
                      Message sent!
                    </h3>
                    <p className="text-muted-foreground">
                      We'll get back to you as soon as possible.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        message: '',
                        agreeToPolicy: false,
                      })
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default ContactPage
