import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import ActionButton from '../components/ui/ActionButton'
import StatusBanner from '../components/ui/StatusBanner'
import {
  fetchTicketById,
  addComment,
  updateComment,
  deleteComment,
  deleteAttachment,
  getAttachmentUrl,
  updateTicketStatus,
  fetchTechnicians,
  ALLOWED_TRANSITIONS,
  formatTicketLabel,
  formatTicketDate,
  formatDuration,
  getStatusBadgeClass,
  getPriorityBadgeClass,
} from '../api/ticketApi'

function TicketDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ticket, setTicket]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [errorMessage, setError]        = useState('')
  const [successMessage, setOk]         = useState('')
  const [showStatusForm, setShowStatus] = useState(false)
  const [newStatus, setNewStatus]       = useState('')
  const [assignedTo, setAssignedTo]     = useState('')
  const [resolutionNotes, setNotes]     = useState('')
  const [rejectionReason, setReason]    = useState('')
  const [statusLoading, setStatusLoad]  = useState(false)
  const [commentText, setCommentText]   = useState('')
  const [editingId, setEditingId]       = useState(null)
  const [editingText, setEditingText]   = useState('')
  const [commentLoading, setCommentLoad] = useState(false)
  const [technicians, setTechnicians] = useState([])

  const isAdmin = user?.role === 'ADMIN'
  const isTech  = user?.role === 'TECHNICIAN'
  const canUpdateStatus = isAdmin || isTech

  useEffect(() => {
    void loadTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Load technicians for the assign dropdown
    useEffect(() => {
    if (isAdmin || isTech) {
        fetchTechnicians()
        .then(setTechnicians)
        .catch(() => setTechnicians([]))  // Silent fail if no permission
    }
    }, [isAdmin, isTech])


  async function loadTicket() {
    setLoading(true)
    try {
      const data = await fetchTicketById(id)
      setTicket(data)
      const allowed = ALLOWED_TRANSITIONS[data.status] || []
      if (allowed.length > 0) setNewStatus(allowed[0])
    } catch {
      setError('Failed to load ticket.')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate(event) {
    event.preventDefault()
    setError('')
    setStatusLoad(true)
    try {
    await updateTicketStatus(id, {
        status:          newStatus,
        assignedToEmail: newStatus === 'IN_PROGRESS' && assignedTo ? assignedTo : undefined,
        resolutionNotes: newStatus === 'RESOLVED' && resolutionNotes ? resolutionNotes : undefined,
        rejectionReason: newStatus === 'REJECTED' && rejectionReason ? rejectionReason : undefined,
        })
      setOk('Status updated successfully!')
      setShowStatus(false)
      setNotes('')
      setReason('')
      await loadTicket()
    } catch (err) {
     const backendMsg = err?.response?.data?.message
        || err?.response?.data?.error
        || err?.message
        || 'Failed to update status'
        setError(backendMsg)
    } finally {
      setStatusLoad(false)
    }
  }

  async function handleAddComment(event) {
    event.preventDefault()
    if (!commentText.trim()) return
    setCommentLoad(true)
    try {
      await addComment(id, commentText)
      setCommentText('')
      await loadTicket()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add comment')
    } finally {
      setCommentLoad(false)
    }
  }

  async function handleEditComment(commentId) {
    setCommentLoad(true)
    try {
      await updateComment(id, commentId, editingText)
      setEditingId(null)
      setEditingText('')
      await loadTicket()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update comment')
    } finally {
      setCommentLoad(false)
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await deleteComment(id, commentId)
      await loadTicket()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete comment')
    }
  }

  async function handleDeleteAttachment(attachmentId) {
    if (!window.confirm('Delete this photo?')) return
    try {
      await deleteAttachment(id, attachmentId)
      await loadTicket()
    } catch {
      setError('Failed to delete photo')
    }
  }

  if (loading) {
    return (
      <section className="admin-resources-page">
        <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading ticket...
        </p>
      </section>
    )
  }

  if (!ticket) {
    return (
      <section className="admin-resources-page">
        <StatusBanner type="error" message="Ticket not found." />
      </section>
    )
  }

  const allowedNext = ALLOWED_TRANSITIONS[ticket.status] || []

  return (
    <section className="admin-resources-page">

      <ActionButton kind="ghost" onClick={() => navigate(-1)}>
        ← Back
      </ActionButton>

      <StatusBanner type="error"   message={errorMessage}   />
      <StatusBanner type="success" message={successMessage} />

      {/* ── Ticket Info ── */}
      <div className="home-section-card" style={{ padding: '1.5rem' }}>
        <div className="panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Ticket #{ticket.id}</span>
              <span className={getStatusBadgeClass(ticket.status)}>
                {formatTicketLabel(ticket.status)}
              </span>
              <span className={getPriorityBadgeClass(ticket.priority)}>
                {ticket.priority}
              </span>
              <span className="badge cancelled">
                {formatTicketLabel(ticket.category)}
              </span>
              {ticket.slaBreached && (
                <span className="badge rejected">⚠ SLA Breached</span>
              )}
            </div>
            <h1 style={{ margin: 0 }}>{ticket.title}</h1>
          </div>

          {canUpdateStatus && allowedNext.length > 0 && (
            <ActionButton
              kind={showStatusForm ? 'ghost' : 'primary'}
              onClick={() => setShowStatus((v) => !v)}
            >
              {showStatusForm ? 'Cancel' : 'Update Status'}
            </ActionButton>
          )}
        </div>

        {/* Status update form */}
        {showStatusForm && allowedNext.length > 0 && (
          <div style={{
            padding: '1.25rem',
            background: '#f8fafc',
            borderRadius: '0.85rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.25rem',
          }}>
            <form className="booking-form" onSubmit={handleStatusUpdate} style={{ padding: 0 }}>
              <label>
                New Status
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ maxWidth: 280 }}
                >
                  {allowedNext.map((s) => (
                    <option key={s} value={s}>{formatTicketLabel(s)}</option>
                  ))}
                </select>
              </label>

            {newStatus === 'IN_PROGRESS' && (
            <label>
                Assign Technician
                <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ maxWidth: 360 }}
                >
                <option value="">
                    {technicians.length === 0
                    ? 'No technicians available'
                    : '— Select a technician —'}
                </option>
                {technicians.map((tech) => (
                    <option key={tech.id} value={tech.email}>
                    {tech.name ? `${tech.name} (${tech.email})` : tech.email}
                    </option>
                ))}
                </select>
            </label>
            )}

              {newStatus === 'RESOLVED' && (
                <label>
                  Resolution Notes *
                  <textarea
                    placeholder="Describe what was done to fix the issue..."
                    value={resolutionNotes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  />
                </label>
              )}

              {newStatus === 'REJECTED' && isAdmin && (
                <label>
                  Rejection Reason *
                  <textarea
                    placeholder="Why is this ticket being rejected?"
                    value={rejectionReason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </label>
              )}

              <div className="booking-actions-row">
                <ActionButton kind="approve" type="submit" disabled={statusLoading}>
                  {statusLoading ? 'Updating...' : 'Confirm Update'}
                </ActionButton>
                <ActionButton kind="ghost" type="button" onClick={() => setShowStatus(false)}>
                  Cancel
                </ActionButton>
              </div>
            </form>
          </div>
        )}

        {/* Details grid */}
        <div className="resource-form-grid">
          <InfoRow label="Description"  value={ticket.description} fullWidth />
          <InfoRow label="Location"     value={ticket.location} />
          <InfoRow label="Resource ID"  value={ticket.resourceId || '—'} />
          <InfoRow label="Reported by"  value={ticket.createdByEmail} />
          <InfoRow label="Assigned to"  value={ticket.assignedToEmail || 'Not assigned yet'} />
          <InfoRow label="Created"      value={formatTicketDate(ticket.createdAt)} />
          <InfoRow label="Last updated" value={formatTicketDate(ticket.updatedAt)} />
          <InfoRow label="Contact"      value={`${ticket.contactName}${ticket.contactEmail ? ' · ' + ticket.contactEmail : ''}`} />
          {ticket.resolutionNotes && (
            <InfoRow label="Resolution Notes" value={ticket.resolutionNotes} fullWidth />
          )}
          {ticket.rejectionReason && (
            <InfoRow label="Rejection Reason" value={ticket.rejectionReason} fullWidth />
          )}
        </div>
      </div>

      {/* ── SLA Card ── */}
      <div className="home-section-card" style={{ padding: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem' }}>SLA Performance</h2>
        <div className="admin-stat-grid">
          <SlaCard
            label="Time to First Response"
            value={formatDuration(ticket.minutesToFirstResponse)}
            note="Target: 60 min"
            breached={ticket.minutesToFirstResponse != null && ticket.minutesToFirstResponse > 60}
          />
          <SlaCard
            label="Time to Resolution"
            value={formatDuration(ticket.minutesToResolution)}
            note="Target: 48 hours"
            breached={ticket.minutesToResolution != null && ticket.minutesToResolution > 2880}
          />
          <SlaCard
            label="SLA Status"
            value={ticket.slaBreached ? 'Breached' : 'Within SLA'}
            note={formatTicketLabel(ticket.status)}
            breached={ticket.slaBreached}
          />
          <SlaCard
            label="Priority Level"
            value={ticket.priority}
            note={formatTicketLabel(ticket.category)}
            breached={ticket.priority === 'CRITICAL'}
          />
        </div>
      </div>

      {/* ── Attachments ── */}
      {ticket.attachments?.length > 0 && (
        <div className="home-section-card" style={{ padding: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem' }}>
            Photo Evidence ({ticket.attachments.length}/3)
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {ticket.attachments.map((att) => (
              <div key={att.id}>
                <img
                  src={getAttachmentUrl(ticket.id, att.id)}
                  alt={att.fileName}
                  style={{
                    width: 140, height: 140, objectFit: 'cover',
                    borderRadius: '0.85rem',
                    border: '1px solid var(--border-soft)',
                    display: 'block',
                  }}
                />
                <p style={{
                  fontSize: '0.72rem', color: '#6b7280',
                  margin: '0.25rem 0', maxWidth: 140,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {att.fileName}
                </p>
                {isAdmin && (
                  <ActionButton
                    kind="danger"
                    onClick={() => handleDeleteAttachment(att.id)}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                  >
                    Delete
                  </ActionButton>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Comments ── */}
      <div className="home-section-card" style={{ padding: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem' }}>
          Comments ({ticket.comments?.length ?? 0})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>

          {ticket.comments?.length === 0 && (
            <p style={{ color: '#64748b' }}>No comments yet. Be the first to add one.</p>
          )}

          {ticket.comments?.map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: '0.9rem 1rem',
                background: '#f8fafc',
                borderRadius: '0.85rem',
                border: '1px solid #e5e7eb',
              }}
            >
              {editingId === comment.id ? (
                <div className="booking-form" style={{ padding: 0, gap: '0.5rem' }}>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                  />
                  <div className="booking-actions-row">
                    <ActionButton kind="approve" onClick={() => handleEditComment(comment.id)} disabled={commentLoading}>
                      Save
                    </ActionButton>
                    <ActionButton kind="ghost" onClick={() => { setEditingId(null); setEditingText('') }}>
                      Cancel
                    </ActionButton>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.55rem',
                        borderRadius: 999,
                        background: comment.authorRole === 'Admin'
                          ? '#fef2f2' : comment.authorRole === 'Technician'
                          ? '#eff6ff' : '#f0fdf4',
                        color: comment.authorRole === 'Admin'
                          ? '#b91c1c' : comment.authorRole === 'Technician'
                          ? '#1d4ed8' : '#166534',
                        border: `1px solid ${comment.authorRole === 'Admin'
                          ? '#fecaca' : comment.authorRole === 'Technician'
                          ? '#bfdbfe' : '#bbf7d0'}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {comment.authorRole || 'User'}
                      </span>
                      <strong style={{ fontSize: '0.875rem' }}>
                        {comment.authorName || comment.authorEmail}
                      </strong>
                      <span className="muted">{formatTicketDate(comment.createdAt)}</span>
                    </div>
                    
                    {(user?.email === comment.authorEmail || isAdmin) && (
                      <div className="booking-actions-row" style={{ margin: 0 }}>
                        {user?.email === comment.authorEmail && (
                          <ActionButton
                            kind="ghost"
                            onClick={() => { setEditingId(comment.id); setEditingText(comment.content) }}
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                          >
                            Edit
                          </ActionButton>
                        )}
                        <ActionButton
                          kind="danger"
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                        >
                          Delete
                        </ActionButton>
                      </div>
                    )}
                  </div>
                  <p style={{ margin: '0.5rem 0 0', color: '#374151' }}>{comment.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <form className="booking-form" onSubmit={handleAddComment} style={{ padding: 0 }}>
          <label>
            Add a Comment
            <textarea
              placeholder="Write your comment here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
          </label>
          <div className="booking-actions-row">
            <ActionButton kind="primary" type="submit" disabled={commentLoading || !commentText.trim()}>
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </ActionButton>
          </div>
        </form>
      </div>

    </section>
  )
}

function InfoRow({ label, value, fullWidth }) {
  return (
    <div style={fullWidth ? { gridColumn: '1 / -1' } : {}}>
      <p style={{ margin: '0 0 0.2rem', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ margin: 0, color: '#1f2937' }}>{value}</p>
    </div>
  )
}

function SlaCard({ label, value, note, breached }) {
  return (
    <article className="admin-stat-card" style={{ borderTop: `3px solid ${breached ? '#dc2626' : '#16a34a'}` }}>
      <p>{label}</p>
      <h2 style={{ color: breached ? '#b91c1c' : '#166534' }}>{value || '—'}</h2>
      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{note}</span>
    </article>
  )
}

export default TicketDetailPage