import { useEffect, useState } from 'react'
import { AlertCircleIcon, BellIcon, PencilLineIcon, Trash2Icon } from 'lucide-react'
import {
  fetchAllNotificationsAdmin,
  createBroadcastNotification,
  toggleNotificationPublished,
  deleteNotification,
} from '../api/notificationApi'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

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
  const [filterAudience, setFilterAudience] = useState('ANY')
  const [selectedNotification, setSelectedNotification] = useState(null)
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
    <section className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b">
          <div className="flex flex-col gap-1">
            <CardTitle>Broadcast Notifications</CardTitle>
            <CardDescription>Create and manage announcements sent to campus users.</CardDescription>
          </div>
          <Button onClick={() => { setShowForm((s) => !s); setError(''); setSuccess('') }}>
            <BellIcon data-icon="inline-start" />
            {showForm ? 'Close composer' : 'New notification'}
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          {success ? (
            <Alert>
              <BellIcon />
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create notification</DialogTitle>
            <DialogDescription>Single monochrome admin composer. No legacy inline form styles.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="notification-title">Title</label>
              <Input
                id="notification-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Campus maintenance notice"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="notification-message">Message</label>
              <Textarea
                id="notification-message"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Write notification body..."
                rows={5}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Audience</label>
              <Select value={form.audience} onValueChange={(value) => setForm((f) => ({ ...f, audience: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {AUDIENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Publish immediately</span>
                <span className="text-xs text-muted-foreground">Turn off to save as draft.</span>
              </div>
              <Button
                type="button"
                variant={form.published ? 'default' : 'outline'}
                onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
              >
                {form.published ? 'Published' : 'Draft'}
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                <PencilLineIcon data-icon="inline-start" />
                {submitting ? 'Publishing…' : 'Publish'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>{notifications.length} items in broadcast log.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No notifications yet. Create one above.
            </div>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell className="max-w-72 truncate text-muted-foreground">{notification.message}</TableCell>
                      <TableCell><Badge variant="outline">{notification.type}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{notification.targetAudience || notification.targetEmail || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={notification.published ? 'secondary' : 'outline'}>
                          {notification.published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(notification.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {notification.type === 'ADMIN_BROADCAST' ? (
                            <Button
                              variant={notification.published ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleToggle(notification.id)}
                            >
                              {notification.published ? 'Unpublish' : 'Publish'}
                            </Button>
                          ) : null}
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(notification.id)}>
                            <Trash2Icon data-icon="inline-start" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* ── Notification List ── */}
      <div className="table-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>All Notifications ({notifications.length})</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { value: 'ANY', label: 'All' },
              { value: 'ALL', label: 'Broadcasts' },
              { value: 'USER', label: 'Users' },
              { value: 'ADMIN', label: 'Admins' },
              { value: 'TECHNICIAN', label: 'Technicians' },
              { value: 'DIRECT', label: 'Direct' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterAudience(opt.value)}
                style={{
                  padding: '0.35rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: filterAudience === opt.value ? '1px solid var(--brand-700)' : '1px solid #e2e8f0',
                  background: filterAudience === opt.value ? 'var(--brand-700)' : '#fff',
                  color: filterAudience === opt.value ? '#fff' : '#4b5563',
                  transition: 'all 0.2s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
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
                {notifications.filter(n => {
                  if (filterAudience === 'ANY') return true;
                  if (filterAudience === 'DIRECT') return n.targetEmail != null;
                  if (n.targetAudience) return n.targetAudience.includes(filterAudience);
                  return false;
                }).map(n => (
                  <tr key={n.id} onClick={() => setSelectedNotification(n)} style={{ cursor: 'pointer' }} className="hoverable-row">
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
                            onClick={(e) => { e.stopPropagation(); handleToggle(n.id); }}
                            style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                          >
                            {n.published ? 'Unpublish' : 'Publish'}
                          </ActionButton>
                        )}
                        <ActionButton
                          kind="danger"
                          onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
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

      {/* ── Notification Detail Modal ── */}
      {selectedNotification && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setSelectedNotification(null)}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedNotification(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1.25rem',
                background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                color: '#6b7280', fontWeight: 600
              }}
            >
              &times;
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#111827', paddingRight: '1rem' }}>
              {selectedNotification.title}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div>{formatDate(selectedNotification.createdAt)}</div>
              <div>
                <strong>Type:</strong> <span style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{selectedNotification.type}</span>
              </div>
              <div><strong>Audience:</strong> {selectedNotification.targetAudience || selectedNotification.targetEmail || '—'}</div>
            </div>
            <div style={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0, background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              {selectedNotification.message}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminNotificationsPage
