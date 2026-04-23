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
          <div className="flex flex-col gap-2 p-1 group-data-[collapsible=icon]:items-center">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <CampusMark className="size-5" />
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="text-[13px] font-semibold leading-tight text-sidebar-foreground">Smart Campus</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/60">
                Operations Hub
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/40">ADMIN PANEL</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <SidebarMenuItem key={link.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === link.to}
                        size="md"
                        tooltip={link.label}
                        className="transition-colors hover:bg-sidebar-accent/50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                      >
                        <NavLink to={link.to}>
                          <Icon className="size-4" />
                          <span className="text-[12px] font-medium group-data-[collapsible=icon]:hidden">{link.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator className="bg-sidebar-border/50" />

        <SidebarFooter className="p-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
          {user ? (
            <div className="flex items-center gap-3 p-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
              <Avatar className="size-7 rounded-full bg-primary text-primary-foreground">
                <AvatarFallback className="text-[10px] font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-[11px] font-semibold text-sidebar-foreground leading-tight">{user.name || user.email}</p>
                <span className="truncate text-[10px] uppercase font-medium tracking-tight text-sidebar-foreground/60">
                  {user.role}
                </span>
              </div>
            </div>
          ) : null}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="hidden md:block">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Experimental Migration</p>
              <h1 className="text-[13px] font-semibold tracking-tight">{meta.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:flex items-center gap-2 bg-background border border-border rounded-md px-3 py-1.5 w-52 transition-colors focus-within:border-primary/50">
              <SearchIcon className="size-3.5 text-muted-foreground/60" />
              <input
                className="bg-transparent border-none text-[12px] placeholder:text-muted-foreground/40 outline-none w-full"
                placeholder="Search admin pages..."
              />
            </div>
            <Button variant="outline" size="icon" className="size-8 rounded-md border-border bg-background hover:bg-muted/50">
              <BellIcon className="size-4 text-muted-foreground" />
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 transition-opacity hover:opacity-80 focus:outline-none">
                    <Avatar className="size-8 rounded-full bg-primary text-primary-foreground">
                      <AvatarFallback className="text-[10px] font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left md:block min-w-0">
                      <p className="text-[12px] font-semibold leading-none text-foreground">{user.name || user.email}</p>
                      <span className="text-[10px] uppercase tracking-tight text-muted-foreground">{user.role}</span>
                    </div>
                    <ChevronDownIcon className="hidden size-3 text-muted-foreground md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-white shadow-lg">
                  <DropdownMenuLabel className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{user.name || user.email}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-muted" />
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg">
                      <CircleUserIcon className="mr-2 size-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg">
                      <Settings2Icon className="mr-2 size-4" />
                      Account Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-muted" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOutIcon className="mr-2 size-4" />
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
