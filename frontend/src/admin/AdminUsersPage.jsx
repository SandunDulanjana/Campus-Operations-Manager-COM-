import { useEffect, useState } from 'react'
import { AlertCircleIcon, CheckIcon, CopyIcon, LinkIcon, Trash2Icon, UserPlusIcon, XIcon } from 'lucide-react'
import {
  createPendingUser, fetchAllUsers, updateUserRole, deactivateUser,
  fetchRegistrationRequests, approveRegistration, rejectRegistration, permanentDeleteUser
} from '../api/adminApi'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

const ROLES = ['USER', 'TECHNICIAN', 'BOOKINGMNG', 'RECOURSEMNG', 'MAINTENANCEMNG', 'ADMIN']
const ROLE_LABELS = {
  USER: 'User', TECHNICIAN: 'Technician', BOOKINGMNG: 'Booking Mgr',
  RECOURSEMNG: 'Resource Mgr', MAINTENANCEMNG: 'Maintenance Mgr', ADMIN: 'Admin',
}
const emptyForm = { name: '', email: '', username: '', role: 'USER', phone: '', department: '' }

export default function AdminUsersPage() {
  const [tab, setTab] = useState('users')

  // ── Users tab ─────────────────────────────────────────────────────────────
  const [users, setUsers]             = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError]   = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(emptyForm)
  const [submitting, setSubmitting]   = useState(false)
  const [formError, setFormError]     = useState('')
  const [inviteUrl, setInviteUrl]     = useState('')
  const [copied, setCopied]           = useState(false)
  const [roleFilter, setRoleFilter]   = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Registration Requests tab ─────────────────────────────────────────────
  const [requests, setRequests]                 = useState([])
  const [reqLoading, setReqLoading]             = useState(true)
  const [reqError, setReqError]                 = useState('')
  const [actionUserId, setActionUserId]         = useState(null)
  const [dummyPassword, setDummyPassword]       = useState('')
  const [rejectReason, setRejectReason]         = useState('')
  const [actionType, setActionType]             = useState(null)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionError, setActionError]           = useState('')
  const [devEmailInfo, setDevEmailInfo]         = useState(null)
  const [approvalSuccess, setApprovalSuccess]   = useState(false)

  useEffect(() => { loadUsers(); loadRequests() }, [])

  async function loadUsers() {
    setUsersLoading(true); setUsersError('')
    try { setUsers(await fetchAllUsers()) }
    catch { setUsersError('Failed to load users.') }
    finally { setUsersLoading(false) }
  }

  async function loadRequests() {
    setReqLoading(true); setReqError('')
    try { setRequests(await fetchRegistrationRequests()) }
    catch { setReqError('Failed to load registration requests.') }
    finally { setReqLoading(false) }
  }

  const filteredUsers = users.filter((u) => {
    const matchesRole = !roleFilter || u.role === roleFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q)
    return matchesRole && matchesSearch
  })

  async function handleCreate(e) {
    e.preventDefault(); setFormError(''); setSubmitting(true)
    try {
      const { user: created, inviteUrl: url } = await createPendingUser(form)
      setUsers((prev) => [created, ...prev])
      setInviteUrl(url); setForm(emptyForm)
    } catch (err) {
      setFormError(err?.response?.data || 'Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      const updated = await updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
    } catch {
      setUsersError('Role update failed.')
    }
  }

  async function handleDeactivate(userId) {
    if (!window.confirm('Deactivate this account?')) return
    try {
      await deactivateUser(userId)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, enabled: false } : u)))
    } catch {
      setUsersError('Deactivation failed.')
    }
  }

  async function handlePermanentDelete(userId, userName) {
    if (!window.confirm(
      `Permanently delete "${userName}"?\n\nThis CANNOT be undone. All data for this user will be removed.`
    )) return
    try {
      await permanentDeleteUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
      setUsersError(err?.response?.data || 'Delete failed.')
    }
  }

  function copyInviteUrl() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  function openAction(userId, type) {
    setActionUserId(userId); setActionType(type)
    setDummyPassword(''); setRejectReason(''); setActionError(''); setDevEmailInfo(null)
  }

  async function handleApprove(e) {
    e.preventDefault(); setActionError(''); setActionSubmitting(true)
    try {
      await approveRegistration(actionUserId, dummyPassword)
      setRequests((prev) => prev.filter((r) => r.id !== actionUserId))
      loadUsers()
      setActionUserId(null); setActionType(null)
      setApprovalSuccess(true)
    } catch (err) {
      setActionError(err?.response?.data || 'Failed to approve.')
    } finally {
      setActionSubmitting(false)
    }
  }

  async function handleReject(e) {
    e.preventDefault(); setActionError(''); setActionSubmitting(true)
    try {
      const result = await rejectRegistration(actionUserId, rejectReason)
      setDevEmailInfo(result.devEmail)
      setRequests((prev) => prev.filter((r) => r.id !== actionUserId))
    } catch (err) {
      setActionError(err?.response?.data || 'Failed to reject.')
    } finally {
      setActionSubmitting(false)
    }
  }

  function closeActionModal() {
    setActionUserId(null); setActionType(null); setDevEmailInfo(null)
    setDummyPassword(''); setRejectReason(''); setActionError('')
  }

  function closeApprovalSuccess() {
    setApprovalSuccess(false)
    setTab('users')
  }

  return (
    <section className="flex flex-col gap-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="requests">
            Registration Requests{requests.length ? ` (${requests.length})` : ''}
          </TabsTrigger>
        </TabsList>

        {/* ── Users Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 border-b">
              <div className="flex flex-col gap-1">
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage role assignment, invite links, and activation state.</CardDescription>
              </div>
              <Button onClick={() => { setShowModal(true); setInviteUrl(''); setFormError('') }}>
                <UserPlusIcon data-icon="inline-start" />
                Add New User
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-4">
              {usersError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Request failed</AlertTitle>
                  <AlertDescription>{usersError}</AlertDescription>
                </Alert>
              )}

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1" style={{ minWidth: '200px', maxWidth: '340px' }}>
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      width: '1rem', height: '1rem', stroke: '#9ca3af', fill: 'none',
                      strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
                    }}
                  >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <Input
                    type="text"
                    placeholder="Search by name, email or University ID…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select
                  value={roleFilter || '__all__'}
                  onValueChange={(v) => setRoleFilter(v === '__all__' ? '' : v)}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__all__">All roles</SelectItem>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                  {filteredUsers.length} of {users.length} users
                </span>

                {(roleFilter || searchQuery) && (
                  <Button
                    variant="ghost" size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => { setRoleFilter(''); setSearchQuery('') }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>

              {usersLoading ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Loading users…
                </div>
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
                          <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                            No users found matching your filters.
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.name}
                            {u.invitePending && (
                              <Badge variant="outline" className="ml-2 text-xs">INVITED</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell className="font-mono">{u.username || '—'}</TableCell>
                          <TableCell>
                            <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                              <SelectTrigger className="h-8 w-44 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {ROLES.map((r) => (
                                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.enabled ? 'default' : 'destructive'}>
                              {u.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {u.enabled ? (
                              <Button
                                variant="ghost" size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeactivate(u.id)}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="destructive" size="sm"
                                onClick={() => handlePermanentDelete(u.id, u.name)}
                              >
                                <Trash2Icon data-icon="inline-start" />
                                Delete
                              </Button>
                            )}
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

        {/* ── Registration Requests Tab ──────────────────────────────────── */}
        <TabsContent value="requests">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Registration Requests</CardTitle>
              <CardDescription>Review and approve or reject self-registration submissions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {reqError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircleIcon />
                  <AlertTitle>Request failed</AlertTitle>
                  <AlertDescription>{reqError}</AlertDescription>
                </Alert>
              )}

              {reqLoading ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Loading requests…
                </div>
              ) : (
                <div className="rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>University ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                            No pending registration requests.
                          </TableCell>
                        </TableRow>
                      ) : requests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.name}</TableCell>
                          <TableCell className="text-muted-foreground">{req.email}</TableCell>
                          <TableCell className="font-mono">{req.username || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Pending</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => openAction(req.id, 'approve')}>
                                <CheckIcon data-icon="inline-start" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive" size="sm"
                                onClick={() => openAction(req.id, 'reject')}
                              >
                                <XIcon data-icon="inline-start" />
                                Reject
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
        </TabsContent>
      </Tabs>

      {/* ── Invite User Modal ─────────────────────────────────────────────── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{inviteUrl ? 'Invite link ready' : 'Invite New User'}</DialogTitle>
            <DialogDescription>
              {inviteUrl
                ? 'Share this generated link with the invited user.'
                : 'Create a pending account and issue a setup link.'}
            </DialogDescription>
          </DialogHeader>

          {!inviteUrl ? (
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Request failed</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-name">Full Name</label>
                  <Input
                    id="invite-name" value={form.name} required
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-email">Email</label>
                  <Input
                    id="invite-email" type="email" value={form.email} required
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-username">University ID</label>
                  <Input
                    id="invite-username" value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-phone">Phone</label>
                  <Input
                    id="invite-phone" value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-dept">Department</label>
                  <Input
                    id="invite-dept" value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={form.role} onValueChange={(value) => setForm((f) => ({ ...f, role: value }))}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
                <Button
                  variant="outline" type="button"
                  onClick={() => { setShowModal(false); setForm(emptyForm) }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  <UserPlusIcon data-icon="inline-start" />
                  {submitting ? 'Creating…' : 'Create invite'}
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

      {/* ── Approve / Reject Modal ────────────────────────────────────────── */}
      <Dialog
        open={Boolean(actionUserId && !devEmailInfo)}
        onOpenChange={(open) => { if (!open) closeActionModal() }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Registration' : 'Reject Registration'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Set a temporary password for the approved user.'
                : 'Provide a rejection reason for the notification email.'}
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Request failed</AlertTitle>
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          {actionType === 'approve' ? (
            <form onSubmit={handleApprove} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="dummy-password">Temporary Password</label>
                <Input
                  id="dummy-password" value={dummyPassword} minLength={6} required
                  onChange={(e) => setDummyPassword(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeActionModal}>Cancel</Button>
                <Button type="submit" disabled={actionSubmitting}>
                  <CheckIcon data-icon="inline-start" />
                  {actionSubmitting ? 'Approving…' : 'Confirm Approval'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleReject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="reject-reason">Rejection Reason</label>
                <Textarea
                  id="reject-reason" value={rejectReason} rows={4} required
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeActionModal}>Cancel</Button>
                <Button variant="destructive" type="submit" disabled={actionSubmitting}>
                  <XIcon data-icon="inline-start" />
                  {actionSubmitting ? 'Rejecting…' : 'Confirm Rejection'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dev Email Preview Modal ───────────────────────────────────────── */}
      <Dialog
        open={Boolean(devEmailInfo)}
        onOpenChange={(open) => { if (!open) closeActionModal() }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dev Mode Email Preview</DialogTitle>
            <DialogDescription>Backend mail preview payload for the reject flow.</DialogDescription>
          </DialogHeader>
          {devEmailInfo && (
            <div className="flex flex-col gap-3">
              <Alert>
                <AlertCircleIcon />
                <AlertTitle>Dev note</AlertTitle>
                <AlertDescription>{devEmailInfo.devNote}</AlertDescription>
              </Alert>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm"><strong>To:</strong> {devEmailInfo.to}</p>
                <p className="text-sm"><strong>Subject:</strong> {devEmailInfo.subject}</p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-muted-foreground">
                  {devEmailInfo.body}
                </pre>
              </div>
              <DialogFooter>
                <Button onClick={closeActionModal}>Done</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Approval Success Overlay ──────────────────────────────────────── */}
      {approvalSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: '1.4rem', padding: '2.5rem 2rem',
            width: '100%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.6rem' }}>✅</div>
            <h2 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '1.3rem' }}>
              Registration Approved!
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
              The user has been approved and notified. They can now log in with their temporary password.
            </p>
            <Button className="w-full" onClick={closeApprovalSuccess}>
              Go to Users Section
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}