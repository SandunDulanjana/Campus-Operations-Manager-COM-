import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import ActionButton from '../components/ui/ActionButton'
import StatusBanner from '../components/ui/StatusBanner'
import { fetchActiveResources } from '../api/resourceApi'
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  createTicket,
  formatTicketLabel,
  uploadAttachment,
} from '../api/ticketApi'

// Red border + shadow style for invalid fields
const ERROR_STYLE = {
  borderColor: '#dc2626',
  boxShadow: '0 0 0 3px rgba(220,38,38,0.12)',
}

// Small red error message shown below a field
function FieldError({ message }) {
  if (!message) return null
  return (
    <span style={{
      color: '#dc2626',
      fontSize: '0.78rem',
      marginTop: '0.2rem',
      display: 'block',
      fontWeight: 500,
    }}>
      ⚠ {message}
    </span>
  )
}

function CreateTicketPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [resources, setResources]   = useState([])
  const [resLoading, setResLoading] = useState(true)

  const [form, setForm] = useState({
    title:        '',
    description:  '',
    category:     '',
    priority:     '',
    resourceId:   '',
    location:     '',
    contactName:  user?.name  || '',
    contactEmail: user?.email || '',
    contactPhone: '',
  })

  // Tracks which fields have validation errors
  const [fieldErrors, setFieldErrors] = useState({})

  const [files, setFiles]       = useState([])
  const [previews, setPreviews] = useState([])
  const fileInputRef            = useRef(null)
  const [loading, setLoading]   = useState(false)
  const [errorMsg, setError]    = useState('')
  const [successMsg, setOk]     = useState('')

  useEffect(() => {
    void loadResources()
  }, [])

  async function loadResources() {
    setResLoading(true)
    try {
      const data = await fetchActiveResources()
      setResources(data)
    } catch {
      setResources([])
    } finally {
      setResLoading(false)
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear the error for this field as user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function handleResourceChange(resourceId) {
    updateField('resourceId', resourceId)
    if (!resourceId) {
      updateField('location', '')
      return
    }
    const selected = resources.find((r) => String(r.id) === String(resourceId))
    if (selected?.location) {
      updateField('location', selected.location)
    }
  }

  function handleFileChange(e) {
    const selected = Array.from(e.target.files)
    const combined = [...files, ...selected].slice(0, 3)
    setFiles(combined)
    setPreviews(combined.map((f) => URL.createObjectURL(f)))
    e.target.value = ''
  }

  function removeFile(index) {
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  // ── Client-side validation before calling API ─────────────
  function validateForm() {
    const errors = {}
    if (!form.title.trim())        errors.title        = 'Title is required'
    if (!form.description.trim())  errors.description  = 'Description is required'
    if (!form.category)            errors.category     = 'Please select a category'
    if (!form.priority)            errors.priority     = 'Please select a priority'
    if (!form.location.trim())     errors.location     = 'Location is required'
    if (!form.contactName.trim())  errors.contactName  = 'Your name is required'
    if (!form.contactEmail.trim()) errors.contactEmail = 'Email is required'
    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setOk('')

    // Run validation — show red borders if anything is empty
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Please fill in all required fields highlighted below.')
      // Scroll to top so user sees the error banner
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
    <section className="admin-resources-page">

      <div className="home-section-card" style={{ padding: '1.5rem' }}>
        <div className="panel-header">
          <div>
            <h1>Report an Incident</h1>
            <p>Submit a maintenance or fault report for a campus facility or equipment.</p>
          </div>
          <ActionButton kind="ghost" onClick={() => navigate('/tickets/my')}>
            ← My Tickets
          </ActionButton>
        </div>
      </div>

      <div className="home-section-card">
        <StatusBanner type="error"   message={errorMsg}   />
        <StatusBanner type="success" message={successMsg} />

        <form className="booking-form" onSubmit={handleSubmit}>

          {/* ── Title ── */}
          <label>
            Title *
            <input
              type="text"
              placeholder="e.g. Projector not working in Lab 3"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              style={fieldErrors.title ? ERROR_STYLE : {}}
            />
            <FieldError message={fieldErrors.title} />
          </label>

          {/* ── Description ── */}
          <label>
            Description *
            <textarea
              placeholder="Describe the problem clearly — what happened, when, and what you already tried..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              style={fieldErrors.description ? ERROR_STYLE : {}}
            />
            <FieldError message={fieldErrors.description} />
          </label>

          {/* ── Category + Priority ── */}
          <div className="resource-form-grid">
            <label>
              Category *
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                style={fieldErrors.category ? ERROR_STYLE : {}}
              >
                <option value="">Select a category</option>
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{formatTicketLabel(c)}</option>
                ))}
              </select>
              <FieldError message={fieldErrors.category} />
            </label>

            <label>
              Priority *
              <select
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value)}
                style={fieldErrors.priority ? ERROR_STYLE : {}}
              >
                <option value="">Select priority</option>
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <FieldError message={fieldErrors.priority} />
            </label>
          </div>

          {/* ── Resource + Location ── */}
          <div className="resource-form-grid">
            <label>
              Resource Name
              <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.82rem' }}>
                {' '}(fills location automatically)
              </span>
              <select
                value={form.resourceId}
                onChange={(e) => handleResourceChange(e.target.value)}
                disabled={resLoading}
              >
                <option value="">
                  {resLoading ? 'Loading resources...' : 'Select a resource (optional)'}
                </option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.type?.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Location *
              <input
                type="text"
                placeholder="e.g. Lab 3 – Floor 2, Block A"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                style={fieldErrors.location ? ERROR_STYLE : {}}
              />
              <FieldError message={fieldErrors.location} />
            </label>
          </div>

          {/* ── Contact Details ── */}
          <p style={{ margin: '0.5rem 0 0', fontWeight: 700, color: '#374151', fontSize: '0.9rem' }}>
            Contact Details
            <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
              (name and email pre-filled from your account)
            </span>
          </p>

          <div className="resource-form-grid">
            <label>
              Your Name *
              <input
                type="text"
                placeholder="Full name"
                value={form.contactName}
                onChange={(e) => updateField('contactName', e.target.value)}
                style={fieldErrors.contactName ? ERROR_STYLE : {}}
              />
              <FieldError message={fieldErrors.contactName} />
            </label>

            <label>
              Email *
              <input
                type="email"
                placeholder="your@email.com"
                value={form.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                style={fieldErrors.contactEmail ? ERROR_STYLE : {}}
              />
              <FieldError message={fieldErrors.contactEmail} />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                placeholder="07X XXX XXXX"
                value={form.contactPhone}
                onChange={(e) => updateField('contactPhone', e.target.value)}
              />
            </label>
          </div>

          {/* ── Photo Evidence ── */}
          <div>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#374151', fontSize: '0.9rem' }}>
              Photo Evidence
              <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                (maximum 3 images)
              </span>
            </p>

            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`preview-${i + 1}`}
                      style={{
                        width: 96, height: 96, objectFit: 'cover',
                        borderRadius: '0.65rem',
                        border: '1px solid var(--border-soft)',
                        display: 'block',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove photo ${i + 1}`}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 22, height: 22,
                        background: 'var(--danger-600)', color: '#fff',
                        border: 'none', borderRadius: '50%',
                        cursor: 'pointer', fontSize: 14,
                        lineHeight: '22px', textAlign: 'center',
                        padding: 0, fontWeight: 700,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {files.length < 3 && (
              <ActionButton kind="ghost" type="button" onClick={() => fileInputRef.current.click()}>
                + Add Photo ({files.length}/3)
              </ActionButton>
            )}

            {files.length === 3 && (
              <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
                Maximum 3 photos reached.
              </p>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="booking-actions-row">
            <ActionButton kind="primary" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </ActionButton>
            <ActionButton kind="ghost" type="button" onClick={() => navigate('/tickets/my')} disabled={loading}>
              Cancel
            </ActionButton>
          </div>

        </form>
      </div>
    </section>
  )
}

export default CreateTicketPage