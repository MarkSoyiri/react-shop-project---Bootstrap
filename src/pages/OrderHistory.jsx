import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { formatCurrency, formatDateTime, getStatusInfo } from '../utils/helpers';

function OrderHistory() {
  const { user } = useContext(AuthContext);
  const { get, loading } = useApi();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await get('/orders');
      setOrders(res.data || []);
    } catch (err) { console.error(err); }
  };

  if (!user) {
    return (
      <div className="order-history-page" style={{ textAlign: 'center' }}>
        <h2>Please sign in to view your orders</h2>
        <button className="btn-premium" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>My Orders</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
          {orders.length} orders placed
        </p>

        <div className="order-history-list">
          {orders.map((order, i) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <motion.div
                key={order._id}
                className="order-history-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/order/${order._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="order-header">
                  <div>
                    <div className="order-id">Order #{order._id.slice(-6).toUpperCase()}</div>
                    <div className="order-date">{formatDateTime(order.createdAt)}</div>
                  </div>
                  <span className={`badge-status badge-${order.status}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>
                <div className="order-items-preview">
                  {order.items?.slice(0, 4).map((item, j) => (
                    <div key={j} style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {item.name} × {item.quantity}
                      {j < Math.min(order.items.length, 4) - 1 ? ',' : ''}
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>
                <div className="order-footer">
                  <span className="order-total">{formatCurrency(order.total)}</span>
                  <button
                    className="quick-action-btn"
                    style={{ fontSize: 12, padding: '6px 14px' }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/order/${order._id}`); }}
                  >
                    Track Order →
                  </button>
                </div>
              </motion.div>
            );
          })}
          {orders.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📦</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No orders yet</h3>
              <p style={{ marginBottom: 24 }}>Start ordering and your history will appear here</p>
              <button className="btn-premium" onClick={() => navigate('/menu')}>Browse Menu</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
