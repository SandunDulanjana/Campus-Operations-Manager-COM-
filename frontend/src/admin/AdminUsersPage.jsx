import { useEffect, useMemo, useState } from 'react'
import { AlertCircleIcon, CheckIcon, CopyIcon, LinkIcon, SearchIcon, Trash2Icon, UserPlusIcon, XIcon } from 'lucide-react'
import {
  createPendingUser, fetchAllUsers, updateUserRole, deactivateUser,
  fetchRegistrationRequests, approveRegistration, rejectRegistration, permanentDeleteUser
} from '../api/adminApi'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

const ROLES = ['USER', 'TECHNICIAN', 'BOOKINGMNG', 'RECOURSEMNG', 'MAINTENANCEMNG', 'ADMIN']
const ROLE_LABELS = {
  USER: 'User',
  TECHNICIAN: 'Technician',
  BOOKINGMNG: 'Booking Mgr',
  RECOURSEMNG: 'Resource Mgr',
  MAINTENANCEMNG: 'Maintenance Mgr',
  ADMIN: 'Admin',
}

const emptyForm = { name: '', email: '', username: '', role: 'USER', phone: '', department: '' }

export default function AdminUsersPage() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [roleFilter, setRoleFilter] = useState('__all__')
  const [searchQuery, setSearchQuery] = useState('')

  const [requests, setRequests] = useState([])
  const [reqLoading, setReqLoading] = useState(true)
  const [reqError, setReqError] = useState('')
  const [actionUserId, setActionUserId] = useState(null)
  const [dummyPassword, setDummyPassword] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [actionType, setActionType] = useState(null)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [devEmailInfo, setDevEmailInfo] = useState(null)
  const [approvalSuccess, setApprovalSuccess] = useState(false)

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return users.filter((user) => {
      const matchesRole = roleFilter === '__all__' || user.role === roleFilter
      const matchesSearch = !query
        || (user.name || '').toLowerCase().includes(query)
        || (user.email || '').toLowerCase().includes(query)
        || (user.username || '').toLowerCase().includes(query)
      return matchesRole && matchesSearch
    })
  }, [users, roleFilter, searchQuery])

  useEffect(() => {
    void loadUsers()
    void loadRequests()
  }, [])

  async function loadUsers() {
    setUsersLoading(true)
    setUsersError('')
    try {
      setUsers(await fetchAllUsers())
    } catch {
      setUsersError('Failed to load users.')
    } finally {
      setUsersLoading(false)
    }
  }

  async function loadRequests() {
    setReqLoading(true)
    setReqError('')
    try {
      setRequests(await fetchRegistrationRequests())
    } catch {
      setReqError('Failed to load registration requests.')
    } finally {
      setReqLoading(false)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const { user: created, inviteUrl: url } = await createPendingUser(form)
      setUsers((current) => [created, ...current])
      setInviteUrl(url)
      setForm(emptyForm)
    } catch (error) {
      setFormError(error?.response?.data || 'Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      const updated = await updateUserRole(userId, newRole)
      setUsers((current) => current.map((user) => user.id === userId ? updated : user))
    } catch {
      setUsersError('Role update failed.')
    }
  }

  async function handleDeactivate(userId) {
    if (!window.confirm('Deactivate this account?')) return
    try {
      await deactivateUser(userId)
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, enabled: false } : user))
    } catch {
      setUsersError('Deactivation failed.')
    }
  }

  async function handlePermanentDelete(userId, userName) {
    if (!window.confirm(`Permanently delete "${userName}"?\n\nThis CANNOT be undone. All data for this user will be removed.`)) return
    try {
      await permanentDeleteUser(userId)
      setUsers((current) => current.filter((user) => user.id !== userId))
    } catch (error) {
      setUsersError(error?.response?.data || 'Delete failed.')
    }
  }

  function copyInviteUrl() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function openAction(userId, type) {
    setActionUserId(userId)
    setActionType(type)
    setDummyPassword('')
    setRejectReason('')
    setActionError('')
    setDevEmailInfo(null)
  }

  async function handleApprove(event) {
    event.preventDefault()
    setActionError('')
    setActionSubmitting(true)
    try {
      const result = await approveRegistration(actionUserId, dummyPassword)
      setDevEmailInfo(result.devEmail || null)
      setRequests((current) => current.filter((request) => request.id !== actionUserId))
      await loadUsers()
      setActionUserId(null)
      setActionType(null)
      setApprovalSuccess(true)
    } catch (error) {
      setActionError(error?.response?.data || 'Failed to approve.')
    } finally {
      setActionSubmitting(false)
    }
  }

  async function handleReject(event) {
    event.preventDefault()
    setActionError('')
    setActionSubmitting(true)
    try {
      const result = await rejectRegistration(actionUserId, rejectReason)
      setDevEmailInfo(result.devEmail)
      setRequests((current) => current.filter((request) => request.id !== actionUserId))
    } catch (error) {
      setActionError(error?.response?.data || 'Failed to reject.')
    } finally {
      setActionSubmitting(false)
    }
  }

  function closeActionModal() {
    setActionUserId(null)
    setActionType(null)
    setDevEmailInfo(null)
    setDummyPassword('')
    setRejectReason('')
    setActionError('')
  }

  function closeApprovalSuccess() {
    setApprovalSuccess(false)
    setTab('users')
  }

  return (
    <section className="flex flex-col gap-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="requests">Registration Requests{requests.length ? ` (${requests.length})` : ''}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 border-b">
              <div className="flex flex-col gap-1">
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage role assignment, invite links, activation state.</CardDescription>
              </div>
              <Button onClick={() => { setShowModal(true); setInviteUrl(''); setFormError('') }}>
                <UserPlusIcon data-icon="inline-start" />
                Add New User
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-4">
              {usersError ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Request failed</AlertTitle>
                  <AlertDescription>{usersError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-1 flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="user-search">Search users</label>
                  <div className="relative">
                    <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="user-search"
                      className="pl-9"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search by name, email, or University ID"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="min-w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="__all__">All roles</SelectItem>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{filteredUsers.length} of {users.length}</Badge>
                  <Button variant="outline" onClick={() => { setRoleFilter('__all__'); setSearchQuery('') }}>
                    Clear
                  </Button>
                </div>
              </div>

              {usersLoading ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading...</div>
              ) : (
                <div className="rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>University ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>{user.name}</span>
                              {user.invitePending ? <Badge variant="outline">Invited</Badge> : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">{user.username || '-'}</TableCell>
                          <TableCell>
                            <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.enabled ? 'secondary' : 'destructive'}>
                              {user.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {user.enabled ? (
                                <Button variant="outline" size="sm" onClick={() => handleDeactivate(user.id)}>
                                  Deactivate
                                </Button>
                              ) : (
                                <Button variant="destructive" size="sm" onClick={() => handlePermanentDelete(user.id, user.name)}>
                                  <Trash2Icon data-icon="inline-start" />
                                  Delete
                                </Button>
                              )}
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
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Registration Requests</CardTitle>
              <CardDescription>Approve or reject pending registration attempts.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {reqError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircleIcon />
                  <AlertTitle>Request failed</AlertTitle>
                  <AlertDescription>{reqError}</AlertDescription>
                </Alert>
              ) : null}

              {reqLoading ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  No pending registration requests.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {requests.map((request) => (
                    <div key={request.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">{request.name}</p>
                        <span className="text-sm text-muted-foreground">{request.email}</span>
                        <span className="text-sm text-muted-foreground">University ID: {request.username || '-'}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openAction(request.id, 'approve')}>
                          <CheckIcon data-icon="inline-start" />
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openAction(request.id, 'reject')}>
                          <XIcon data-icon="inline-start" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{inviteUrl ? 'Invite link ready' : 'Invite New User'}</DialogTitle>
            <DialogDescription>
              {inviteUrl ? 'Share generated link with invited user.' : 'Create pending account and issue setup link.'}
            </DialogDescription>
          </DialogHeader>

          {!inviteUrl ? (
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {formError ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Request failed</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['invite-name', 'Full Name', 'name', 'text'],
                  ['invite-email', 'Email', 'email', 'email'],
                  ['invite-username', 'University ID', 'username', 'text'],
                  ['invite-phone', 'Phone', 'phone', 'text'],
                  ['invite-dept', 'Department', 'department', 'text'],
                ].map(([id, label, key, type]) => (
                  <div key={id} className="flex flex-col gap-2">
                    <label className="text-sm font-medium" htmlFor={id}>{label}</label>
                    <Input
                      id={id}
                      type={type}
                      value={form[key]}
                      onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))}
                      required={key === 'name' || key === 'email'}
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={form.role} onValueChange={(value) => setForm((current) => ({ ...current, role: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => { setShowModal(false); setForm(emptyForm) }}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  <UserPlusIcon data-icon="inline-start" />
                  {submitting ? 'Creating...' : 'Create invite'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-2 text-sm font-medium">Invite URL</p>
                <code className="block break-all text-sm text-muted-foreground">{inviteUrl}</code>
              </div>
              <DialogFooter>
                <Button onClick={copyInviteUrl}>
                  <CopyIcon data-icon="inline-start" />
                  {copied ? 'Copied' : 'Copy link'}
                </Button>
                <Button variant="outline" onClick={() => { setShowModal(false); setInviteUrl('') }}>
                  <LinkIcon data-icon="inline-start" />
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(actionUserId && !devEmailInfo)} onOpenChange={(open) => { if (!open) closeActionModal() }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{actionType === 'approve' ? 'Approve Registration' : 'Reject Registration'}</DialogTitle>
            <DialogDescription>
              {actionType === 'approve' ? 'Set temporary password for approved user.' : 'Provide rejection reason for email message.'}
            </DialogDescription>
          </DialogHeader>
          {actionError ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          ) : null}
          {actionType === 'approve' ? (
            <form onSubmit={handleApprove} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="dummy-password">Temporary Password</label>
                <Input id="dummy-password" value={dummyPassword} onChange={(event) => setDummyPassword(event.target.value)} minLength={6} required />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeActionModal}>Cancel</Button>
                <Button type="submit" disabled={actionSubmitting}>
                  <CheckIcon data-icon="inline-start" />
                  {actionSubmitting ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleReject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="reject-reason">Rejection Reason</label>
                <Textarea id="reject-reason" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={4} required />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeActionModal}>Cancel</Button>
                <Button variant="destructive" type="submit" disabled={actionSubmitting}>
                  <XIcon data-icon="inline-start" />
                  {actionSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(devEmailInfo)} onOpenChange={(open) => { if (!open) closeActionModal() }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dev Mode Email Preview</DialogTitle>
            <DialogDescription>Backend mail preview payload for approve/reject flow.</DialogDescription>
          </DialogHeader>
          {devEmailInfo ? (
            <div className="flex flex-col gap-3">
              <Alert>
                <AlertCircleIcon />
                <AlertTitle>Dev note</AlertTitle>
                <AlertDescription>{devEmailInfo.devNote}</AlertDescription>
              </Alert>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm"><strong>To:</strong> {devEmailInfo.to}</p>
                <p className="text-sm"><strong>Subject:</strong> {devEmailInfo.subject}</p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-muted-foreground">{devEmailInfo.body}</pre>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={closeActionModal}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approvalSuccess} onOpenChange={(open) => { if (!open) closeApprovalSuccess() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registration Approved</DialogTitle>
            <DialogDescription>User can now sign in with approved account access.</DialogDescription>
          </DialogHeader>
          <Alert>
            <CheckIcon />
            <AlertTitle>Approved</AlertTitle>
            <AlertDescription>The registration request has been accepted successfully.</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={closeApprovalSuccess}>Go to Users Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
