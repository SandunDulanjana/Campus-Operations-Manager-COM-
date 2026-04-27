import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  BellIcon,
  BookOpenIcon,
  ChevronDownIcon,
  CircleUserIcon,
  ClipboardListIcon,
  HomeIcon,
  LogOutIcon,
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

function Navbar({ isHomePage = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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
  
  const isActive = (path) => location.pathname === path

  // Transparent styles for homepage
  const homePageStyles = isHomePage
    ? 'absolute top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-sm'
    : 'sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'

  // Text colors for homepage (white) vs normal (default)
  const textColorClass = isHomePage ? 'text-white' : 'text-foreground'
  const mutedTextColorClass = isHomePage ? 'text-white/70' : 'text-muted-foreground'

  return (
    <header className={homePageStyles}>
      <div className="mx-8 flex min-h-16 items-center justify-between py-3 md:mx-10 lg:mx-12">
        {/* Left: Campus Logo */}
        <div className="flex items-center">
          <Link to="/" className={`flex items-center gap-3 ${textColorClass}`} aria-label="Go to home page">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${isHomePage ? 'border-white/20 bg-white/10' : 'bg-card'} shadow-sm`}>
              <CampusMark className="size-6" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-semibold">Smart Campus</span>
              <span className={`block truncate text-[11px] uppercase tracking-[0.24em] ${mutedTextColorClass}`}>
                Operations Hub
              </span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links (only when logged in) */}
        {user && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            <Button 
              variant={isActive('/') ? 'default' : (isHomePage ? 'ghost' : 'ghost')} 
              size="sm"
              asChild
              className={`rounded-full px-4 ${isHomePage && !isActive('/') ? 'text-white hover:bg-white/20 hover:text-white' : ''}`}
            >
              <Link to="/">
                <HomeIcon className="mr-2 size-4" />
                Home
              </Link>
            </Button>
            <Button 
              variant={isActive('/bookings') ? 'default' : 'ghost'} 
              size="sm"
              asChild
              className={`rounded-full px-4 ${isHomePage && !isActive('/bookings') ? 'text-white hover:bg-white/20 hover:text-white' : ''}`}
            >
              <Link to="/bookings">
                <BookOpenIcon className="mr-2 size-4" />
                Bookings
              </Link>
            </Button>
            <Button 
              variant={isActive('/tickets/my') ? 'default' : 'ghost'} 
              size="sm"
              asChild
              className={`rounded-full px-4 ${isHomePage && !isActive('/tickets/my') ? 'text-white hover:bg-white/20 hover:text-white' : ''}`}
            >
              <Link to="/tickets/my">
                <ClipboardListIcon className="mr-2 size-4" />
                Tickets
              </Link>
            </Button>
          </nav>
        )}

        {/* Right: Login or Profile */}
        <div className="flex items-center gap-2">
          {!user ? (
            <Button 
              size="sm" 
              className={`rounded-full px-6 ${isHomePage ? 'bg-white text-black hover:bg-white/90' : ''}`} 
              asChild
            >
              <Link to="/login">Login</Link>
            </Button>
          ) : (
            <>
              {/* Notifications */}
              <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`relative rounded-full ${isHomePage ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white' : ''}`} 
                    aria-label="Notifications"
                  >
                    <BellIcon className="size-4" />
                    {unreadCount > 0 ? (
                      <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]">
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
                          <BellIcon className="mt-0.5 size-4 shrink-0" />
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

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`h-auto justify-start rounded-full px-2 py-1.5 pl-1.5 pr-3 ${isHomePage ? 'text-white hover:bg-white/20' : ''}`}
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={user.profilePicture || ''} alt={user.name || user.email} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden min-w-0 md:block">
                      <span className="block truncate text-sm font-medium leading-none">
                        {user.name || user.email}
                      </span>
                      <span className={`block truncate text-xs uppercase tracking-[0.22em] ${isHomePage ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {user.role}
                      </span>
                    </span>
                    <ChevronDownIcon className={`hidden size-4 md:block ${isHomePage ? 'text-white/70' : 'text-muted-foreground'}`} />
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
                      <CircleUserIcon className="mr-2 size-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings2Icon className="mr-2 size-4" />
                      Account Settings
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' ? (
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <ShieldIcon className="mr-2 size-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOutIcon className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
