import { useEffect, useRef, useState } from 'react'
import {
  fetchMyNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notificationApi'

// ── Helper: relative time label ───────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Helper: icon by notification type ────────────────────────────────────────
function typeIcon(type) {
  switch (type) {
    case 'BOOKING_APPROVED':      return '✅'
    case 'BOOKING_REJECTED':      return '❌'
    case 'BOOKING_CANCELLED':     return '⚠️'
    case 'TICKET_STATUS_CHANGED': return '🔔'
    case 'COMMENT_ADDED':         return '💬'
    case 'ADMIN_BROADCAST':       return '📢'
    case 'REGISTRATION_REQUEST':  return '📋'
    case 'REGISTRATION_APPROVED': return '✅'
    case 'REGISTRATION_REJECTED': return '❌'
    default:                      return '🔔'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE 4: NotificationBell
//   • Clicking the bell icon opens a popup panel (not a dropdown)
//   • Current UI blurs in the background
//   • Panel shows all notifications with a "Mark all read" button
//   • Each notification can be individually marked as read on click
// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationBell() {
  const [unread, setUnread]           = useState(0)
  const [open, setOpen]               = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]         = useState(false)
  const [markingAll, setMarkingAll]   = useState(false)
  const panelRef                      = useRef(null)

  // Poll unread count every 30 seconds
  useEffect(() => {
    void loadCount()
    const interval = setInterval(loadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  async function loadCount() {
    try { setUnread(await fetchUnreadCount()) } catch { /* silent */ }
  }

  async function openPanel() {
    setOpen(true)
    setLoading(true)
    try {
      const data = await fetchMyNotifications()
      setNotifications(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
    // Refresh unread count too
    await loadCount()
  }

  async function handleMarkRead(notifId) {
    try {
      await markNotificationRead(notifId)
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      )
      setUnread(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)
    } catch { /* silent */ }
    finally { setMarkingAll(false) }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      {/* ── Bell button ── */}
      <button
        className="notify-btn"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        onClick={openPanel}
      >
        <span className="nav-icon-shell">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4a4 4 0 0 0-4 4v1.3c0 1.1-.36 2.18-1.02 3.05L5.6 14.1A1 1 0 0 0 6.4 15.7h11.2a1 1 0 0 0 .8-1.6l-1.38-1.75A5.07 5.07 0 0 1 16 9.3V8a4 4 0 0 0-4-4Z" />
            <path d="M10 18a2 2 0 0 0 4 0" />
          </svg>
        </span>
        {unread > 0 && (
          <span className="notify-count">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {/* CHANGE 4: Blurred backdrop + popup box ───────────────────────────── */}
      {open && (
        <>
          {/* Backdrop: blurs the current UI */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 900,
              backdropFilter: 'blur(4px)',
              background: 'rgba(16, 33, 43, 0.28)',
            }}
            aria-hidden="true"
          />

          {/* Notification panel box */}
          <div
            ref={panelRef}
            role="dialog"
            aria-label="All Notifications"
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 910,
              width: 'min(520px, 94vw)',
              maxHeight: '80vh',
              background: '#fff',
              borderRadius: '1.4rem',
              boxShadow: '0 28px 70px rgba(16,33,43,0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.2rem 1.4rem 0.9rem',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#10212b' }}>
                  All Notifications
                </h2>
                {unreadCount > 0 && (
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                    {unreadCount} unread
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={markingAll}
                    style={{
                      fontSize: '0.8rem', fontWeight: 700,
                      color: '#0f5c5a', background: '#d9efec',
                      border: 'none', borderRadius: '0.55rem',
                      padding: '0.38rem 0.75rem', cursor: 'pointer',
                      opacity: markingAll ? 0.6 : 1,
                    }}
                  >
                    {markingAll ? 'Marking…' : '✓ Mark all read'}
                  </button>
                )}
                {/* Close button */}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                  style={{
                    width: '2rem', height: '2rem', border: 'none',
                    background: '#f3f4f6', borderRadius: '50%',
                    cursor: 'pointer', fontSize: '1rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#6b7280',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                  Loading notifications…
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🔔</div>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>
                    You have no notifications yet.
                  </p>
                </div>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {notifications.map(n => (
                    <li
                      key={n.id}
                      onClick={() => {
                        if (!n.read) handleMarkRead(n.id);
                        setSelectedNotification(n);
                      }}
                      style={{
                        display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
                        padding: '0.9rem 1.4rem',
                        borderBottom: '1px solid #f3f4f6',
                        background: n.read ? '#fff' : '#f0fdf4',
                        cursor: 'pointer',
                        transition: 'background 120ms ease',
                      }}
                    >
                      {/* Type icon */}
                      <span style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1.2, marginTop: '0.1rem' }}>
                        {typeIcon(n.type)}
                      </span>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: '0 0 0.18rem',
                          fontWeight: n.read ? 500 : 700,
                          fontSize: '0.9rem',
                          color: '#10212b',
                          lineHeight: 1.35,
                        }}>
                          {n.title}
                        </p>
                        <p style={{
                          margin: '0 0 0.3rem',
                          fontSize: '0.83rem',
                          color: '#4b5563',
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                        }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>

                      {/* Unread dot */}
                      {!n.read && (
                        <span style={{
                          width: '0.6rem', height: '0.6rem', borderRadius: '50%',
                          background: '#0f5c5a', flexShrink: 0, marginTop: '0.4rem',
                        }} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Notification Detail Modal (Popup) ── */}
      {selectedNotification && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setSelectedNotification(null)}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedNotification(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1.25rem',
                background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                color: '#6b7280', fontWeight: 600
              }}
            >
              &times;
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#111827', paddingRight: '1rem' }}>
              {selectedNotification.title}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div>{new Date(selectedNotification.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              <div>
                <strong>Type:</strong> <span style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{selectedNotification.type}</span>
              </div>
            </div>
            <div style={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0, background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              {selectedNotification.message}
            </div>
          </div>
        </div>
      )}
    </>
  )
}