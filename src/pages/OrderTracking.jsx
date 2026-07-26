import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosFetch from '../api/axiosFetchAPI';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, getStatusInfo, getPaymentStatusInfo, getPaymentMethodLabel, getOrderActions, PAYSTACK_PUBLIC_KEY, API_BASE } from '../utils/helpers';
import Loader from '../components/Loader';
import './OrderTracking.css';

function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewItems, setReviewItems] = useState([]);
  const [submittingReviews, setSubmittingReviews] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const statusSteps = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed'];
  const statusStepsPickup = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'completed'];

  const statusLabels = {
    pending: 'Pending', placed: 'Pending', accepted: 'Accepted', confirmed: 'Accepted',
    preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'Out for Delivery',
    picked_up: 'Picked Up', delivered: 'Delivered', completed: 'Completed',
    cancelled: 'Cancelled', rejected: 'Rejected'
  };

  const statusIcons = {
    pending: '⏳', placed: '⏳', accepted: '✅', confirmed: '✅', preparing: '👨‍🍳',
    ready: '📦', out_for_delivery: '🚗', picked_up: '📦', delivered: '🎉', completed: '🎉', cancelled: '❌', rejected: '❌'
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const { data } = await axiosFetch.get(`/api/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order || order.paymentStatus === 'paid') return;
    const timer = setTimeout(async () => {
      try {
        const { data } = await axiosFetch.get(`/api/orders/${id}`);
        setOrder(data);
      } catch {}
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, order?.paymentStatus]);

  const getActiveSteps = () => {
    if (order?.orderType === 'pickup') return statusStepsPickup;
    return statusSteps;
  };

  const getNormalizedStatus = (status) => {
    if (status === 'placed') return 'pending';
    if (status === 'confirmed') return 'accepted';
    return status;
  };

  const getStatusIndex = () => {
    const steps = getActiveSteps();
    const normalized = getNormalizedStatus(order?.status);
    return steps.indexOf(normalized);
  };

  const handleAction = async (key, e) => {
    switch (key) {
      case 'cancel':
        if (window.confirm('Cancel this order?')) {
          setCancelling(true);
          try {
            await axiosFetch.post(`/api/orders/${order._id}/cancel`);
            fetchOrder();
          } catch (err) { alert(err.response?.data?.message || 'Failed'); }
          finally { setCancelling(false); }
        }
        break;

      case 'retry-payment':
        setRetrying(true);
        try {
          const payRes = await fetch(`${API_BASE}/payments/initialize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ orderId: order._id }),
          });
          const payData = await payRes.json();
          if (!payData.success) { alert(payData.error || 'Payment init failed'); setRetrying(false); return; }
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
              callback: function () { fetchOrder(); setRetrying(false); },
              onClose: function () { setRetrying(false); },
            });
            handler.openIframe();
          };
          script.onerror = () => { alert('Failed to load payment gateway.'); setRetrying(false); };
          document.body.appendChild(script);
        } catch { alert('Payment retry failed.'); setRetrying(false); }
        break;

      case 'reorder':
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
        break;

      case 'review':
        setReviewItems(order.items.map(item => ({
          menuItemId: item.menuItem?._id || item.menuItem,
          name: item.name,
          rating: 5,
          comment: '',
        })));
        setReviewSubmitted(false);
        setShowReview(true);
        break;

      case 'receipt':
        try {
          const res = await axiosFetch.get(`/api/orders/${order._id}/receipt`);
          setReceiptData(res.data.receipt || null);
        } catch {
          setReceiptData(null);
        }
        setShowReceipt(true);
        break;

      case 'refund-status':
        alert(order.paymentStatus === 'refunded'
          ? `Refund confirmed for order #${order.orderNumber}. The amount has been refunded to your original payment method.`
          : `Refund is being processed for order #${order.orderNumber}. Please allow 5-10 business days.`
        );
        break;

      case 'track':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;

      default:
        break;
    }
  };

  const submitReviews = async () => {
    setSubmittingReviews(true);
    try {
      const results = await Promise.allSettled(
        reviewItems.map(item =>
          axiosFetch.post(`/api/menu/${item.menuItemId}/reviews`, { rating: item.rating, comment: item.comment })
        )
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      if (succeeded > 0) {
        setReviewSubmitted(true);
        setTimeout(() => setShowReview(false), 2000);
      } else {
        alert('Failed to submit reviews. You can only review items from completed, paid orders.');
      }
    } catch {
      alert('Failed to submit reviews.');
    } finally {
      setSubmittingReviews(false);
    }
  };

  const actions = order ? getOrderActions(order) : [];

  const cardStyle = {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    border: '1px solid var(--color-border)',
    marginBottom: 20
  };

  if (loading) return <div style={{ paddingTop: 84 }}><Loader /></div>;
  if (error) return (
    <div style={{ paddingTop: 84, textAlign: 'center', paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔍</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Order Not Found</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>{error}</p>
      <button
        onClick={() => navigate('/userprofile')}
        style={{
          background: 'var(--color-brand)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Back to Account
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '84px 24px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Order #{order.orderNumber || order._id.slice(-8)}</h1>
        <span style={{
          background: order.status === 'delivered' || order.status === 'completed' ? '#ecfdf5' : order.status === 'cancelled' || order.status === 'rejected' ? '#fef2f2' : '#fff7ed',
          color: order.status === 'delivered' || order.status === 'completed' ? '#065f46' : order.status === 'cancelled' || order.status === 'rejected' ? '#991b1b' : 'var(--color-brand)',
          fontWeight: 600,
          fontSize: 13,
          padding: '4px 14px',
          borderRadius: 999,
          border: `1px solid ${order.status === 'delivered' || order.status === 'completed' ? '#a7f3d0' : order.status === 'cancelled' || order.status === 'rejected' ? '#fecaca' : '#fed7aa'}`
        }}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 32 }}>
        Placed on {new Date(order.createdAt).toLocaleString()}
      </p>

      {/* Progress Bar */}
      {order.status !== 'cancelled' && order.status !== 'rejected' && (
        <div style={cardStyle}>
          <div className="tracking-progress-steps" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 3, background: 'var(--color-bg-alt)', borderRadius: 2, zIndex: 0 }} />
            <div style={{
              position: 'absolute', top: 20, left: 20,
              width: `${Math.max(0, (getStatusIndex() / (getActiveSteps().length - 1)) * (100 - (40 / getActiveSteps().length)))}%`,
              maxWidth: 'calc(100% - 40px)', height: 3, background: 'var(--color-accent)', borderRadius: 2, zIndex: 1, transition: 'width 0.4s'
            }} />

            {getActiveSteps().map((step, idx) => {
              const isComplete = idx <= getStatusIndex();
              const isCurrent = idx === getStatusIndex();
              return (
                <div key={step} className="tracking-progress-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isComplete && !isCurrent ? 16 : 13, fontWeight: 700,
                    background: isComplete ? 'var(--color-accent)' : '#fff',
                    color: isComplete ? '#fff' : 'var(--color-text-secondary)',
                    border: isCurrent ? '3px solid var(--color-brand)' : isComplete ? '3px solid var(--color-accent)' : '3px solid var(--color-border)',
                    transition: 'all 0.3s', flexShrink: 0
                  }}>
                    {isComplete && !isCurrent ? '✓' : statusIcons[step]}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--color-brand)' : isComplete ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    marginTop: 8, textAlign: 'center', lineHeight: 1.2
                  }}>
                    {statusLabels[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ETA */}
      {order.estimatedDelivery && !['cancelled', 'rejected', 'delivered', 'completed'].includes(order.status) && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⏰</span>
          <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Estimated delivery:</span>
          <strong style={{ fontSize: 14 }}>{new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
        </div>
      )}

      {/* Payment Status */}
      {(order.paymentMethod === 'card' || order.paymentMethod === 'pay_online') && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Payment</div>
              <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999,
                  fontSize: 13, fontWeight: 700,
                  background: getPaymentStatusInfo(order.paymentStatus || 'pending').bgColor,
                  color: getPaymentStatusInfo(order.paymentStatus || 'pending').color,
                  border: `1px solid ${getPaymentStatusInfo(order.paymentStatus || 'pending').color}30`
                }}>
                  {getPaymentStatusInfo(order.paymentStatus || 'pending').icon} {getPaymentStatusInfo(order.paymentStatus || 'pending').label}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{getPaymentMethodLabel(order.paymentMethod)}</div>
              {order.paymentReference && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'monospace', marginTop: 2 }}>{order.paymentReference}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Order Items</h3>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-bg-alt)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-brand)', background: '#fff7ed', padding: '2px 8px', borderRadius: 6, flexShrink: 0 }}>{item.quantity}x</span>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name || item.menuItem?.name}</span>
                {item.variant && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}> ({item.variant})</span>}
                {item.addOns?.length > 0 && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}> +{item.addOns.map(a => a.name).join(', ')}</span>}
              </div>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, flexShrink: 0 }}>GH₵ {(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 8, paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            <span>Subtotal</span>
            <span>GH₵ {order.subtotal?.toFixed(2) || (order.total - (order.tax || 0) - (order.deliveryFee || 0) + (order.discount || 0)).toFixed(2)}</span>
          </div>
          {order.tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              <span>Tax</span><span>GH₵ {order.tax.toFixed(2)}</span>
            </div>
          )}
          {order.deliveryFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              <span>Delivery</span><span>GH₵ {order.deliveryFee.toFixed(2)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-accent)', marginBottom: 6 }}>
              <span>Discount</span><span>-GH₵ {order.discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}>
            <span>Total</span><span>GH₵ {order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Timeline</h3>
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--color-border)', borderRadius: 1 }} />
            {order.timeline.slice().reverse().map((t, idx) => (
              <div key={idx} style={{ position: 'relative', paddingBottom: idx < order.timeline.length - 1 ? 24 : 0 }}>
                <div style={{
                  position: 'absolute', left: -28, top: 4, width: 16, height: 16, borderRadius: 999,
                  background: idx === 0 ? 'var(--color-brand)' : 'var(--color-border)',
                  border: idx === 0 ? '3px solid #fff7ed' : '3px solid #fff', zIndex: 1
                }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{statusLabels[t.status] || t.status}</div>
                  {t.note && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t.note}</div>}
                  {t.adminName && <div style={{ fontSize: 12, color: 'var(--color-brand)', marginBottom: 2 }}>by {t.adminName}</div>}
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{new Date(t.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="tracking-actions">
          {actions.map(action => {
            let isLoading = false;
            let isDisabled = false;
            let label = `${action.icon} ${action.label}`;
            if (action.key === 'retry-payment') { isLoading = retrying; isDisabled = retrying; label = retrying ? '⏳ Processing...' : `${action.icon} ${action.label}`; }
            if (action.key === 'cancel') { isLoading = cancelling; isDisabled = cancelling; label = cancelling ? '⏳ Cancelling...' : `${action.icon} ${action.label}`; }

            const baseClass = 'tracking-action-btn';
            const variantClass = action.variant === 'primary' ? 'tracking-action-primary'
              : action.variant === 'danger' ? 'tracking-action-danger'
              : action.variant === 'ghost' ? 'tracking-action-ghost'
              : action.variant === 'secondary' ? 'tracking-action-secondary'
              : 'tracking-action-outline';

            return (
              <button
                key={action.key}
                className={`${baseClass} ${variantClass}`}
                disabled={isDisabled}
                onClick={(e) => handleAction(action.key, e)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .tracking-progress-steps { overflow-x: auto !important; scrollbar-width: none !important; flex-wrap: nowrap !important; padding-bottom: 8px !important; gap: 4px !important; }
          .tracking-progress-steps::-webkit-scrollbar { display: none !important; }
          .tracking-progress-step { min-width: 72px !important; flex-shrink: 0 !important; }
          .tracking-progress-step span { font-size: 10px !important; }
        }
      `}</style>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div className="ot-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReceipt(false)}>
            <motion.div className="ot-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="ot-modal-header">
                <h3>Receipt</h3>
                <button className="ot-modal-close" onClick={() => setShowReceipt(false)}>✕</button>
              </div>
              <div className="ot-receipt">
                <div className="ot-receipt-brand">
                  <div className="ot-receipt-brand-name">ZESTY CAVE</div>
                  <div className="ot-receipt-brand-sub">Official Receipt</div>
                </div>
                <div className="ot-receipt-divider" />
                <div className="ot-receipt-info-row">
                  <span>Order #{order.orderNumber}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {receiptData?.paidAt && (
                  <div className="ot-receipt-info-row">
                    <span>Paid</span>
                    <span>{new Date(receiptData.paidAt).toLocaleString()}</span>
                  </div>
                )}
                <div className="ot-receipt-divider" />
                <div className="ot-receipt-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="ot-receipt-item">
                      <div className="ot-receipt-item-left">
                        <span className="ot-receipt-item-qty">{item.quantity}x</span>
                        <span className="ot-receipt-item-name">{item.name}</span>
                      </div>
                      <span className="ot-receipt-item-price">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="ot-receipt-divider" />
                <div className="ot-receipt-totals">
                  <div className="ot-receipt-total-row"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                  {order.tax > 0 && <div className="ot-receipt-total-row"><span>Tax (15%)</span><span>{formatCurrency(order.tax)}</span></div>}
                  {order.deliveryFee > 0 && <div className="ot-receipt-total-row"><span>Delivery</span><span>{formatCurrency(order.deliveryFee)}</span></div>}
                  {order.discount > 0 && <div className="ot-receipt-total-row ot-receipt-discount"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
                  <div className="ot-receipt-total-row ot-receipt-grand"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
                </div>
                <div className="ot-receipt-divider" />
                <div className="ot-receipt-footer">
                  <div>Thank you for your order!</div>
                  <div className="ot-receipt-footer-sub">Zesty Cave — Eat Happy</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReview && (
          <motion.div className="ot-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !submittingReviews && setShowReview(false)}>
            <motion.div className="ot-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              {reviewSubmitted ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
                  <h3>Thank You!</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>Your reviews have been submitted.</p>
                </div>
              ) : (
                <>
                  <div className="ot-modal-header">
                    <h3>Rate Your Order</h3>
                    <button className="ot-modal-close" onClick={() => setShowReview(false)} disabled={submittingReviews}>✕</button>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>#{order.orderNumber} — How was your meal?</div>
                  <div className="ot-review-items">
                    {reviewItems.map((item, idx) => (
                      <div key={idx} className="ot-review-item">
                        <div className="ot-review-item-name">{item.name}</div>
                        <div className="ot-review-stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button" className="ot-star-btn" onClick={() => setReviewItems(prev => prev.map((r, i) => i === idx ? { ...r, rating: star } : r))} style={{ color: star <= item.rating ? '#f59e0b' : '#d1d5db' }}>★</button>
                          ))}
                        </div>
                        <textarea className="ot-review-textarea" value={item.comment} onChange={e => setReviewItems(prev => prev.map((r, i) => i === idx ? { ...r, comment: e.target.value } : r))} placeholder="Tell us about your experience (optional)" rows={2} />
                      </div>
                    ))}
                  </div>
                  <button className={`ot-submit-btn ${submittingReviews ? 'ot-submit-btn--disabled' : 'ot-submit-btn--active'}`} onClick={submitReviews} disabled={submittingReviews}>
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

export default OrderTracking;
