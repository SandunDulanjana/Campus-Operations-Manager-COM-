import { useEffect, useState } from 'react'
import {
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notificationApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BellIcon, CheckCircle2Icon, Loader2Icon, MailOpenIcon, MessageSquareIcon } from 'lucide-react'

function TechnicianNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState('')

  useEffect(() => { void loadNotifications() }, [])

  async function loadNotifications() {
    setLoading(true)
    try {
      const data = await fetchMyNotifications()
      setNotifications(data)
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
    if (!dateStr) return '–'
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <Card className="border-border bg-white shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-2 bg-secondary text-secondary-foreground">
                Technician Panel
              </Badge>
              <CardTitle className="text-2xl font-bold tracking-tight">Your Notifications</CardTitle>
              <CardDescription>
                View announcements and updates from campus administration.
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllRead} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs font-bold px-4 h-9 shadow-sm">
                Mark all as read ({unreadCount})
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <Card className="border-border bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BellIcon className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Inbox ({notifications.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2Icon className="size-8 animate-spin text-primary/40" />
                <p className="text-sm">Fetching your updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-60">
                <MailOpenIcon className="size-12 mb-2" />
                <p className="text-sm font-medium">Your inbox is clear.</p>
                <p className="text-xs">No notifications to show right now.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`relative p-5 rounded-2xl border transition-all duration-200 group ${
                    n.read 
                    ? "bg-white border-border/60 hover:border-border hover:shadow-sm" 
                    : "bg-secondary/30 border-primary/20 shadow-[0_4px_12px_rgba(111,134,199,0.08)] hover:border-primary/40"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className={`mt-1 flex size-9 flex-shrink-0 items-center justify-center rounded-xl ${
                        n.read ? "bg-muted/50 text-muted-foreground" : "bg-primary/10 text-primary shadow-sm"
                      }`}>
                        <MessageSquareIcon className="size-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-[14px] font-bold tracking-tight ${n.read ? "text-foreground/80" : "text-foreground"}`}>
                            {n.title}
                          </h3>
                          {!n.read && (
                            <span className="flex size-2 rounded-full bg-primary animate-pulse"></span>
                          )}
                        </div>
                        <p className={`text-[13px] leading-relaxed mb-3 ${n.read ? "text-muted-foreground" : "text-foreground/90 font-medium"}`}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-medium text-muted-foreground/60 flex items-center gap-1.5">
                            <ActivityIcon className="size-3" />
                            {formatDate(n.createdAt)}
                          </span>
                          {!n.read && (
                            <Badge className="bg-primary/10 text-primary text-[9px] font-bold border-none shadow-none uppercase px-1.5 py-0">
                              NEW
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(n.id)}
                        className="h-8 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                      >
                        <CheckCircle2Icon className="mr-1.5 size-3" />
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ActivityIcon({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default TechnicianNotificationsPage