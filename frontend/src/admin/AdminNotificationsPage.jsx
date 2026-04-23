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
    </section>
  )
}

export default AdminNotificationsPage
