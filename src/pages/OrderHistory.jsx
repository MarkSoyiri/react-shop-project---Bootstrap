import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { formatCurrency, formatDateTime, getStatusInfo, getPaymentStatusInfo, PAYSTACK_PUBLIC_KEY, API_BASE } from '../utils/helpers';

function OrderHistory() {
  const { user, token } = useContext(AuthContext);
  const { get, post, loading } = useApi();
  const [orders, setOrders] = useState([]);
  const [retryingOrderId, setRetryingOrderId] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewItems, setReviewItems] = useState([]);
  const [submittingReviews, setSubmittingReviews] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await get('/orders');
      setOrders(res.orders || res.data || []);
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
      pending: { background: '#fff7ed', color: 'var(--color-brand)', border: '1px solid #fed7aa' },
      placed: { background: '#fff7ed', color: 'var(--color-brand)', border: '1px solid #fed7aa' },
      accepted: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
      confirmed: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
      preparing: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
      ready: { background: '#f5f3ff', color: '#5b21b6', border: '1px solid #ddd6fe' },
      out_for_delivery: { background: '#fff7ed', color: 'var(--color-brand-dark)', border: '1px solid #fed7aa' },
      picked_up: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' },
      delivered: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' },
      completed: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' },
      cancelled: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
      rejected: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
    };
    return { ...base, ...(map[status] || { background: '#fff7ed', color: 'var(--color-brand)', border: '1px solid #fed7aa' }) };
  };

  const retryPayment = async (order, e) => {
    e.stopPropagation();
    if (retryingOrderId) return;
    setRetryingOrderId(order._id);

    try {
      const payRes = await fetch(`${API_BASE}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order._id }),
      });
      const payData = await payRes.json();

      if (!payData.success) {
        alert(payData.error || 'Payment initialization failed');
        setRetryingOrderId(null);
        return;
      }

      const { reference } = payData.data;

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => {
        const handler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: user?.email || '',
          amount: Math.round(order.total * 100),
          currency: 'GHS',
          ref: reference,
          callback: function () {
            alert('Payment successful!');
            loadOrders();
            setRetryingOrderId(null);
          },
          onClose: function () {
            setRetryingOrderId(null);
          },
        });
        handler.openIframe();
      };
      script.onerror = () => {
        alert('Failed to load payment gateway. Please try again.');
        setRetryingOrderId(null);
      };
      document.body.appendChild(script);
    } catch {
      alert('Payment retry failed. Please try again.');
      setRetryingOrderId(null);
    }
  };

  const openReviewModal = (order, e) => {
    e.stopPropagation();
    setReviewOrder(order);
    setReviewItems(order.items.map(item => ({
      menuItemId: item.menuItem?._id || item.menuItem,
      name: item.name,
      rating: 5,
      comment: '',
    })));
    setReviewSubmitted(false);
  };

  const updateReviewItem = (index, field, value) => {
    setReviewItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const submitReviews = async () => {
    setSubmittingReviews(true);
    try {
      const results = await Promise.allSettled(
        reviewItems.map(item =>
          post(`/menu/${item.menuItemId}/reviews`, { rating: item.rating, comment: item.comment })
        )
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      if (succeeded > 0) {
        setReviewSubmitted(true);
        setTimeout(() => { setReviewOrder(null); }, 2000);
      } else {
        alert('Failed to submit reviews. Please try again.');
      }
    } catch {
      alert('Failed to submit reviews. Please try again.');
    } finally {
      setSubmittingReviews(false);
    }
  };

  const StarRating = ({ rating, onChange, size = 28 }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 6,
            fontSize: size, lineHeight: 1, color: star <= rating ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s', minWidth: 40, minHeight: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '84px 24px 60px' }}>
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
                    #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {formatDateTime(order.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={statusBadgeStyle(order.status)}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                  {(order.paymentMethod === 'card' || order.paymentMethod === 'pay_online') && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: getPaymentStatusInfo(order.paymentStatus || 'pending').bgColor,
                      color: getPaymentStatusInfo(order.paymentStatus || 'pending').color,
                      border: `1px solid ${getPaymentStatusInfo(order.paymentStatus || 'pending').color}30`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {getPaymentStatusInfo(order.paymentStatus || 'pending').icon} {getPaymentStatusInfo(order.paymentStatus || 'pending').label}
                    </span>
                  )}
                </div>
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {['delivered', 'completed'].includes(order.status) && (
                    <button
                      onClick={(e) => openReviewModal(order, e)}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        background: '#f59e0b',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        cursor: 'pointer',
                        minHeight: 40
                      }}
                    >
                      ★ Rate
                    </button>
                  )}
                  {(order.paymentMethod === 'card' || order.paymentMethod === 'pay_online') &&
                    ['pending', 'failed'].includes(order.paymentStatus) && (
                    <button
                      onClick={(e) => retryPayment(order, e)}
                      disabled={retryingOrderId === order._id}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        background: retryingOrderId === order._id ? '#94a3b8' : 'var(--color-brand)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        cursor: retryingOrderId === order._id ? 'not-allowed' : 'pointer',
                        minHeight: 40
                      }}
                    >
                      {retryingOrderId === order._id ? 'Processing...' : 'Retry Payment'}
                    </button>
                  )}
                  <span
                    onClick={() => navigate(`/order/${order._id}`)}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-brand)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      minHeight: 40,
                      borderRadius: 8
                    }}
                  >
                    View →
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submittingReviews && setReviewOrder(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 24, backdropFilter: 'blur(4px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 20, padding: 28,
                width: '100%', maxWidth: 480, maxHeight: '85vh',
                overflow: 'auto', border: '1px solid var(--color-border)'
              }}
            >
              {reviewSubmitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Thank You!</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Your reviews have been submitted.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Rate Your Order</h3>
                    <button
                      onClick={() => setReviewOrder(null)}
                      disabled={submittingReviews}
                      style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 10, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                    #{reviewOrder.orderNumber} — How was your meal?
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {reviewItems.map((item, idx) => (
                      <div key={idx} style={{ padding: 16, background: 'var(--color-bg-alt)', borderRadius: 12 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{item.name}</div>
                        <div style={{ marginBottom: 10 }}>
                          <StarRating
                            rating={item.rating}
                            onChange={(val) => updateReviewItem(idx, 'rating', val)}
                          />
                        </div>
                        <textarea
                          value={item.comment}
                          onChange={e => updateReviewItem(idx, 'comment', e.target.value)}
                          placeholder="Tell us about your experience (optional)"
                          rows={2}
                          style={{
                            width: '100%', padding: '10px 12px', border: '1.5px solid var(--color-border)',
                            borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none',
                            background: '#fff', color: 'var(--color-text)', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={submitReviews}
                    disabled={submittingReviews}
                    style={{
                      width: '100%', marginTop: 20, padding: '14px',
                      background: submittingReviews ? '#94a3b8' : 'var(--color-brand)',
                      color: '#fff', border: 'none', borderRadius: 12,
                      fontSize: 15, fontWeight: 700, cursor: submittingReviews ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submittingReviews ? 'Submitting...' : 'Submit Reviews'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrderHistory;
