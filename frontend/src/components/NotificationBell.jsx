import { useEffect, useState } from 'react'
import {
  BellIcon,
  CalendarCheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClipboardListIcon,
  MessageSquareIcon,
  MegaphoneIcon,
  TicketIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchMyNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationApi'

const notificationMeta = {
  BOOKING_APPROVED: { icon: CalendarCheckIcon, label: 'Booking approved' },
  BOOKING_REJECTED: { icon: CircleXIcon, label: 'Booking rejected' },
  BOOKING_CANCELLED: { icon: CircleAlertIcon, label: 'Booking cancelled' },
  TICKET_STATUS_CHANGED: { icon: TicketIcon, label: 'Ticket update' },
  COMMENT_ADDED: { icon: MessageSquareIcon, label: 'Comment' },
  ADMIN_BROADCAST: { icon: MegaphoneIcon, label: 'Broadcast' },
  REGISTRATION_REQUEST: { icon: ClipboardListIcon, label: 'Registration' },
  REGISTRATION_APPROVED: { icon: CircleCheckIcon, label: 'Registration approved' },
  REGISTRATION_REJECTED: { icon: CircleXIcon, label: 'Registration rejected' },
}

function getNotificationMeta(type) {
  return notificationMeta[type] ?? { icon: BellIcon, label: 'Notification' }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatFullDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    void loadCount()
    const interval = setInterval(loadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadCount() {
    try {
      setUnread(await fetchUnreadCount())
    } catch {
      setUnread(0)
    }
  }

  async function loadNotifications() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchMyNotifications()
      setNotifications(Array.isArray(data) ? data : [])
      await loadCount()
    } catch {
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOpenChange(nextOpen) {
    setOpen(nextOpen)
    if (nextOpen) {
      await loadNotifications()
    }
  }

  async function handleMarkRead(notification) {
    setSelectedNotification(notification)
    if (notification.read) return

    try {
      await markNotificationRead(notification.id)
      setNotifications((current) =>
        current.map((item) => item.id === notification.id ? { ...item, read: true } : item)
      )
      setUnread((current) => Math.max(0, current - 1))
    } catch {
      setError('Failed to update notification.')
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true)
    setError('')
    try {
      await markAllNotificationsRead()
      setNotifications((current) => current.map((item) => ({ ...item, read: true })))
      setUnread(0)
    } catch {
      setError('Failed to mark notifications read.')
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadInPanel = notifications.filter((item) => !item.read).length
  const selectedMeta = selectedNotification ? getNotificationMeta(selectedNotification.type) : null
  const SelectedIcon = selectedMeta?.icon

  return (
    <>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
            className="relative"
          >
            <BellIcon />
            {unread > 0 ? (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
                {unread > 99 ? '99+' : unread}
              </Badge>
            ) : null}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-96 p-0">
          <div className="flex items-center justify-between gap-3 p-3">
            <DropdownMenuLabel className="p-0 text-sm text-foreground">
              Notifications
            </DropdownMenuLabel>
            {unreadInPanel > 0 ? (
              <Button variant="ghost" size="sm" disabled={markingAll} onClick={handleMarkAllRead}>
                {markingAll ? 'Marking...' : 'Mark all read'}
              </Button>
            ) : null}
          </div>

          <DropdownMenuSeparator className="m-0" />

          {error ? (
            <div className="p-3">
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>Request failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          <DropdownMenuGroup className="max-h-96 overflow-y-auto p-1">
            {loading ? (
              <div className="flex flex-col gap-2 p-2">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <BellIcon className="text-muted-foreground" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-muted-foreground">New campus updates will appear here.</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const meta = getNotificationMeta(notification.type)
                const Icon = meta.icon

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className="items-start gap-3 p-3"
                    onSelect={(event) => {
                      event.preventDefault()
                      void handleMarkRead(notification)
                    }}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                      <Icon />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate font-medium">{notification.title}</span>
                        {!notification.read ? (
                          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                            New
                          </Badge>
                        ) : null}
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </span>
                  </DropdownMenuItem>
                )
              })
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={Boolean(selectedNotification)} onOpenChange={(nextOpen) => {
        if (!nextOpen) setSelectedNotification(null)
      }}>
        <DialogContent className="sm:max-w-lg">
          {selectedNotification ? (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                    <SelectedIcon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <DialogTitle>{selectedNotification.title}</DialogTitle>
                    <DialogDescription>
                      {selectedMeta.label} · {formatFullDate(selectedNotification.createdAt)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="rounded-lg border bg-muted/40 p-3 text-sm leading-6 whitespace-pre-wrap">
                {selectedNotification.message}
              </div>
              <Badge variant="outline" className="w-fit">
                {selectedNotification.type}
              </Badge>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
