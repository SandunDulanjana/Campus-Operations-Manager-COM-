import { useEffect, useState } from 'react'
import { BellIcon, CheckIcon, InboxIcon, MailCheckIcon, AlertCircleIcon } from 'lucide-react'
import {
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notificationApi'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

function TechnicianNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { void loadNotifications() }, [])

  async function loadNotifications() {
    setLoading(true)
    setError('')
    try {
      setNotifications(await fetchMyNotifications())
    } catch {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id)
      await loadNotifications()
    } catch {
      setError('Failed to mark notification as read')
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      setSuccess('All notifications marked as read.')
      await loadNotifications()
    } catch {
      setError('Failed to mark all as read')
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <section className="flex flex-col gap-6">
      <Card>
        <CardHeader className="gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit">Notification center</Badge>
            <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">Notifications</CardTitle>
            <CardDescription>View announcements and updates sent by campus administration.</CardDescription>
          </div>
          {unreadCount > 0 ? (
            <Button onClick={handleMarkAllRead}>
              <MailCheckIcon data-icon="inline-start" />
              Mark all read ({unreadCount})
            </Button>
          ) : null}
        </CardHeader>
      </Card>

      {success ? (
        <Alert>
          <CheckIcon />
          <AlertTitle>Updated</AlertTitle>
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

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Your Notifications ({notifications.length})</CardTitle>
          <CardDescription>{unreadCount} unread messages.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
              <InboxIcon />
              <p>No notifications yet.</p>
            </div>
          ) : notifications.map((notification) => (
            <Card key={notification.id} size="sm">
              <CardContent className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-3">
                  <div className="rounded-lg border bg-muted p-2 text-muted-foreground">
                    <BellIcon />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.read ? <Badge>New</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</span>
                  </div>
                </div>
                {!notification.read ? (
                  <Button variant="outline" size="sm" onClick={() => handleMarkRead(notification.id)}>
                    Mark read
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

export default TechnicianNotificationsPage
