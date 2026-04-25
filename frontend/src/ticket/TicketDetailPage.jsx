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
    <div className="ticket-detail-page">
      <div className="ticket-detail-hero">
        <ActionButton kind="ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
          ← Back to Tickets
        </ActionButton>

        <div className="ticket-hero-meta">
          <span className="ticket-id-tag">TICKET #{ticket.id}</span>
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

        <div className="panel-header" style={{ alignItems: 'flex-start' }}>
          <h1 className="ticket-detail-title">{ticket.title}</h1>
          {canUpdateStatus && allowedNext.length > 0 && (
            <ActionButton
              kind={showStatusForm ? 'ghost' : 'primary'}
              onClick={() => setShowStatus((v) => !v)}
            >
              {showStatusForm ? 'Cancel Update' : 'Update Status'}
            </ActionButton>
          )}
        </div>

        <StatusBanner type="error"   message={errorMessage}   />
        <StatusBanner type="success" message={successMessage} />

        {/* Status update form */}
        {showStatusForm && allowedNext.length > 0 && (
          <div className="ticket-card" style={{ marginTop: '2rem', background: 'var(--bg-subtle)' }}>
            <div className="ticket-card-header">
              <h2>Modify Ticket Status</h2>
            </div>
            <form className="booking-form" onSubmit={handleStatusUpdate} style={{ padding: 0 }}>
              <div className="resource-form-grid">
                <label>
                  New Status
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
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
              </div>

              {newStatus === 'RESOLVED' && (
                <label style={{ marginTop: '1rem', display: 'block' }}>
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
                <label style={{ marginTop: '1rem', display: 'block' }}>
                  Rejection Reason *
                  <textarea
                    placeholder="Why is this ticket being rejected?"
                    value={rejectionReason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </label>
              )}

              <div className="booking-actions-row" style={{ marginTop: '1.5rem' }}>
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
      </div>

      {/* ── SLA Card ── */}
      {/* ── SLA Card ── */}
      {(() => {
        // Priority-based SLA targets
        const slaTargets = {
          LOW:      { responseMin: 240,  resolutionMin: 10080, responseLabel: '4 hours',  resolutionLabel: '7 days'    },
          MEDIUM:   { responseMin: 120,  resolutionMin: 4320,  responseLabel: '2 hours',  resolutionLabel: '3 days'    },
          HIGH:     { responseMin: 60,   resolutionMin: 2880,  responseLabel: '1 hour',   resolutionLabel: '48 hours'  },
          CRITICAL: { responseMin: 15,   resolutionMin: 1440,  responseLabel: '15 min',   resolutionLabel: '24 hours'  },
        }
        const target = slaTargets[ticket.priority] || slaTargets.MEDIUM
        const responseBreached = ticket.minutesToFirstResponse != null
          && ticket.minutesToFirstResponse > target.responseMin
        const resolutionBreached = ticket.minutesToResolution != null
          && ticket.minutesToResolution > target.resolutionMin

        return (
          <div className="home-section-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>SLA Performance</h2>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.7rem',
                borderRadius: 999,
                background: ticket.priority === 'CRITICAL' ? '#fef2f2'
                  : ticket.priority === 'HIGH' ? '#eff6ff'
                  : ticket.priority === 'MEDIUM' ? '#fffbeb'
                  : '#f0fdf4',
                color: ticket.priority === 'CRITICAL' ? '#b91c1c'
                  : ticket.priority === 'HIGH' ? '#1d4ed8'
                  : ticket.priority === 'MEDIUM' ? '#92400e'
                  : '#166534',
                border: `1px solid ${ticket.priority === 'CRITICAL' ? '#fecaca'
                  : ticket.priority === 'HIGH' ? '#bfdbfe'
                  : ticket.priority === 'MEDIUM' ? '#fde68a'
                  : '#bbf7d0'}`,
              }}>
                {ticket.priority} Priority SLA Targets applied
              </span>
            </div>
            <div className="admin-stat-grid">
              <SlaCard
                label="Time to First Response"
                value={formatDuration(ticket.minutesToFirstResponse)}
                note={`Target: ${target.responseLabel}`}
                breached={responseBreached}
              />
              <SlaCard
                label="Time to Resolution"
                value={formatDuration(ticket.minutesToResolution)}
                note={`Target: ${target.resolutionLabel}`}
                breached={resolutionBreached}
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
        )
      })()}

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
              <InfoRow label="Location"     value={ticket.location} />
              <InfoRow label="Resource"     value={ticket.resourceId || 'Not linked to a resource'} />
              <InfoRow label="Reported by"  value={ticket.createdByEmail} />
              <InfoRow label="Assigned to"  value={ticket.assignedToEmail || 'Unassigned'} />
              <InfoRow label="Created On"   value={formatTicketDate(ticket.createdAt)} />
              <InfoRow label="Last Updated" value={formatTicketDate(ticket.updatedAt)} />
              <InfoRow label="Requester"    value={ticket.contactName} />
              <InfoRow label="Contact Info" value={ticket.contactEmail || 'No email provided'} />

              {ticket.resolutionNotes && (
                <div className="ticket-info-item" style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #dcfce7' }}>
                  <span className="ticket-info-label" style={{ color: '#166534' }}>Resolution Progress</span>
                  <p className="ticket-info-value" style={{ color: '#14532d' }}>{ticket.resolutionNotes}</p>
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
          </div>

          {/* ── Comments ── */}
          <div className="ticket-card" style={{ marginTop: '1.5rem' }}>
            <div className="ticket-card-header">
              <h2>Discussion ({ticket.comments?.length ?? 0})</h2>
            </div>

            <div className="comment-list">
              {ticket.comments?.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  No comments yet. Start the conversation below.
                </p>
              )}

              {ticket.comments?.map((comment) => (
                <div key={comment.id} className="comment-bubble">
                  {editingId === comment.id ? (
                    <div className="booking-form" style={{ padding: 0, gap: '0.5rem' }}>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={3}
                      />
                      <div className="booking-actions-row">
                        <ActionButton kind="approve" onClick={() => handleEditComment(comment.id)} disabled={commentLoading}>
                          Save Change
                        </ActionButton>
                        <ActionButton kind="ghost" onClick={() => { setEditingId(null); setEditingText('') }}>
                          Cancel
                        </ActionButton>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="comment-bubble-header">
                        <div className="comment-author-info">
                          <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--profile-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--profile-accent)' }}>
                            {comment.authorEmail[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="comment-author-name">{comment.authorEmail}</span>
                            <div className="comment-date">{formatTicketDate(comment.createdAt)}</div>
                          </div>
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
                      <p className="comment-text">{comment.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form className="booking-form" onSubmit={handleAddComment} style={{ padding: 0, marginTop: '2rem', borderTop: '1px solid var(--bg-subtle)', paddingTop: '1.5rem' }}>
              <label>
                Share an Update
                <textarea
                  placeholder="Ask a question or provide context..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{ borderRadius: '1rem' }}
                  required
                />
              </label>
              <div className="booking-actions-row">
                <ActionButton kind="primary" type="submit" disabled={commentLoading || !commentText.trim()}>
                  {commentLoading ? 'Sending...' : 'Post Message'}
                </ActionButton>
              </div>
            </form>
          </div>
        </div>

        <div className="ticket-sidebar">
          {/* ── SLA ── */}
          <div className="ticket-card">
            <div className="ticket-card-header">
              <h2>SLA Performance</h2>
            </div>
            <div className="sla-grid">
              <SlaCard
                label="Response Time"
                value={formatDuration(ticket.minutesToFirstResponse)}
                breached={ticket.minutesToFirstResponse != null && ticket.minutesToFirstResponse > 60}
              />
              <SlaCard
                label="Total Time"
                value={formatDuration(ticket.minutesToResolution)}
                breached={ticket.minutesToResolution != null && ticket.minutesToResolution > 2880}
              />
              <SlaCard
                label="Service Status"
                value={ticket.slaBreached ? 'Breached' : 'Maintain SLA'}
                breached={ticket.slaBreached}
              />
            </div>
          </div>

          {/* ── Attachments ── */}
          {ticket.attachments?.length > 0 && (
            <div className="ticket-card" style={{ marginTop: '1.5rem' }}>
              <div className="ticket-card-header">
                <h2>Photo Evidence</h2>
              </div>
              <div className="tech-photo-gallery">
                {ticket.attachments.map((att) => (
                  <div key={att.id} className="tech-photo-card">
                    <img
                      src={getAttachmentUrl(ticket.id, att.id)}
                      alt={att.fileName}
                      className="tech-photo-img"
                    />
                    <div style={{ padding: '0.5rem 0' }}>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                        {att.fileName}
                      </p>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteAttachment(att.id)}
                          style={{ background: 'none', border: 'none', padding: 0, color: '#dc2626', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.2rem' }}
                        >
                          Delete Photo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="ticket-info-item">
      <span className="ticket-info-label">{label}</span>
      <span className="ticket-info-value">{value}</span>
    </div>
  )
}

function SlaCard({ label, value, breached }) {
  return (
    <div className={`sla-stat-card ${breached ? 'breached' : 'within'}`}>
      <span className="sla-stat-label">{label}</span>
      <span className="sla-stat-value">{value || 'N/A'}</span>
    </div>
  )
}


export default TicketDetailPage