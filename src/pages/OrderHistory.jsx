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
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔒</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Please sign in to view your orders</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>You need to be signed in to access your order history</p>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'var(--color-brand)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  const statusBadgeStyle = (status) => {
    const base = {
      fontSize: 12,
      fontWeight: 600,
      padding: '4px 12px',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0
    };
    const map = {
      delivered: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' },
      cancelled: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
      preparing: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
      ready: { background: '#f5f3ff', color: '#5b21b6', border: '1px solid #ddd6fe' },
      out_for_delivery: { background: '#fff7ed', color: 'var(--color-brand-dark)', border: '1px solid #fed7aa' },
    };
    return { ...base, ...(map[status] || { background: '#fff7ed', color: 'var(--color-brand)', border: '1px solid #fed7aa' }) };
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px 60px' }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Order History</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32, fontSize: 14 }}>
        {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
      </p>

      {/* Empty state */}
      {orders.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.25 }}>📦</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No orders yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>
            Start ordering and your history will appear here
          </p>
          <button
            onClick={() => navigate('/menu')}
            style={{
              background: 'var(--color-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Browse Menu
          </button>
        </div>
      )}

      {/* Order cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {orders.map((order, i) => {
          const statusInfo = getStatusInfo(order.status);
          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              onClick={() => navigate(`/order/${order._id}`)}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 20,
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s'
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {formatDateTime(order.createdAt)}
                  </div>
                </div>
                <span style={statusBadgeStyle(order.status)}>
                  {statusInfo.icon} {statusInfo.label}
                </span>
              </div>

              {/* Items preview */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {order.items?.slice(0, 5).map((item, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-bg-alt)',
                      padding: '3px 10px',
                      borderRadius: 6
                    }}
                  >
                    {item.name} × {item.quantity}
                  </span>
                ))}
                {order.items?.length > 5 && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '3px 6px' }}>
                    +{order.items.length - 5} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  {formatCurrency(order.total)}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  View Details →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderHistory;
