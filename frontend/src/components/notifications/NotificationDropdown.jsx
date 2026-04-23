import { useState, useRef, useEffect, useCallback } from 'react'
import { BellIcon } from 'lucide-react'
import {
  fetchMyNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../api/notificationApi'
import { useAuth } from '../../context/useAuth'

function getNotifIcon(type) {
  switch (type) {
    case 'BOOKING_APPROVED':      return '✅'
    case 'BOOKING_REJECTED':      return '❌'
    case 'BOOKING_CANCELLED':     return '🚫'
    case 'TICKET_STATUS_CHANGED': return '🔧'
    case 'COMMENT_ADDED':         return '💬'
    case 'ADMIN_BROADCAST':       return '📢'
    case 'REGISTRATION_REQUEST':  return '📋'
    default:                      return '🔔'
  }
}

function formatNotifDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMin = Math.floor((now - d) / 60000)
  if (diffMin < 1)  return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `${diffH}h ago`
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default function NotificationDropdown({ className = "" }) {
  const { user } = useAuth()
  const [notifOpen, setNotifOpen]         = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [notifLoading, setNotifLoading]   = useState(false)
  const notifRef = useRef(null)

  const loadUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const count = await fetchUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.warn("Failed to fetch unread count", err)
    }
  }, [user])

  useEffect(() => {
    void loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [loadUnreadCount])

  useEffect(() => {
    if (!notifOpen) return
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  async function openNotifPanel() {
    setNotifOpen(true)
    setNotifLoading(true)
    try {
      const data = await fetchMyNotifications()
      setNotifications(data)
    } catch (err) {
      console.warn("Failed to fetch notifications", err)
    } finally {
      setNotifLoading(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark read", err)
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all read", err)
    }
  }

  if (!user) return null

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={notifRef}>
      <button
        type="button"
        className={`notify-btn ${className}`}
        aria-label="Notifications"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0.5rem',
          borderRadius: '0.6rem',
          border: '1px solid #e2e8f0',
          background: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={() => notifOpen ? setNotifOpen(false) : openNotifPanel()}
      >
        <BellIcon size={20} className="text-muted-foreground" />
        {unreadCount > 0 && (
          <span
            className="notify-count"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700',
              minWidth: '16px',
              height: '16px',
              borderRadius: '99px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {notifOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: '340px',
          maxHeight: '450px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  fontSize: '10px',
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  borderRadius: '99px',
                  padding: '2px 8px',
                  marginLeft: '8px'
                }}>
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  fontSize: '12px',
                  color: '#10b981',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  padding: '4px'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, backgroundColor: '#fcfcfd' }}>
            {notifLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: n.read ? 'white' : '#f0fdf4',
                    cursor: n.read ? 'default' : 'pointer',
                    transition: 'background-color 0.1s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>
                      {getNotifIcon(n.type)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: n.read ? '500' : '700',
                        color: '#1f2937',
                        lineHeight: '1.4'
                      }}>
                        {n.title}
                      </p>
                      <p style={{
                        margin: '2px 0 0',
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: '1.4'
                      }}>
                        {n.message}
                      </p>
                      <p style={{
                        margin: '6px 0 0',
                        fontSize: '11px',
                        color: '#9ca3af'
                      }}>
                        {formatNotifDate(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '99px',
                        backgroundColor: '#10b981',
                        flexShrink: 0,
                        marginTop: '4px'
                      }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
