import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import useApi from '../hooks/useApi';
import { formatCurrency, formatDateTime, getStatusInfo, getPaymentStatusInfo, getOrderActions, PAYSTACK_PUBLIC_KEY, API_BASE } from '../utils/helpers';

function OrderHistory() {
  const { user, token } = useContext(AuthContext);
  const { addToCart, clearCart } = useContext(CartContext);
  const { get, post, loading } = useApi();
  const [orders, setOrders] = useState([]);
  const [retryingOrderId, setRetryingOrderId] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewItems, setReviewItems] = useState([]);
  const [submittingReviews, setSubmittingReviews] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
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
      <div className="oh-signin">
        <div className="oh-signin-icon">🔒</div>
        <h2>Please sign in to view your orders</h2>
        <p>You need to be signed in to access your order history</p>
        <button className="oh-btn-primary" onClick={() => navigate('/login')}>Sign In</button>
      </div>
    );
  }

  const statusBadgeStyle = (status) => {
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
    return map[status] || { background: '#fff7ed', color: 'var(--color-brand)', border: '1px solid #fed7aa' };
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

  const cancelOrder = async (order, e) => {
    e.stopPropagation();
    if (!window.confirm(`Cancel order #${order.orderNumber}?`)) return;
    setCancellingId(order._id);
    try {
      await post(`/orders/${order._id}/cancel`);
      loadOrders();
    } catch (err) {
      alert(err?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = (order, e) => {
    e.stopPropagation();
    clearCart();
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart({
          _id: item.menuItem?._id || item.menuItem,
          name: item.name,
          price: item.priceAtPurchase,
          image: item.menuItem?.image || '',
          variant: item.variant || '',
          addOns: item.addOns || [],
          quantity: 1
        });
      }
    });
    navigate('/cart');
  };

  const handleReceipt = async (order, e) => {
    e.stopPropagation();
    try {
      const res = await get(`/orders/${order._id}/receipt`);
      setReceiptOrder(res.receipt || order);
    } catch {
      setReceiptOrder(order);
    }
  };

  const handleRefundStatus = (order, e) => {
    e.stopPropagation();
    alert(order.paymentStatus === 'refunded'
      ? `Refund confirmed for order #${order.orderNumber}. The amount has been refunded to your original payment method.`
      : `Refund is being processed for order #${order.orderNumber}. Please allow 5-10 business days for the refund to appear.`
    );
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
        alert('Failed to submit reviews. You can only review items from completed, paid orders.');
      }
    } catch {
      alert('Failed to submit reviews. Please try again.');
    } finally {
      setSubmittingReviews(false);
    }
  };

  const handleAction = (key, order, e) => {
    switch (key) {
      case 'retry-payment': retryPayment(order, e); break;
      case 'cancel': cancelOrder(order, e); break;
      case 'reorder': handleReorder(order, e); break;
      case 'receipt': handleReceipt(order, e); break;
      case 'review': openReviewModal(order, e); break;
      case 'track': navigate(`/order/${order._id}`); break;
      case 'refund-status': handleRefundStatus(order, e); break;
      case 'view': navigate(`/order/${order._id}`); break;
      default: break;
    }
  };

  const getActionBtnClass = (variant) => {
    const map = {
      primary: 'oh-btn oh-btn-primary-action',
      danger: 'oh-btn oh-btn-danger',
      outline: 'oh-btn oh-btn-outline',
      secondary: 'oh-btn oh-btn-secondary',
      ghost: 'oh-btn oh-btn-ghost',
    };
    return map[variant] || 'oh-btn oh-btn-outline';
  };

  return (
    <div className="oh-page">
      <h2 className="oh-title">Order History</h2>
      <p className="oh-subtitle">
        {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
      </p>

      {orders.length === 0 && !loading && (
        <div className="oh-empty">
          <div className="oh-empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start ordering and your history will appear here</p>
          <button className="oh-btn-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
        </div>
      )}

      <div className="oh-list">
        {orders.map((order, i) => {
          const statusInfo = getStatusInfo(order.status);
          const payInfo = getPaymentStatusInfo(order.paymentStatus || 'pending');
          const isCard = order.paymentMethod === 'card' || order.paymentMethod === 'pay_online';
          const actions = getOrderActions(order);
          const visibleActions = actions.filter(a => a.key !== 'view').slice(0, 3);
          const hasMore = actions.filter(a => a.key !== 'view').length > 3;

          return (
            <motion.div
              key={order._id}
              className="oh-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => navigate(`/order/${order._id}`)}
            >
              <div className="oh-card-header">
                <div>
                  <div className="oh-card-id">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</div>
                  <div className="oh-card-date">{formatDateTime(order.createdAt)}</div>
                </div>
                <div className="oh-card-badges">
                  <span className="oh-status-badge" style={statusBadgeStyle(order.status)}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                  {isCard && (
                    <span className="oh-payment-badge" style={{
                      background: payInfo.bgColor,
                      color: payInfo.color,
                      border: `1px solid ${payInfo.color}30`,
                    }}>
                      {payInfo.icon} {payInfo.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="oh-items">
                {order.items?.slice(0, 5).map((item, j) => (
                  <span key={j} className="oh-item-tag">
                    {item.name} x{item.quantity}
                  </span>
                ))}
                {order.items?.length > 5 && (
                  <span className="oh-items-more">+{order.items.length - 5} more</span>
                )}
              </div>

              <div className="oh-card-footer">
                <span className="oh-total">{formatCurrency(order.total)}</span>
                <div className="oh-card-actions" onClick={e => e.stopPropagation()}>
                  {visibleActions.map(action => (
                    <button
                      key={action.key}
                      className={`${getActionBtnClass(action.variant)} ${action.key === 'retry-payment' && retryingOrderId === order._id ? 'oh-btn--loading' : ''} ${action.key === 'cancel' && cancellingId === order._id ? 'oh-btn--loading' : ''}`}
                      disabled={(action.key === 'retry-payment' && retryingOrderId === order._id) || (action.key === 'cancel' && cancellingId === order._id)}
                      onClick={(e) => handleAction(action.key, order, e)}
                    >
                      {action.key === 'retry-payment' && retryingOrderId === order._id ? 'Processing...' : action.key === 'cancel' && cancellingId === order._id ? 'Cancelling...' : `${action.icon} ${action.label}`}
                    </button>
                  ))}
                  {hasMore && (
                    <button className="oh-btn oh-btn-ghost" onClick={() => navigate(`/order/${order._id}`)}>
                      More →
                    </button>
                  )}
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
            className="oh-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submittingReviews && setReviewOrder(null)}
          >
            <motion.div
              className="oh-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {reviewSubmitted ? (
                <div className="oh-thankyou">
                  <div className="oh-thankyou-icon">✨</div>
                  <h3>Thank You!</h3>
                  <p>Your reviews have been submitted.</p>
                </div>
              ) : (
                <>
                  <div className="oh-modal-header">
                    <h3>Rate Your Order</h3>
                    <button
                      className="oh-modal-close"
                      onClick={() => setReviewOrder(null)}
                      disabled={submittingReviews}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="oh-modal-order-num">
                    #{reviewOrder.orderNumber} — How was your meal?
                  </div>

                  <div className="oh-review-items">
                    {reviewItems.map((item, idx) => (
                      <div key={idx} className="oh-review-item">
                        <div className="oh-review-item-name">{item.name}</div>
                        <div className="oh-review-stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className="oh-star-btn"
                              onClick={() => updateReviewItem(idx, 'rating', star)}
                              style={{ color: star <= item.rating ? '#f59e0b' : '#d1d5db' }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="oh-review-textarea"
                          value={item.comment}
                          onChange={e => updateReviewItem(idx, 'comment', e.target.value)}
                          placeholder="Tell us about your experience (optional)"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    className={`oh-submit-btn ${submittingReviews ? 'oh-submit-btn--disabled' : 'oh-submit-btn--active'}`}
                    onClick={submitReviews}
                    disabled={submittingReviews}
                  >
                    {submittingReviews ? 'Submitting...' : 'Submit Reviews'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receiptOrder && (
          <motion.div
            className="oh-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReceiptOrder(null)}
          >
            <motion.div
              className="oh-modal oh-receipt-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="oh-modal-header">
                <h3>Order Receipt</h3>
                <button className="oh-modal-close" onClick={() => setReceiptOrder(null)}>✕</button>
              </div>

              <div className="oh-receipt">
                <div className="oh-receipt-brand">
                  <div className="oh-receipt-brand-name">ZESTY CAVE</div>
                  <div className="oh-receipt-brand-sub">Official Receipt</div>
                </div>

                <div className="oh-receipt-divider" />

                <div className="oh-receipt-info-row">
                  <span>Order #{receiptOrder.orderNumber}</span>
                  <span>{new Date(receiptOrder.date || receiptOrder.createdAt).toLocaleDateString()}</span>
                </div>
                {receiptOrder.paidAt && (
                  <div className="oh-receipt-info-row">
                    <span>Paid</span>
                    <span>{new Date(receiptOrder.paidAt).toLocaleString()}</span>
                  </div>
                )}

                <div className="oh-receipt-divider" />

                <div className="oh-receipt-items">
                  {(receiptOrder.items || []).map((item, idx) => (
                    <div key={idx} className="oh-receipt-item">
                      <div className="oh-receipt-item-left">
                        <span className="oh-receipt-item-qty">{item.quantity}x</span>
                        <div>
                          <span className="oh-receipt-item-name">{item.name}</span>
                          {item.variant && <span className="oh-receipt-item-variant"> ({item.variant})</span>}
                        </div>
                      </div>
                      <span className="oh-receipt-item-price">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="oh-receipt-divider" />

                <div className="oh-receipt-totals">
                  <div className="oh-receipt-total-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(receiptOrder.subtotal)}</span>
                  </div>
                  {receiptOrder.tax > 0 && (
                    <div className="oh-receipt-total-row">
                      <span>Tax (15%)</span>
                      <span>{formatCurrency(receiptOrder.tax)}</span>
                    </div>
                  )}
                  {receiptOrder.deliveryFee > 0 && (
                    <div className="oh-receipt-total-row">
                      <span>Delivery</span>
                      <span>{formatCurrency(receiptOrder.deliveryFee)}</span>
                    </div>
                  )}
                  {receiptOrder.discount > 0 && (
                    <div className="oh-receipt-total-row oh-receipt-discount">
                      <span>Discount</span>
                      <span>-{formatCurrency(receiptOrder.discount)}</span>
                    </div>
                  )}
                  <div className="oh-receipt-total-row oh-receipt-grand">
                    <span>Total</span>
                    <span>{formatCurrency(receiptOrder.total)}</span>
                  </div>
                </div>

                <div className="oh-receipt-divider" />

                <div className="oh-receipt-footer">
                  <div>Thank you for your order!</div>
                  <div className="oh-receipt-footer-sub">Zesty Cave — Eat Happy</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrderHistory;
