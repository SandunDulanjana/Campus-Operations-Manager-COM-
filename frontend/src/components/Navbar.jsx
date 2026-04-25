import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BellIcon,
  BookOpenIcon,
  ChevronDownIcon,
  CircleUserIcon,
  ClipboardListIcon,
  HomeIcon,
  LogOutIcon,
  SearchIcon,
  Settings2Icon,
  ShieldIcon,
} from 'lucide-react'
import CampusMark from '@/components/icons/CampusMark'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  fetchMyNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationApi'
import { useAuth } from '../context/useAuth'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function formatNotifDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diffMin = Math.floor((new Date() - date) / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifLoading, setNotifLoading] = useState(false)

  const loadUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      setUnreadCount(await fetchUnreadCount())
    } catch {
      setUnreadCount(0)
    }
  }, [user])

  useEffect(() => {
    void loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [loadUnreadCount])

  async function loadNotifications() {
    if (!user) return
    setNotifLoading(true)
    try {
      setNotifications(await fetchMyNotifications())
      await loadUnreadCount()
    } catch {
      setNotifications([])
    } finally {
      setNotifLoading(false)
    }
  }

  async function handleMarkRead(id) {
    await markNotificationRead(id)
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
    setUnreadCount((current) => Math.max(0, current - 1))
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead()
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = getInitials(user?.name)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Go to home page">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card text-foreground shadow-sm">
            <CampusMark className="size-7" />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-semibold">Smart Campus</span>
            <span className="block truncate text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Operations Hub
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <Button variant="ghost" asChild>
            <Link to="/">
              <HomeIcon data-icon="inline-start" />
              Home
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <BookOpenIcon data-icon="inline-start" />
                Resources
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/bookings">
                    <BookOpenIcon data-icon="inline-start" />
                    Bookings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" asChild>
            <Link to="/tickets/my">
              <ClipboardListIcon data-icon="inline-start" />
              Tickets
            </Link>
          </Button>
        </nav>

        <div className="flex min-w-0 items-center gap-2">
          <div className="relative hidden lg:block">
            <SearchIcon className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input className="w-64 pl-8" placeholder="Search..." />
          </div>

          {!user ? (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          ) : (
            <>
              <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-sm" aria-label="Notifications">
                    <BellIcon />
                    {unreadCount > 0 ? (
                      <Badge className="absolute -mt-7 ml-7 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between gap-2">
                    <span>Notifications</span>
                    {unreadCount > 0 ? (
                      <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                        Mark all read
                      </Button>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {notifLoading ? (
                      <DropdownMenuItem disabled>Loading notifications...</DropdownMenuItem>
                    ) : notifications.length === 0 ? (
                      <DropdownMenuItem disabled>No notifications yet</DropdownMenuItem>
                    ) : (
                      notifications.slice(0, 8).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          onClick={() => !notification.read && handleMarkRead(notification.id)}
                          className="items-start gap-3"
                        >
                          <BellIcon data-icon="inline-start" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{notification.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {notification.message}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {formatNotifDate(notification.createdAt)}
                            </span>
                          </span>
                          {!notification.read ? <Badge variant="secondary">New</Badge> : null}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-auto justify-start rounded-xl px-2.5 py-2">
                    <Avatar>
                      <AvatarImage src={user.profilePicture || ''} alt={user.name || user.email} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden min-w-0 md:block">
                      <span className="block truncate text-sm font-medium leading-none">
                        {user.name || user.email}
                      </span>
                      <span className="block truncate text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {user.role}
                      </span>
                    </span>
                    <ChevronDownIcon className="hidden text-muted-foreground md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <span className="block truncate text-sm font-medium">{user.name || user.email}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <CircleUserIcon data-icon="inline-start" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings2Icon data-icon="inline-start" />
                      Account Settings
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' ? (
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <ShieldIcon data-icon="inline-start" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOutIcon data-icon="inline-start" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
      <Separator />
    </header>
  )
}

export default Navbar
