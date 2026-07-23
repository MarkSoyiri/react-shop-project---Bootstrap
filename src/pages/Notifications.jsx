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
      <div className="notifications-page" style={{ textAlign: 'center' }}>
        <h2>Please sign in to view notifications</h2>
        <button className="btn-premium" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Notifications</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
              {unreadCount} unread
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="quick-action-btn" onClick={markAllAsRead}>
              Mark all read
            </button>
          )}
        </div>

        <div className="notification-list">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif._id}
              className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
            >
              <div className="notif-icon" style={{ background: getNotifColor(notif.type) }}>
                {getNotifIcon(notif.type)}
              </div>
              <div className="notif-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                {notif.data?.orderId && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/order/${notif.data.orderId}`); }}
                    style={{
                      marginTop: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600,
                      border: '1px solid var(--color-brand)', borderRadius: 'var(--radius-sm)',
                      background: 'transparent', color: 'var(--color-brand)', cursor: 'pointer',
                    }}
                  >
                    View Order
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className="notif-time">{formatDateTime(notif.createdAt)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 14 }}
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
          {notifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔔</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
