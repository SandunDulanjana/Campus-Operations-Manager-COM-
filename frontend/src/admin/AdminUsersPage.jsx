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

const ROLES = ['USER','TECHNICIAN','BOOKINGMNG','RECOURSEMNG','MAINTENANCEMNG','ADMIN']
const ROLE_LABELS = {
  USER:'User', TECHNICIAN:'Technician', BOOKINGMNG:'Booking Mgr',
  RECOURSEMNG:'Resource Mgr', MAINTENANCEMNG:'Maintenance Mgr', ADMIN:'Admin'
}
const emptyForm = { name:'', email:'', username:'', role:'USER', phone:'', department:'' }

export default function AdminUsersPage() {
  const [tab, setTab] = useState('users')

  // ── Users tab ────────────────────────────────────────────────────────────
  const [users, setUsers]               = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError]     = useState('')
  const [showModal, setShowModal]       = useState(false)
  const [form, setForm]                 = useState(emptyForm)
  const [submitting, setSubmitting]     = useState(false)
  const [formError, setFormError]       = useState('')
  const [inviteUrl, setInviteUrl]       = useState('')
  const [copied, setCopied]             = useState(false)

  // CHANGE 2 & 3: Filter by role + live search bar state
  const [roleFilter, setRoleFilter]   = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Registration Requests tab ─────────────────────────────────────────────
  const [requests, setRequests]               = useState([])
  const [reqLoading, setReqLoading]           = useState(true)
  const [reqError, setReqError]               = useState('')
  const [actionUserId, setActionUserId]       = useState(null)
  const [dummyPassword, setDummyPassword]     = useState('')
  const [rejectReason, setRejectReason]       = useState('')
  const [actionType, setActionType]           = useState(null)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionError, setActionError]         = useState('')
  const [devEmailInfo, setDevEmailInfo]       = useState(null)

  // CHANGE 1: Success popup state after approval
  const [approvalSuccess, setApprovalSuccess] = useState(false)

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

  // CHANGE 2 & 3: Computed filtered+searched user list
  const filteredUsers = users.filter(u => {
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
      setUsers(prev => [created, ...prev])
      setInviteUrl(url); setForm(emptyForm)
    } catch (err) { setFormError(err?.response?.data || 'Failed to create user.') }
    finally { setSubmitting(false) }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      const updated = await updateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? updated : u))
    } catch { setUsersError('Role update failed.') }
  }

  async function handleDeactivate(userId) {
    if (!window.confirm('Deactivate this account?')) return
    try {
      await deactivateUser(userId)
      setUsers(prev => prev.map(u => u.id === userId ? {...u, enabled: false} : u))
    } catch { setUsersError('Deactivation failed.') }
  }

  async function handlePermanentDelete(userId, userName) {
    if (!window.confirm(
      `Permanently delete "${userName}"?\n\nThis CANNOT be undone. All data for this user will be removed.`
    )) return
    try {
      await permanentDeleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
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

  // CHANGE 1: Show success popup after approval, then redirect to users tab
  async function handleApprove(e) {
    e.preventDefault(); setActionError(''); setActionSubmitting(true)
    try {
      await approveRegistration(actionUserId, dummyPassword)
      setRequests(prev => prev.filter(r => r.id !== actionUserId))
      loadUsers()
      // Close the approve modal and show success popup
      setActionUserId(null); setActionType(null)
      setApprovalSuccess(true)
    } catch (err) { setActionError(err?.response?.data || 'Failed to approve.') }
    finally { setActionSubmitting(false) }
  }

  async function handleReject(e) {
    e.preventDefault(); setActionError(''); setActionSubmitting(true)
    try {
      const result = await rejectRegistration(actionUserId, rejectReason)
      setDevEmailInfo(result.devEmail)
      setRequests(prev => prev.filter(r => r.id !== actionUserId))
    } catch (err) { setActionError(err?.response?.data || 'Failed to reject.') }
    finally { setActionSubmitting(false) }
  }

  function closeActionModal() {
    setActionUserId(null); setActionType(null); setDevEmailInfo(null)
    setDummyPassword(''); setRejectReason(''); setActionError('')
  }

  // CHANGE 1: Close approval success popup and navigate to Users tab
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
            <CardContent className="pt-4">
              {usersError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircleIcon />
                  <AlertTitle>Request failed</AlertTitle>
                  <AlertDescription>{usersError}</AlertDescription>
                </Alert>
              ) : null}

      {/* ════════════════════════ USERS TAB ════════════════════════ */}
      {tab === 'users' && (
        <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h1 style={{ margin:0 }}>All Users</h1>
            <button className="profile-save-btn"
              onClick={() => { setShowModal(true); setInviteUrl(''); setFormError('') }}>
              + Add New User
            </button>
          </div>

          {usersError && <StatusBanner type="error" message={usersError} />}

          {/* CHANGE 2 & 3: Filter by role + Search bar */}
          <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1rem', flexWrap:'wrap', alignItems:'center' }}>
            {/* Search bar */}
            <div style={{ position:'relative', flex:'1', minWidth:'200px', maxWidth:'340px' }}>
              <svg style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', width:'1rem', height:'1rem', stroke:'#9ca3af', fill:'none', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round' }} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by name, email or University ID…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width:'100%', padding:'0.55rem 0.8rem 0.55rem 2.3rem',
                  borderRadius:'0.65rem', border:'1.5px solid #d1d5db',
                  fontSize:'0.88rem', boxSizing:'border-box', outline:'none'
                }}
              />
            </div>

            {/* Role filter */}
            <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.88rem', fontWeight:600, color:'#374151' }}>
              Role:
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                style={{ padding:'0.52rem 0.75rem', borderRadius:'0.65rem', border:'1.5px solid #d1d5db', fontSize:'0.88rem', cursor:'pointer' }}
              >
                <option value="">All roles</option>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </label>

            {/* Count indicator */}
            <span style={{ fontSize:'0.82rem', color:'#9ca3af' }}>
              {filteredUsers.length} of {users.length} users
            </span>

            {/* Reset filters */}
            {(roleFilter || searchQuery) && (
              <button onClick={() => { setRoleFilter(''); setSearchQuery('') }}
                style={{ fontSize:'0.82rem', color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontWeight:600, textDecoration:'underline' }}>
                Clear filters
              </button>
            )}
          </div>

          {usersLoading ? <p style={{ color:'#6b7280' }}>Loading…</p> : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #e5e7eb' }}>
                    {['Name','Email','University ID','Role','Status','Actions'].map(h => (
                      <th key={h} style={{ padding:'0.65rem 0.8rem', textAlign:'left', fontWeight:600, color:'#374151' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding:'2rem', textAlign:'center', color:'#9ca3af' }}>
                        No users found matching your filters.
                      </td>
                    </tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                      <td style={{ padding:'0.65rem 0.8rem' }}>
                        {u.name}
                        {u.invitePending && <span style={{ marginLeft:'0.4rem', fontSize:'0.72rem', background:'#fef3c7', color:'#92400e', padding:'0.12rem 0.45rem', borderRadius:'9999px', fontWeight:700 }}>INVITED</span>}
                      </td>
                      <td style={{ padding:'0.65rem 0.8rem', color:'#6b7280' }}>{u.email}</td>
                      <td style={{ padding:'0.65rem 0.8rem', fontFamily:'monospace', color:'#374151' }}>{u.username || '—'}</td>
                      <td style={{ padding:'0.65rem 0.8rem' }}>
                        <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                          style={{ fontSize:'0.83rem', padding:'0.22rem 0.45rem', borderRadius:'0.4rem', border:'1px solid #d1d5db' }}>
                          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        </select>
                      </td>
                      <td style={{ padding:'0.65rem 0.8rem' }}>
                        <span style={{ fontSize:'0.78rem', fontWeight:700, padding:'0.2rem 0.5rem', borderRadius:'9999px',
                          background: u.enabled ? '#dcfce7' : '#fee2e2',
                          color: u.enabled ? '#166534' : '#991b1b' }}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding:'0.65rem 0.8rem' }}>
                        {u.enabled ? (
                          <button onClick={() => handleDeactivate(u.id)}
                            style={{ fontSize:'0.8rem', color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontWeight:600, padding:0 }}>
                            Deactivate
                          </button>
                        ) : (
                          <button onClick={() => handlePermanentDelete(u.id, u.name)}
                            style={{ fontSize:'0.8rem', color:'#fff', background:'#dc2626', border:'none', cursor:'pointer', fontWeight:600, padding:'0.25rem 0.65rem', borderRadius:'0.4rem' }}>
                            🗑 Delete
                          </button>
                        )}
                      </td>
                    </tr>
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
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-name">Full Name</label>
                  <Input id="invite-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-email">Email</label>
                  <Input id="invite-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-username">University ID</label>
                  <Input id="invite-username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-phone">Phone</label>
                  <Input id="invite-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="invite-dept">Department</label>
                  <Input id="invite-dept" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={form.role} onValueChange={(value) => setForm((f) => ({ ...f, role: value }))}>
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
                <Input id="dummy-password" value={dummyPassword} onChange={(e) => setDummyPassword(e.target.value)} minLength={6} required />
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
                <Textarea id="reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} required />
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
            <button onClick={closeActionModal} className="profile-save-btn"
              style={{ width:'100%', justifyContent:'center', marginTop:'1.1rem' }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ════════════════ CHANGE 1: APPROVAL SUCCESS POPUP ════════════════
          Shows after admin clicks Confirm Approval. Blurs background, shows
          success box with a button that redirects to the Users tab.           */}
      {approvalSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '1.4rem', padding: '2.5rem 2rem',
            width: '100%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            animation: 'fadeInUp 0.25s ease'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.6rem' }}>✅</div>
            <h2 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '1.3rem' }}>
              Registration Approved!
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
              The user registration request has been accepted successfully.
              The user has been notified and can now log in.
            </p>
            <button
              onClick={closeApprovalSuccess}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '0.8rem',
                border: 'none', background: '#166534', color: '#fff',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(22,101,52,0.25)'
              }}
            >
              Go to Users Section
            </button>
          </div>
        </div>
      )}

    </section>
  )
}
