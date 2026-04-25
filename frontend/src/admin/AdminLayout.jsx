import { useMemo } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import CampusMark from '@/components/icons/CampusMark'
import {
  BellIcon,
  BoxesIcon,
  ChevronDownIcon,
  CircleUserIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SearchIcon,
  Settings2Icon,
  TicketIcon,
  UserCogIcon,
  UsersIcon,
} from 'lucide-react'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { to: '/admin/bookings', label: 'Bookings', icon: UserCogIcon },
  { to: '/admin/tickets', label: 'Tickets', icon: TicketIcon },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/admin/resources', label: 'Resources', icon: BoxesIcon },
  { to: '/admin/notifications', label: 'Notifications', icon: BellIcon },
]

const pageMeta = {
  '/admin/dashboard': {
    title: 'Operations Dashboard',
    subtitle: 'Campus activity, requests, and approvals in one place.',
  },
  '/admin/bookings': {
    title: 'Booking Review',
    subtitle: 'Inspect requests, approve schedules, and resolve conflicts.',
  },
  '/admin/tickets': {
    title: 'Incident Tickets',
    subtitle: 'Track service issues, priority, and technician progress.',
  },
  '/admin/users': {
    title: 'User Management',
    subtitle: 'Approve registrations, roles, and access decisions.',
  },
  '/admin/resources': {
    title: 'Resource Management',
    subtitle: 'Maintain campus spaces, equipment, and availability windows.',
  },
  '/admin/notifications': {
    title: 'Notifications',
    subtitle: 'Broadcast updates and control delivery to campus roles.',
  },
}

function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const meta = useMemo(() => pageMeta[pathname] ?? pageMeta['/admin/dashboard'], [pathname])
  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'A'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="p-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
          <Card
            size="sm"
            className="gap-0 border-sidebar-border/70 bg-sidebar-accent/30 py-0 shadow-none group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:border-sidebar-border/70 group-data-[collapsible=icon]:bg-sidebar-accent/30"
          >
            <CardHeader className="px-0 group-data-[collapsible=icon]:px-0">
              <div className="flex items-center gap-3 p-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-background text-foreground shadow-sm group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:shadow-none">
                  <CampusMark className="size-7 group-data-[collapsible=icon]:size-5" />
                </div>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <CardTitle className="truncate text-[1.05rem] font-semibold text-sidebar-foreground">Smart Campus</CardTitle>
                  <CardDescription className="truncate text-[0.67rem] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/60">
                    Operations Hub
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <SidebarMenuItem key={link.to}>
                      <SidebarMenuButton asChild isActive={pathname === link.to} size="lg" tooltip={link.label}>
                        <NavLink to={link.to}>
                          <Icon />
                          <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
          {user ? (
            <Card
              size="sm"
              className="gap-0 border-sidebar-border/70 bg-sidebar-accent/30 py-0 shadow-none group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:border-sidebar-border/70 group-data-[collapsible=icon]:bg-sidebar-accent/30"
            >
              <CardContent className="px-0 group-data-[collapsible=icon]:px-0">
                <div className="flex items-center gap-3 p-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                  <Avatar size="lg" className="group-data-[collapsible=icon]:size-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name || user.email}</p>
                    <span className="truncate text-xs uppercase tracking-[0.22em] text-sidebar-foreground/60">
                      {user.role}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh bg-background">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="hidden md:block">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Experimental Migration</p>
              <h1 className="text-sm font-medium tracking-tight">{meta.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <SearchIcon className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
              <Input className="w-72 pl-8" placeholder="Search admin pages..." />
            </div>
            <Button variant="outline" size="icon-sm">
              <BellIcon />
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-auto justify-start rounded-xl px-2.5 py-2">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block min-w-0">
                      <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                      <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{user.role}</span>
                    </div>
                    <ChevronDownIcon className="hidden text-muted-foreground md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{user.name || user.email}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
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
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOutIcon data-icon="inline-start" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Control Center</p>
            <h2 className="text-3xl font-semibold tracking-tight">{meta.title}</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminLayout
