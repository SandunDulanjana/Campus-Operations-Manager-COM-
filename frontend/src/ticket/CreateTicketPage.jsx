import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircleIcon, ArrowLeftIcon, ImagePlusIcon, SendIcon, XIcon } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { fetchActiveResources } from '../api/resourceApi'
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  createTicket,
  formatTicketLabel,
  uploadAttachment,
} from '../api/ticketApi'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'

const EMPTY_SELECT_VALUE = '__none__'

function CreateTicketPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [resources, setResources] = useState([])
  const [resLoading, setResLoading] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    resourceId: '',
    location: '',
    contactName: user?.name || '',
    contactEmail: user?.email || '',
    contactPhone: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setError] = useState('')
  const [successMsg, setOk] = useState('')

  useEffect(() => {
    void loadResources()
  }, [])

  async function loadResources() {
    setResLoading(true)
    try {
      setResources(await fetchActiveResources())
    } catch {
      setResources([])
    } finally {
      setResLoading(false)
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function handleResourceChange(resourceId) {
    const nextResourceId = resourceId === EMPTY_SELECT_VALUE ? '' : resourceId
    updateField('resourceId', nextResourceId)
    if (!nextResourceId) {
      updateField('location', '')
      return
    }
    const selected = resources.find((resource) => String(resource.id) === String(nextResourceId))
    if (selected?.location) {
      updateField('location', selected.location)
    }
  }

  function handleFileChange(event) {
    const selected = Array.from(event.target.files)
    const combined = [...files, ...selected].slice(0, 3)
    setFiles(combined)
    setPreviews(combined.map((file) => URL.createObjectURL(file)))
    event.target.value = ''
  }

  function removeFile(index) {
    setFiles(files.filter((_, currentIndex) => currentIndex !== index))
    setPreviews(previews.filter((_, currentIndex) => currentIndex !== index))
  }

  function validateForm() {
    const errors = {}
    if (!form.title.trim()) errors.title = 'Title is required'
    if (!form.description.trim()) errors.description = 'Description is required'
    if (!form.category) errors.category = 'Please select a category'
    if (!form.priority) errors.priority = 'Please select a priority'
    if (!form.location.trim()) errors.location = 'Location is required'
    if (!form.contactName.trim()) errors.contactName = 'Your name is required'
    if (!form.contactEmail.trim()) errors.contactEmail = 'Email is required'
    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setOk('')

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Please fill in all required fields highlighted below.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setFieldErrors({})
    setLoading(true)

    try {
      const ticket = await createTicket(form)
      for (const file of files) {
        await uploadAttachment(ticket.id, file)
      }
      setOk(`Ticket #${ticket.id} submitted successfully!`)
      setTimeout(() => navigate('/tickets/my'), 1500)
    } catch (err) {
      const fieldErrs = err?.response?.data?.fieldErrors
      if (fieldErrs) {
        setFieldErrors(fieldErrs)
        setError('Please fix the errors highlighted below.')
      } else {
        setError(err?.response?.data?.message || 'Failed to submit ticket. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <Card>
        <CardHeader className="gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit">Incident intake</Badge>
            <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">Report an Incident</CardTitle>
            <CardDescription>Submit a maintenance or fault report for a campus facility or equipment.</CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate('/tickets/my')}>
            <ArrowLeftIcon data-icon="inline-start" />
            My Tickets
          </Button>
        </CardHeader>
      </Card>

      {errorMsg ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Validation failed</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      ) : null}

      {successMsg ? (
        <Alert>
          <SendIcon />
          <AlertTitle>Ticket submitted</AlertTitle>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Ticket Details</CardTitle>
          <CardDescription>Use clear location and evidence so technicians can triage faster.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={Boolean(fieldErrors.title)}>
                <FieldLabel htmlFor="ticket-title">Title *</FieldLabel>
                <Input
                  id="ticket-title"
                  aria-invalid={Boolean(fieldErrors.title)}
                  placeholder="e.g. Projector not working in Lab 3"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                />
                <FieldError message={fieldErrors.title} />
              </Field>

              <Field data-invalid={Boolean(fieldErrors.description)}>
                <FieldLabel htmlFor="ticket-description">Description *</FieldLabel>
                <Textarea
                  id="ticket-description"
                  aria-invalid={Boolean(fieldErrors.description)}
                  placeholder="Describe the problem clearly: what happened, when, and what you already tried."
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                />
                <FieldError message={fieldErrors.description} />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field data-invalid={Boolean(fieldErrors.category)}>
                  <FieldLabel>Category *</FieldLabel>
                  <Select
                    value={form.category || EMPTY_SELECT_VALUE}
                    onValueChange={(value) => updateField('category', value === EMPTY_SELECT_VALUE ? '' : value)}
                  >
                    <SelectTrigger aria-invalid={Boolean(fieldErrors.category)} className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={EMPTY_SELECT_VALUE}>Select category</SelectItem>
                        {TICKET_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>{formatTicketLabel(category)}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError message={fieldErrors.category} />
                </Field>

                <Field data-invalid={Boolean(fieldErrors.priority)}>
                  <FieldLabel>Priority *</FieldLabel>
                  <Select
                    value={form.priority || EMPTY_SELECT_VALUE}
                    onValueChange={(value) => updateField('priority', value === EMPTY_SELECT_VALUE ? '' : value)}
                  >
                    <SelectTrigger aria-invalid={Boolean(fieldErrors.priority)} className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={EMPTY_SELECT_VALUE}>Select priority</SelectItem>
                        {TICKET_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError message={fieldErrors.priority} />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Resource Name</FieldLabel>
                  <Select
                    value={form.resourceId || EMPTY_SELECT_VALUE}
                    onValueChange={handleResourceChange}
                    disabled={resLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={resLoading ? 'Loading resources...' : 'Select resource'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={EMPTY_SELECT_VALUE}>
                          {resLoading ? 'Loading resources...' : 'Select a resource (optional)'}
                        </SelectItem>
                        {resources.map((resource) => (
                          <SelectItem key={resource.id} value={String(resource.id)}>
                            {resource.name} - {resource.type?.replaceAll('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Location fills automatically when available.</FieldDescription>
                </Field>

                <Field data-invalid={Boolean(fieldErrors.location)}>
                  <FieldLabel htmlFor="ticket-location">Location *</FieldLabel>
                  <Input
                    id="ticket-location"
                    aria-invalid={Boolean(fieldErrors.location)}
                    placeholder="e.g. Lab 3, Floor 2, Block A"
                    value={form.location}
                    onChange={(event) => updateField('location', event.target.value)}
                  />
                  <FieldError message={fieldErrors.location} />
                </Field>
              </div>

              <Field>
                <FieldLabel>Contact Details</FieldLabel>
                <FieldDescription>Name and email are pre-filled from your account.</FieldDescription>
              </Field>

              <div className="grid gap-4 md:grid-cols-3">
                <Field data-invalid={Boolean(fieldErrors.contactName)}>
                  <FieldLabel htmlFor="ticket-contact-name">Your Name *</FieldLabel>
                  <Input
                    id="ticket-contact-name"
                    aria-invalid={Boolean(fieldErrors.contactName)}
                    placeholder="Full name"
                    value={form.contactName}
                    onChange={(event) => updateField('contactName', event.target.value)}
                  />
                  <FieldError message={fieldErrors.contactName} />
                </Field>

                <Field data-invalid={Boolean(fieldErrors.contactEmail)}>
                  <FieldLabel htmlFor="ticket-contact-email">Email *</FieldLabel>
                  <Input
                    id="ticket-contact-email"
                    type="email"
                    aria-invalid={Boolean(fieldErrors.contactEmail)}
                    placeholder="your@email.com"
                    value={form.contactEmail}
                    onChange={(event) => updateField('contactEmail', event.target.value)}
                  />
                  <FieldError message={fieldErrors.contactEmail} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="ticket-contact-phone">Phone Number</FieldLabel>
                  <Input
                    id="ticket-contact-phone"
                    type="tel"
                    placeholder="07X XXX XXXX"
                    value={form.contactPhone}
                    onChange={(event) => updateField('contactPhone', event.target.value)}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Photo Evidence</FieldLabel>
                <FieldDescription>Maximum 3 images.</FieldDescription>
                {previews.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {previews.map((url, index) => (
                      <div key={url} className="relative">
                        <img
                          src={url}
                          alt={`preview-${index + 1}`}
                          className="size-24 rounded-lg border object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-xs"
                          className="absolute -right-2 -top-2"
                          onClick={() => removeFile(index)}
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          <XIcon />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                {files.length < 3 ? (
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current.click()}>
                    <ImagePlusIcon data-icon="inline-start" />
                    Add Photo ({files.length}/3)
                  </Button>
                ) : (
                  <FieldDescription>Maximum 3 photos reached.</FieldDescription>
                )}
              </Field>
            </FieldGroup>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button type="submit" disabled={loading}>
                <SendIcon data-icon="inline-start" />
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
              <Button variant="outline" type="button" onClick={() => navigate('/tickets/my')} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <FieldDescription className="text-destructive">{message}</FieldDescription>
}

export default CreateTicketPage
