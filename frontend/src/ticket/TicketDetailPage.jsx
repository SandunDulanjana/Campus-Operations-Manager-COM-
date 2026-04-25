import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckIcon,
  MessageSquareIcon,
  SendIcon,
  TrashIcon,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
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
} from '../api/ticketApi'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Field, FieldGroup, FieldLabel } from '../components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { Textarea } from '../components/ui/textarea'

const EMPTY_SELECT_VALUE = '__none__'

function getStatusVariant(status) {
  if (status === 'REJECTED') return 'destructive'
  if (status === 'RESOLVED' || status === 'CLOSED') return 'secondary'
  return 'outline'
}

function getPriorityVariant(priority) {
  if (priority === 'CRITICAL') return 'destructive'
  if (priority === 'HIGH') return 'secondary'
  return 'outline'
}

function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setError] = useState('')
  const [successMessage, setOk] = useState('')
  const [showStatusForm, setShowStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [resolutionNotes, setNotes] = useState('')
  const [rejectionReason, setReason] = useState('')
  const [statusLoading, setStatusLoad] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [commentLoading, setCommentLoad] = useState(false)
  const [technicians, setTechnicians] = useState([])

  const isAdmin = user?.role === 'ADMIN'
  const isTech = user?.role === 'TECHNICIAN'
  const canUpdateStatus = isAdmin || isTech

  useEffect(() => {
    void loadTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (isAdmin || isTech) {
      fetchTechnicians()
        .then(setTechnicians)
        .catch(() => setTechnicians([]))
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
        status: newStatus,
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
      setError(
        err?.response?.data?.message
          || err?.response?.data?.error
          || err?.message
          || 'Failed to update status',
      )
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
      <section className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </section>
    )
  }

  if (!ticket) {
    return (
      <section className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Ticket not found</AlertTitle>
          <AlertDescription>Ticket could not be loaded.</AlertDescription>
        </Alert>
      </section>
    )
  }

  const allowedNext = ALLOWED_TRANSITIONS[ticket.status] || []
  const slaTarget = getSlaTarget(ticket.priority)
  const responseBreached = ticket.minutesToFirstResponse != null && ticket.minutesToFirstResponse > slaTarget.responseMin
  const resolutionBreached = ticket.minutesToResolution != null && ticket.minutesToResolution > slaTarget.resolutionMin

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert>
          <CheckIcon />
          <AlertTitle>Updated</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Ticket #{ticket.id}</Badge>
              <Badge variant={getStatusVariant(ticket.status)}>{formatTicketLabel(ticket.status)}</Badge>
              <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
              <Badge variant="outline">{formatTicketLabel(ticket.category)}</Badge>
              {ticket.slaBreached ? <Badge variant="destructive">SLA Breached</Badge> : null}
            </div>
            <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">{ticket.title}</CardTitle>
            <CardDescription>{ticket.description}</CardDescription>
          </div>

          {canUpdateStatus && allowedNext.length > 0 ? (
            <Button variant={showStatusForm ? 'outline' : 'default'} onClick={() => setShowStatus((value) => !value)}>
              {showStatusForm ? 'Cancel' : 'Update Status'}
            </Button>
          ) : null}
        </CardHeader>

        {showStatusForm && allowedNext.length > 0 ? (
          <CardContent>
            <form onSubmit={handleStatusUpdate}>
              <FieldGroup>
                <Field>
                  <FieldLabel>New Status</FieldLabel>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-full md:w-72">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {allowedNext.map((status) => (
                          <SelectItem key={status} value={status}>{formatTicketLabel(status)}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                {newStatus === 'IN_PROGRESS' ? (
                  <Field>
                    <FieldLabel>Assign Technician</FieldLabel>
                    <Select
                      value={assignedTo || EMPTY_SELECT_VALUE}
                      onValueChange={(value) => setAssignedTo(value === EMPTY_SELECT_VALUE ? '' : value)}
                    >
                      <SelectTrigger className="w-full md:w-96">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={EMPTY_SELECT_VALUE}>
                            {technicians.length === 0 ? 'No technicians available' : 'Select a technician'}
                          </SelectItem>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.email}>
                              {tech.name ? `${tech.name} (${tech.email})` : tech.email}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                ) : null}

                {newStatus === 'RESOLVED' ? (
                  <Field>
                    <FieldLabel htmlFor="resolution-notes">Resolution Notes *</FieldLabel>
                    <Textarea
                      id="resolution-notes"
                      placeholder="Describe what was done to fix the issue."
                      value={resolutionNotes}
                      onChange={(event) => setNotes(event.target.value)}
                      required
                    />
                  </Field>
                ) : null}

                {newStatus === 'REJECTED' && isAdmin ? (
                  <Field>
                    <FieldLabel htmlFor="rejection-reason">Rejection Reason *</FieldLabel>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Why is this ticket being rejected?"
                      value={rejectionReason}
                      onChange={(event) => setReason(event.target.value)}
                      required
                    />
                  </Field>
                ) : null}
              </FieldGroup>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="submit" disabled={statusLoading}>
                  <CheckIcon data-icon="inline-start" />
                  {statusLoading ? 'Updating...' : 'Confirm Update'}
                </Button>
                <Button variant="outline" type="button" onClick={() => setShowStatus(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <InfoRow label="Location" value={ticket.location} />
            <InfoRow label="Resource ID" value={ticket.resourceId || '-'} />
            <InfoRow label="Reported by" value={ticket.createdByEmail} />
            <InfoRow label="Assigned to" value={ticket.assignedToEmail || 'Not assigned yet'} />
            <InfoRow label="Created" value={formatTicketDate(ticket.createdAt)} />
            <InfoRow label="Last updated" value={formatTicketDate(ticket.updatedAt)} />
            <InfoRow label="Contact" value={`${ticket.contactName}${ticket.contactEmail ? ` - ${ticket.contactEmail}` : ''}`} fullWidth />
            {ticket.resolutionNotes ? <InfoRow label="Resolution Notes" value={ticket.resolutionNotes} fullWidth /> : null}
            {ticket.rejectionReason ? <InfoRow label="Rejection Reason" value={ticket.rejectionReason} fullWidth /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SLA Performance</CardTitle>
            <CardDescription>{ticket.priority} priority targets applied.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <SlaCard label="First response" value={formatDuration(ticket.minutesToFirstResponse)} note={`Target: ${slaTarget.responseLabel}`} breached={responseBreached} />
            <SlaCard label="Resolution" value={formatDuration(ticket.minutesToResolution)} note={`Target: ${slaTarget.resolutionLabel}`} breached={resolutionBreached} />
            <SlaCard label="SLA status" value={ticket.slaBreached ? 'Breached' : 'Within SLA'} note={formatTicketLabel(ticket.status)} breached={ticket.slaBreached} />
            <SlaCard label="Priority level" value={ticket.priority} note={formatTicketLabel(ticket.category)} breached={ticket.priority === 'CRITICAL'} />
          </CardContent>
        </Card>
      </div>

      {ticket.attachments?.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Photo Evidence ({ticket.attachments.length}/3)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {ticket.attachments.map((attachment) => (
              <div key={attachment.id} className="flex w-36 flex-col gap-2">
                <img
                  src={getAttachmentUrl(ticket.id, attachment.id)}
                  alt={attachment.fileName}
                  className="size-36 rounded-xl border object-cover"
                />
                <span className="truncate text-xs text-muted-foreground">{attachment.fileName}</span>
                {isAdmin ? (
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteAttachment(attachment.id)}>
                    <TrashIcon data-icon="inline-start" />
                    Delete
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Comments ({ticket.comments?.length ?? 0})</CardTitle>
          <CardDescription>Discuss issue updates with admins and technicians.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {ticket.comments?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet. Be first to add one.</p>
            ) : null}

            {ticket.comments?.map((comment) => (
              <Card key={comment.id} size="sm">
                <CardContent className="flex flex-col gap-3">
                  {editingId === comment.id ? (
                    <>
                      <Textarea value={editingText} onChange={(event) => setEditingText(event.target.value)} rows={3} />
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => handleEditComment(comment.id)} disabled={commentLoading}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditingText('') }}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{comment.authorRole || 'User'}</Badge>
                          <span className="font-medium">{comment.authorName || comment.authorEmail}</span>
                          <span className="text-sm text-muted-foreground">{formatTicketDate(comment.createdAt)}</span>
                        </div>
                        {(user?.email === comment.authorEmail || isAdmin) ? (
                          <div className="flex gap-2">
                            {user?.email === comment.authorEmail ? (
                              <Button size="sm" variant="outline" onClick={() => { setEditingId(comment.id); setEditingText(comment.content) }}>
                                Edit
                              </Button>
                            ) : null}
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteComment(comment.id)}>
                              Delete
                            </Button>
                          </div>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <form onSubmit={handleAddComment}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ticket-comment">Add a Comment</FieldLabel>
                <Textarea
                  id="ticket-comment"
                  placeholder="Write your comment here..."
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  required
                />
              </Field>
            </FieldGroup>
            <div className="mt-4">
              <Button type="submit" disabled={commentLoading || !commentText.trim()}>
                <MessageSquareIcon data-icon="inline-start" />
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

function getSlaTarget(priority) {
  const targets = {
    LOW: { responseMin: 240, resolutionMin: 10080, responseLabel: '4 hours', resolutionLabel: '7 days' },
    MEDIUM: { responseMin: 120, resolutionMin: 4320, responseLabel: '2 hours', resolutionLabel: '3 days' },
    HIGH: { responseMin: 60, resolutionMin: 2880, responseLabel: '1 hour', resolutionLabel: '48 hours' },
    CRITICAL: { responseMin: 15, resolutionMin: 1440, responseLabel: '15 min', resolutionLabel: '24 hours' },
  }
  return targets[priority] || targets.MEDIUM
}

function InfoRow({ label, value, fullWidth }) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : undefined}>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  )
}

function SlaCard({ label, value, note, breached }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl font-semibold">
          <Badge variant={breached ? 'destructive' : 'secondary'}>{value || '-'}</Badge>
        </CardTitle>
        <CardDescription>{note}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export default TicketDetailPage
