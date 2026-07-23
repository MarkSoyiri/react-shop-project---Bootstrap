import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { formatDateTime } from '../utils/helpers';

function Notifications() {
  const { user } = useContext(AuthContext);
  const { get, patch, del } = useApi();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await get('/notifications');
      setNotifications(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch (err) { console.error(err); }
  };

  const markAsRead = async (id) => {
    try {
      await patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id) => {
    try {
      await del(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) { console.error(err); }
  };

  const getNotifIcon = (type) => {
    const icons = {
      order_confirmed: '✓', order_preparing: '👨‍🍳', order_ready: '✅',
      order_delivered: '🎉', order_cancelled: '✕', promo_new: '🔥',
      promo_reminder: '📢', account_update: '👤', system: 'ℹ',
    };
    return icons[type] || 'ℹ';
  };

  const getNotifColor = (type) => {
    const colors = {
      order_confirmed: '#dbeafe', order_preparing: '#ede9fe', order_ready: '#d1fae5',
      order_delivered: '#dcfce7', order_cancelled: '#fee2e2', promo_new: '#fef3c7',
      promo_reminder: '#fef3c7', account_update: '#e0e7ff', system: '#f1f5f9',
    };
    return colors[type] || '#f1f5f9';
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Please sign in to view notifications</h2>
        <button onClick={() => navigate('/login')} style={{ marginTop: 16, padding: '12px 32px', borderRadius: 12, border: 'none', background: 'var(--color-brand)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--color-brand)', background: 'transparent', color: 'var(--color-brand)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--color-brand)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-brand)'; }}>
            Mark All Read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map((notif, i) => (
          <motion.div
            key={notif._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => !notif.isRead && markAsRead(notif._id)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
              transition: 'background 0.2s', position: 'relative',
              background: notif.isRead ? '#fff' : 'rgba(232,93,4,0.04)',
              border: '1px solid var(--color-border)',
              borderLeft: notif.isRead ? '3px solid transparent' : '3px solid var(--color-brand)',
            }}
            onMouseOver={e => e.currentTarget.style.background = notif.isRead ? 'var(--color-bg-alt)' : 'rgba(232,93,4,0.07)'}
            onMouseOut={e => e.currentTarget.style.background = notif.isRead ? '#fff' : 'rgba(232,93,4,0.04)'}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: getNotifColor(notif.type), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {getNotifIcon(notif.type)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: 'var(--color-text)' }}>{notif.title}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{notif.message}</div>
              {notif.data?.orderId && (
                <button onClick={e => { e.stopPropagation(); navigate(`/order/${notif.data.orderId}`); }} style={{ marginTop: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600, border: '1px solid var(--color-brand)', borderRadius: 8, background: 'transparent', color: 'var(--color-brand)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--color-brand)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-brand)'; }}>
                  View Order
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatDateTime(notif.createdAt)}</span>
              <button onClick={e => { e.stopPropagation(); deleteNotification(notif._id); }} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: 14, padding: 2, lineHeight: 1, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#dc2626'} onMouseOut={e => e.currentTarget.style.color = '#d1d5db'} title="Delete notification">
                &#10005;
              </button>
            </div>
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.25 }}>&#128276;</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No notifications yet</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
