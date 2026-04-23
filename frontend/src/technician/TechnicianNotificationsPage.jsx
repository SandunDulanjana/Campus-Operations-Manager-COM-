import { useEffect, useState } from 'react'
import {
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notificationApi'
import StatusBanner from '../components/ui/StatusBanner'
import ActionButton from '../components/ui/ActionButton'

function TechnicianNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState('')

  useEffect(() => { void loadNotifications() }, [])

  async function loadNotifications() {
    setLoading(true)
    try {
      const data = await fetchMyNotifications()
      setNotifications(data)
    } catch {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id)
      await loadNotifications()
    } catch {
      setError('Failed to mark notification as read')
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      setSuccess('All notifications marked as read.')
      await loadNotifications()
    } catch {
      setError('Failed to mark all as read')
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '–'
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <section className="admin-resources-page">
      <div className="admin-section-card">
        <div className="panel-header">
          <div>
            <h1>Notifications</h1>
            <p>View announcements and updates sent to you by campus administration.</p>
          </div>
          {unreadCount > 0 && (
            <ActionButton kind="approve" onClick={handleMarkAllRead}>
              Mark all as read ({unreadCount})
            </ActionButton>
          )}
        </div>
        <StatusBanner type="success" message={success} />
        <StatusBanner type="error"   message={error} />
      </div>

      <div className="table-panel">
        <h2>Your Notifications ({notifications.length})</h2>
        {loading ? (
          <p style={{ padding: '1rem', color: '#6b7280' }}>Loading…</p>
        ) : notifications.length === 0 ? (
          <p style={{ padding: '1rem', color: '#6b7280' }}>No notifications yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '1rem 1.25rem',
                  background: n.read ? '#f8fafc' : '#f0f9ff',
                  border: `1px solid ${n.read ? '#e2e8f0' : '#bae6fd'}`,
                  borderRadius: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <strong style={{ fontSize: '0.97rem', color: '#1f2937' }}>{n.title}</strong>
                    {!n.read && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700,
                        background: '#2563eb', color: '#fff',
                        borderRadius: 999, padding: '0.15rem 0.55rem',
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 0.4rem', color: '#374151', fontSize: '0.9rem' }}>{n.message}</p>
                  <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{formatDate(n.createdAt)}</span>
                </div>
                {!n.read && (
                  <ActionButton
                    kind="ghost"
                    onClick={() => handleMarkRead(n.id)}
                    style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', flexShrink: 0 }}
                  >
                    Mark read
                  </ActionButton>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default TechnicianNotificationsPage