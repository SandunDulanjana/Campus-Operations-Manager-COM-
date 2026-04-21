import { useEffect, useState } from 'react'
import {
  fetchAllNotificationsAdmin,
  createBroadcastNotification,
  toggleNotificationPublished,
  deleteNotification,
} from '../api/notificationApi'
import ActionButton from '../components/ui/ActionButton'
import StatusBanner from '../components/ui/StatusBanner'

const AUDIENCE_OPTIONS = [
  { value: 'ALL',          label: 'All Users' },
  { value: 'USER',         label: 'Users only' },
  { value: 'ADMIN',        label: 'Admins only' },
  { value: 'TECHNICIAN',   label: 'Technicians only' },
  { value: 'USER,ADMIN',   label: 'Users & Admins' },
  { value: 'USER,TECHNICIAN', label: 'Users & Technicians' },
]

const EMPTY_FORM = { title: '', message: '', audience: 'ALL', published: true }

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(false)
  const [showForm, setShowForm]           = useState(false)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [submitting, setSubmitting]       = useState(false)
  const [success, setSuccess]             = useState('')
  const [error, setError]                 = useState('')

  useEffect(() => { void loadNotifications() }, [])

  async function loadNotifications() {
    setLoading(true)
    try {
      const data = await fetchAllNotificationsAdmin()
      setNotifications(data)
    } catch {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true); setError(''); setSuccess('')
    try {
      const audienceRoles = form.audience === 'ALL' ? ['ALL'] : form.audience.split(',')
      await createBroadcastNotification({
        title: form.title,
        message: form.message,
        audienceRoles,
        published: form.published,
      })
      setSuccess('Notification created successfully!')
      setForm(EMPTY_FORM)
      setShowForm(false)
      await loadNotifications()
    } catch {
      setError('Failed to create notification. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(id) {
    try {
      await toggleNotificationPublished(id)
      await loadNotifications()
    } catch {
      setError('Failed to update notification')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this notification? This cannot be undone.')) return
    try {
      await deleteNotification(id)
      setSuccess('Notification deleted.')
      await loadNotifications()
    } catch {
      setError('Failed to delete notification')
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <section className="admin-resources-page">
      <div className="admin-section-card">
        <div className="panel-header">
          <h1>Notifications</h1>
          <p>Create and manage announcements sent to campus users via the notification bell.</p>
        </div>

        <StatusBanner type="success" message={success} />
        <StatusBanner type="error"   message={error} />

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <ActionButton kind="approve" onClick={() => { setShowForm(s => !s); setError(''); setSuccess('') }}>
            {showForm ? 'Cancel' : '+ New Notification'}
          </ActionButton>
        </div>

        {/* ── Create Form ── */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            style={{
              marginTop: '1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '1rem',
              padding: '1.25rem',
              display: 'grid',
              gap: '0.85rem',
              maxWidth: 600,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Create Broadcast Notification</h3>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontWeight: 600, fontSize: '0.88rem' }}>
              Title *
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Campus Maintenance Notice"
                required
                style={{ padding: '0.65rem 0.9rem', borderRadius: '0.65rem', border: '1.5px solid #d1d5db', fontSize: '0.9rem' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontWeight: 600, fontSize: '0.88rem' }}>
              Message *
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Write the full notification message here..."
                required
                rows={4}
                style={{ padding: '0.65rem 0.9rem', borderRadius: '0.65rem', border: '1.5px solid #d1d5db', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontWeight: 600, fontSize: '0.88rem' }}>
              Audience
              <select
                value={form.audience}
                onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                style={{ padding: '0.65rem 0.9rem', borderRadius: '0.65rem', border: '1.5px solid #d1d5db', fontSize: '0.9rem' }}
              >
                {AUDIENCE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
              />
              Publish immediately (uncheck to save as draft)
            </label>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <ActionButton kind="approve" type="submit" disabled={submitting}>
                {submitting ? 'Publishing…' : 'Publish Notification'}
              </ActionButton>
              <ActionButton kind="ghost" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </ActionButton>
            </div>
          </form>
        )}
      </div>

      {/* ── Notification List ── */}
      <div className="table-panel">
        <h2>All Notifications ({notifications.length})</h2>
        {loading ? (
          <p style={{ padding: '1rem', color: '#6b7280' }}>Loading…</p>
        ) : notifications.length === 0 ? (
          <p style={{ padding: '1rem', color: '#6b7280' }}>No notifications yet. Create one above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id}>
                    <td><strong>{n.title}</strong></td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: 999 }}>
                        {n.type}
                      </span>
                    </td>
                    <td>{n.targetAudience || n.targetEmail || '—'}</td>
                    <td>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 700,
                        color: n.published ? '#15803d' : '#b45309',
                        background: n.published ? '#f0fdf4' : '#fef3c7',
                        border: `1px solid ${n.published ? '#bbf7d0' : '#fde68a'}`,
                        padding: '0.2rem 0.6rem', borderRadius: 999,
                      }}>
                        {n.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#6b7280' }}>{formatDate(n.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {n.type === 'ADMIN_BROADCAST' && (
                          <ActionButton
                            kind={n.published ? 'ghost' : 'approve'}
                            onClick={() => handleToggle(n.id)}
                            style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                          >
                            {n.published ? 'Unpublish' : 'Publish'}
                          </ActionButton>
                        )}
                        <ActionButton
                          kind="danger"
                          onClick={() => handleDelete(n.id)}
                          style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                        >
                          Delete
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminNotificationsPage