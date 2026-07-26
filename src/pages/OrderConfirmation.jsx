import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosFetch from '../api/axiosFetchAPI';
import { CartContext } from '../context/CartContext';
import { formatCurrency, getPaymentStatusInfo, getPaymentMethodLabel, API_BASE } from '../utils/helpers';
import Loader from '../components/Loader';

function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosFetch.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (order && !cartCleared) {
      clearCart();
      setCartCleared(true);
    }
  }, [order, cartCleared, clearCart]);

  useEffect(() => {
    if (!order) return;
    if (order.paymentStatus === 'paid') return;
    if (order.paymentMethod !== 'card' && order.paymentMethod !== 'pay_online') return;

    const ref = order.paymentReference;
    if (!ref) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;

    const verify = async () => {
      if (cancelled || attempts >= maxAttempts) return;
      attempts++;
      try {
        const { data: verifyData } = await axiosFetch.get(`/api/payments/verify/${ref}`);
        if (verifyData?.data?.payment?.status === 'paid') {
          const refreshed = await axiosFetch.get(`/api/orders/${id}`);
          if (!cancelled) setOrder(refreshed.data);
          return;
        }
      } catch (e) {
      }
      setTimeout(verify, 2000);
    };

    verify();
    return () => { cancelled = true; };
  }, [id, order?.paymentStatus, order?.paymentMethod, order?.paymentReference]);

  if (loading) return <div style={{ marginTop: 100, paddingTop: 80 }}><Loader /></div>;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '120px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔍</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Order Not Found</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>{error}</p>
      <button onClick={() => navigate('/menu')} style={{ background: 'var(--color-brand)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
        Browse Menu
      </button>
    </div>
  );

  const deliveryFee = order.deliveryFee || 0;
  const estimatedTime = order.orderType === 'delivery' ? '45 min' : '25 min';

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 24px 60px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center' }}
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(16,185,129,0.3)'
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}
        >
          Order Confirmed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 32 }}
        >
          Thank you for your order. We're preparing it now!
        </motion.p>

        {/* Order Number Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            padding: 24,
            marginBottom: 20,
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Order Number</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-brand)' }}>#{order.orderNumber}</div>
            </div>
            <span style={{
              background: '#fff7ed',
              color: 'var(--color-brand)',
              fontWeight: 600,
              fontSize: 13,
              padding: '4px 14px',
              borderRadius: 999,
              border: '1px solid #fed7aa'
            }}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, background: 'var(--color-bg-alt)', borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Delivery Method</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {order.orderType === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Est. Time</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>⏱️ {estimatedTime}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Payment Method</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {getPaymentMethodLabel(order.paymentMethod)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-brand)' }}>{formatCurrency(order.total)}</div>
            </div>
          </div>

          {/* Payment Status Card */}
          {order.paymentMethod === 'card' || order.paymentMethod === 'pay_online' ? (
            <div style={{
              marginTop: 12,
              padding: 16,
              borderRadius: 12,
              background: getPaymentStatusInfo(order.paymentStatus || 'pending').bgColor,
              border: `1px solid ${getPaymentStatusInfo(order.paymentStatus || 'pending').color}30`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Payment Status</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: getPaymentStatusInfo(order.paymentStatus || 'pending').color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {getPaymentStatusInfo(order.paymentStatus || 'pending').icon} {getPaymentStatusInfo(order.paymentStatus || 'pending').label}
                </span>
              </div>
              {order.paymentReference && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                  Reference: {order.paymentReference}
                </div>
              )}
              {order.paidAt && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  Paid: {new Date(order.paidAt).toLocaleString()}
                </div>
              )}
            </div>
          ) : null}
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid var(--color-border)',
            padding: 24,
            marginBottom: 20,
            textAlign: 'left'
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Order Summary</h3>
          {order.items.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-bg-alt)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-brand)', background: '#fff7ed', padding: '2px 8px', borderRadius: 6 }}>
                  {item.quantity}×
                </span>
                <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, flexShrink: 0, marginLeft: 12 }}>
                {formatCurrency(item.priceAtPurchase * item.quantity)}
              </span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 8, paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                <span>Tax (15%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                <span>Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            {deliveryFee === 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-accent)', marginBottom: 6 }}>
                <span>Delivery</span>
                <span style={{ fontWeight: 600 }}>Free</span>
              </div>
            )}
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-accent)', marginBottom: 6 }}>
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}>
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            to={`/order/${order._id}`}
            style={{
              background: 'var(--color-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            Track Order →
          </Link>
          <Link
            to="/menu"
            style={{
              background: '#fff',
              color: 'var(--color-text)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default OrderConfirmation;
