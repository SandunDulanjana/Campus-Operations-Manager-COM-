import { useEffect, useState } from 'react'
import {
  createPendingUser, fetchAllUsers, updateUserRole, deactivateUser,
  fetchRegistrationRequests, approveRegistration, rejectRegistration, permanentDeleteUser
} from '../api/adminApi'
import StatusBanner from '../components/ui/StatusBanner'

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
    <section className="admin-section-card">

      {/* ── Tab bar ── */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', borderBottom:'2px solid #e5e7eb', paddingBottom:'0' }}>
        {[
          { key:'users',    label:'Users' },
          { key:'requests', label: `Registration Requests${requests.length ? ` (${requests.length})` : ''}` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'0.55rem 1.1rem', border:'none', background:'none', cursor:'pointer',
            fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? 'var(--brand-700, #0f766e)' : '#6b7280',
            borderBottom: tab === t.key ? '2.5px solid var(--brand-700, #0f766e)' : '2.5px solid transparent',
            marginBottom:'-2px', fontSize:'0.92rem'
          }}>
            {t.label}
          </button>
        ))}
      </div>

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
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ════════════════ REGISTRATION REQUESTS TAB ════════════════ */}
      {tab === 'requests' && (
        <>
          <h1 style={{ margin:'0 0 1.2rem' }}>Registration Requests</h1>
          {reqError && <StatusBanner type="error" message={reqError} />}
          {reqLoading ? <p style={{ color:'#6b7280' }}>Loading…</p> :
           requests.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2.5rem', color:'#9ca3af' }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>✅</div>
              <p style={{ margin:0 }}>No pending registration requests.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
              {requests.map(r => (
                <div key={r.id} style={{
                  border:'1.5px solid #e5e7eb', borderRadius:'0.9rem',
                  padding:'1rem 1.2rem', background:'#fff',
                  display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem'
                }}>
                  <div>
                    <p style={{ margin:'0 0 0.2rem', fontWeight:700, fontSize:'0.95rem' }}>{r.name}</p>
                    <p style={{ margin:'0 0 0.15rem', color:'#6b7280', fontSize:'0.85rem' }}>{r.email}</p>
                    <p style={{ margin:0, fontSize:'0.85rem' }}>
                      University ID: <strong style={{ fontFamily:'monospace' }}>{r.username || '—'}</strong>
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:'0.6rem' }}>
                    <button onClick={() => openAction(r.id, 'approve')}
                      style={{ padding:'0.5rem 1rem', borderRadius:'0.6rem', border:'none',
                        background:'#166534', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => openAction(r.id, 'reject')}
                      style={{ padding:'0.5rem 1rem', borderRadius:'0.6rem', border:'1.5px solid #dc2626',
                        background:'#fff', color:'#dc2626', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════ ADD USER MODAL ════════════════ */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:'1.2rem', padding:'2rem', width:'100%', maxWidth:'460px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
            {!inviteUrl ? (
              <>
                <h2 style={{ margin:'0 0 1.2rem' }}>Invite New User</h2>
                {formError && <StatusBanner type="error" message={formError} />}
                <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:'0.7rem' }}>
                  {[
                    { label:'Full Name *', key:'name', type:'text', ph:'e.g. Kavindu Perera' },
                    { label:'Email *', key:'email', type:'email', ph:'e.g. k@campus.lk' },
                    { label:'University ID (optional)', key:'username', type:'text', ph:'e.g. s12345' },
                    { label:'Phone', key:'phone', type:'text', ph:'+94711234567' },
                    { label:'Department', key:'department', type:'text', ph:'Faculty of IT' },
                  ].map(({ label, key, type, ph }) => (
                    <label key={key} style={{ display:'flex', flexDirection:'column', gap:'0.25rem', fontWeight:600, fontSize:'0.86rem', color:'#374151' }}>
                      {label}
                      <input type={type} value={form[key]} placeholder={ph}
                        onChange={e => setForm(f => ({...f,[key]:e.target.value}))}
                        required={key==='name'||key==='email'}
                        style={{ padding:'0.58rem 0.8rem', borderRadius:'0.6rem', border:'1.5px solid #d1d5db', fontSize:'0.88rem' }} />
                    </label>
                  ))}
                  <label style={{ display:'flex', flexDirection:'column', gap:'0.25rem', fontWeight:600, fontSize:'0.86rem', color:'#374151' }}>
                    Role *
                    <select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}
                      style={{ padding:'0.58rem 0.8rem', borderRadius:'0.6rem', border:'1.5px solid #d1d5db', fontSize:'0.88rem' }}>
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </label>
                  <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.3rem' }}>
                    <button type="button" onClick={() => { setShowModal(false); setForm(emptyForm) }}
                      style={{ flex:1, padding:'0.65rem', borderRadius:'0.7rem', border:'1.5px solid #d1d5db', background:'#fff', fontWeight:600, cursor:'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" className="profile-save-btn" disabled={submitting} style={{ flex:1, justifyContent:'center' }}>
                      {submitting ? 'Creating…' : 'Create & Get Invite Link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div style={{ textAlign:'center', marginBottom:'1.2rem' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'0.4rem' }}>🔗</div>
                  <h2 style={{ margin:'0 0 0.3rem' }}>Invite link ready!</h2>
                  <p style={{ margin:0, color:'#6b7280', fontSize:'0.88rem' }}>Share this link. Expires in 24 hours.</p>
                </div>
                <div style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:'0.7rem', padding:'0.85rem', marginBottom:'1rem', wordBreak:'break-all', fontSize:'0.8rem', fontFamily:'monospace', color:'#374151' }}>
                  {inviteUrl}
                </div>
                <button onClick={copyInviteUrl} className="profile-save-btn" style={{ width:'100%', justifyContent:'center', marginBottom:'0.7rem' }}>
                  {copied ? '✓ Copied!' : '📋 Copy Link'}
                </button>
                <button onClick={() => { setShowModal(false); setInviteUrl('') }}
                  style={{ width:'100%', padding:'0.65rem', borderRadius:'0.7rem', border:'1.5px solid #d1d5db', background:'#fff', fontWeight:600, cursor:'pointer', fontSize:'0.88rem' }}>
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ APPROVE / REJECT MODAL ════════════════ */}
      {actionUserId && !devEmailInfo && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:'1.2rem', padding:'2rem', width:'100%', maxWidth:'420px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
            {actionType === 'approve' ? (
              <>
                <h2 style={{ margin:'0 0 0.5rem', color:'#166534' }}>✓ Approve Registration</h2>
                <p style={{ color:'#6b7280', fontSize:'0.88rem', margin:'0 0 1rem' }}>
                  Set a temporary password for this user. They will receive it by email.
                </p>
                {actionError && <StatusBanner type="error" message={actionError} />}
                <form onSubmit={handleApprove} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  <label style={{ display:'flex', flexDirection:'column', gap:'0.3rem', fontWeight:600, fontSize:'0.88rem' }}>
                    Temporary Password *
                    <input type="text" value={dummyPassword}
                      onChange={e => setDummyPassword(e.target.value)}
                      placeholder="e.g. Campus@2025" required minLength={6}
                      style={{ padding:'0.65rem 0.8rem', borderRadius:'0.65rem', border:'1.5px solid #d1d5db', fontSize:'0.9rem' }} />
                  </label>
                  <div style={{ display:'flex', gap:'0.7rem' }}>
                    <button type="button" onClick={closeActionModal}
                      style={{ flex:1, padding:'0.65rem', borderRadius:'0.7rem', border:'1.5px solid #d1d5db', background:'#fff', fontWeight:600, cursor:'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={actionSubmitting}
                      style={{ flex:1, padding:'0.65rem', borderRadius:'0.7rem', border:'none', background:'#166534', color:'#fff', fontWeight:600, cursor:'pointer' }}>
                      {actionSubmitting ? 'Approving…' : 'Confirm Approval'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 style={{ margin:'0 0 0.5rem', color:'#dc2626' }}>✗ Reject Registration</h2>
                <p style={{ color:'#6b7280', fontSize:'0.88rem', margin:'0 0 1rem' }}>
                  Provide a reason. The user will receive this in their notification email.
                </p>
                {actionError && <StatusBanner type="error" message={actionError} />}
                <form onSubmit={handleReject} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  <label style={{ display:'flex', flexDirection:'column', gap:'0.3rem', fontWeight:600, fontSize:'0.88rem' }}>
                    Rejection Reason *
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      placeholder="e.g. University ID not found in our records." required rows={3}
                      style={{ padding:'0.65rem 0.8rem', borderRadius:'0.65rem', border:'1.5px solid #d1d5db', fontSize:'0.88rem', resize:'vertical' }} />
                  </label>
                  <div style={{ display:'flex', gap:'0.7rem' }}>
                    <button type="button" onClick={closeActionModal}
                      style={{ flex:1, padding:'0.65rem', borderRadius:'0.7rem', border:'1.5px solid #d1d5db', background:'#fff', fontWeight:600, cursor:'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={actionSubmitting}
                      style={{ flex:1, padding:'0.65rem', borderRadius:'0.7rem', border:'none', background:'#dc2626', color:'#fff', fontWeight:600, cursor:'pointer' }}>
                      {actionSubmitting ? 'Rejecting…' : 'Confirm Rejection'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ DEV EMAIL PREVIEW MODAL ════════════════ */}
      {devEmailInfo && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:'1.2rem', padding:'2rem', width:'100%', maxWidth:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
            <h2 style={{ margin:'0 0 0.4rem' }}>📧 Dev Mode — Email Preview</h2>
            <p style={{ color:'#92400e', background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:'0.6rem', padding:'0.6rem 0.9rem', fontSize:'0.83rem', margin:'0 0 1rem' }}>
              ⚠️ {devEmailInfo.devNote}
            </p>
            <div style={{ fontSize:'0.85rem', color:'#374151', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'0.75rem', padding:'1rem' }}>
              <p style={{ margin:'0 0 0.35rem' }}><strong>To:</strong> {devEmailInfo.to}</p>
              <p style={{ margin:'0 0 0.35rem' }}><strong>Subject:</strong> {devEmailInfo.subject}</p>
              <pre style={{ margin:'0.5rem 0 0', whiteSpace:'pre-wrap', fontFamily:'monospace', fontSize:'0.83rem', color:'#374151' }}>
                {devEmailInfo.body}
              </pre>
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