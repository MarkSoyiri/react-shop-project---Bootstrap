import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosFetch from '../api/axiosFetchAPI';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, getPaymentStatusInfo, getPaymentMethodLabel, PAYSTACK_PUBLIC_KEY, API_BASE } from '../utils/helpers';
import Loader from '../components/Loader';
import './OrderConfirmation.css';

function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCleared, setCartCleared] = useState(false);
  const [retrying, setRetrying] = useState(false);

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

  if (loading) return <div style={{ paddingTop: 84 }}><Loader /></div>;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '84px 24px' }}>
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
    <div className="oc-page">
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
          className="oc-success-icon"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="oc-title"
        >
          Order Confirmed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="oc-subtitle"
        >
          Thank you for your order. We're preparing it now!
        </motion.p>

        {/* Order Number Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="oc-card"
        >
          <div className="oc-header">
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Order Number</div>
              <div className="oc-order-num">#{order.orderNumber}</div>
            </div>
            <span className="oc-status-badge">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
            </span>
          </div>

          <div className="oc-info-grid">
            <div>
              <div className="oc-info-label">Delivery Method</div>
              <div className="oc-info-value">
                {order.orderType === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
              </div>
            </div>
            <div>
              <div className="oc-info-label">Est. Time</div>
              <div className="oc-info-value">⏱️ {estimatedTime}</div>
            </div>
            <div>
              <div className="oc-info-label">Payment Method</div>
              <div className="oc-info-value">
                {getPaymentMethodLabel(order.paymentMethod)}
              </div>
            </div>
            <div>
              <div className="oc-info-label">Total</div>
              <div className="oc-info-value" style={{ fontWeight: 700, color: 'var(--color-brand)' }}>{formatCurrency(order.total)}</div>
            </div>
          </div>

          {/* Payment Status Card */}
          {order.paymentMethod === 'card' || order.paymentMethod === 'pay_online' ? (
            <div className="oc-payment-status" style={{
              background: getPaymentStatusInfo(order.paymentStatus || 'pending').bgColor,
              border: `1px solid ${getPaymentStatusInfo(order.paymentStatus || 'pending').color}30`
            }}>
              <div className="oc-payment-row">
                <span className="oc-payment-label">Payment Status</span>
                <span className="oc-payment-value" style={{ color: getPaymentStatusInfo(order.paymentStatus || 'pending').color }}>
                  {getPaymentStatusInfo(order.paymentStatus || 'pending').icon} {getPaymentStatusInfo(order.paymentStatus || 'pending').label}
                </span>
              </div>
              {order.paymentReference && (
                <div className="oc-payment-ref">Reference: {order.paymentReference}</div>
              )}
              {order.paidAt && (
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
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
          className="oc-card"
        >
          <h3 className="oc-items-title">Order Summary</h3>
          {order.items.map((item, idx) => (
            <div key={idx} className="oc-item">
              <div className="oc-item-left">
                <span className="oc-item-qty">{item.quantity}×</span>
                <span className="oc-item-name">{item.name}</span>
              </div>
              <span className="oc-item-price">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
            </div>
          ))}

          <div className="oc-totals">
            <div className="oc-total-row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.tax > 0 && (
              <div className="oc-total-row">
                <span>Tax (15%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div className="oc-total-row">
                <span>Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            {deliveryFee === 0 && (
              <div className="oc-total-row" style={{ color: 'var(--color-accent)' }}>
                <span>Delivery</span>
                <span style={{ fontWeight: 600 }}>Free</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="oc-total-row" style={{ color: 'var(--color-accent)' }}>
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="oc-total-row final">
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
          className="oc-actions"
        >
          {(order.paymentMethod === 'card' || order.paymentMethod === 'pay_online') && ['pending', 'failed'].includes(order.paymentStatus) && (
            <button
              className="oc-btn-primary"
              disabled={retrying}
              onClick={async () => {
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
                      callback: function () {
                        axiosFetch.get(`/api/orders/${id}`).then(({ data }) => setOrder(data));
                        setRetrying(false);
                      },
                      onClose: function () { setRetrying(false); },
                    });
                    handler.openIframe();
                  };
                  script.onerror = () => { alert('Failed to load payment gateway.'); setRetrying(false); };
                  document.body.appendChild(script);
                } catch { alert('Payment retry failed.'); setRetrying(false); }
              }}
            >
              {retrying ? 'Processing...' : 'Pay Now'}
            </button>
          )}
          <Link to={`/order/${order._id}`} className="oc-btn-primary">
            Track Order →
          </Link>
          <Link to="/menu" className="oc-btn-secondary">
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default OrderConfirmation;
