import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosFetch from '../api/axiosFetchAPI';
import Loader from '../components/Loader';
import './OrderTracking.css';

function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusSteps = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const statusLabels = {
    placed: 'Order Placed', confirmed: 'Confirmed', preparing: 'Preparing',
    ready: 'Ready', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
  };

  const statusIcons = {
    placed: '📝', confirmed: '✅', preparing: '👨‍🍳',
    ready: '📦', out_for_delivery: '🚗', delivered: '🎉', cancelled: '❌'
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

  const getStatusIndex = () => statusSteps.indexOf(order?.status);

  const cardStyle = {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    border: '1px solid var(--color-border)',
    marginBottom: 20
  };

  if (loading) return <div style={{ marginTop: 150 }}><Loader /></div>;
  if (error) return (
    <div style={{ marginTop: 150, textAlign: 'center', padding: '0 24px' }}>
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
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Order #{order._id.slice(-8)}</h1>
        <span style={{
          background: order.status === 'delivered' ? '#ecfdf5' : order.status === 'cancelled' ? '#fef2f2' : '#fff7ed',
          color: order.status === 'delivered' ? '#065f46' : order.status === 'cancelled' ? '#991b1b' : 'var(--color-brand)',
          fontWeight: 600,
          fontSize: 13,
          padding: '4px 14px',
          borderRadius: 999,
          border: `1px solid ${order.status === 'delivered' ? '#a7f3d0' : order.status === 'cancelled' ? '#fecaca' : '#fed7aa'}`
        }}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 32 }}>
        Placed on {new Date(order.createdAt).toLocaleString()}
      </p>

      {/* Progress Bar */}
      {order.status !== 'cancelled' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              height: 3,
              background: 'var(--color-bg-alt)',
              borderRadius: 2,
              zIndex: 0
            }} />
            <div style={{
              position: 'absolute',
              top: 20,
              left: 20,
              width: `${Math.max(0, (getStatusIndex() / (statusSteps.length - 1)) * (100 - (40 / 7)) )}%`,
              maxWidth: 'calc(100% - 40px)',
              height: 3,
              background: 'var(--color-accent)',
              borderRadius: 2,
              zIndex: 1,
              transition: 'width 0.4s'
            }} />

            {statusSteps.map((step, idx) => {
              const isComplete = idx <= getStatusIndex();
              const isCurrent = idx === getStatusIndex();
              return (
                <div key={step} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                  flex: 1,
                  minWidth: 0
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isComplete && !isCurrent ? 16 : 13,
                    fontWeight: 700,
                    background: isComplete ? 'var(--color-accent)' : '#fff',
                    color: isComplete ? '#fff' : 'var(--color-text-secondary)',
                    border: isCurrent ? '3px solid var(--color-brand)' : isComplete ? '3px solid var(--color-accent)' : '3px solid var(--color-border)',
                    transition: 'all 0.3s',
                    flexShrink: 0
                  }}>
                    {isComplete && !isCurrent ? '✓' : statusIcons[step]}
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--color-brand)' : isComplete ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    marginTop: 8,
                    textAlign: 'center',
                    lineHeight: 1.2
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
      {order.estimatedDelivery && (
        <div style={{
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ fontSize: 18 }}>⏰</span>
          <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Estimated delivery:</span>
          <strong style={{ fontSize: 14 }}>
            {new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </strong>
        </div>
      )}

      {/* Order Items */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Order Items</h3>
        {order.items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-bg-alt)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--color-brand)',
                background: '#fff7ed',
                padding: '2px 8px',
                borderRadius: 6,
                flexShrink: 0
              }}>
                {item.quantity}×
              </span>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name || item.menuItem?.name}</span>
                {item.variant && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}> ({item.variant})</span>}
                {item.addOns?.length > 0 && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}> +{item.addOns.map(a => a.name).join(', ')}</span>}
              </div>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
              GH₵ {(item.priceAtPurchase * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 8, paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            <span>Subtotal</span>
            <span>GH₵ {order.subtotal?.toFixed(2) || (order.total - (order.tax || 0) - (order.deliveryFee || 0) + (order.discount || 0)).toFixed(2)}</span>
          </div>
          {order.tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              <span>Tax</span>
              <span>GH₵ {order.tax.toFixed(2)}</span>
            </div>
          )}
          {order.deliveryFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              <span>Delivery</span>
              <span>GH₵ {order.deliveryFee.toFixed(2)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-accent)', marginBottom: 6 }}>
              <span>Discount</span>
              <span>-GH₵ {order.discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}>
            <span>Total</span>
            <span>GH₵ {order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Timeline</h3>
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute',
              left: 7,
              top: 8,
              bottom: 8,
              width: 2,
              background: 'var(--color-border)',
              borderRadius: 1
            }} />

            {order.timeline.slice().reverse().map((t, idx) => (
              <div key={idx} style={{
                position: 'relative',
                paddingBottom: idx < order.timeline.length - 1 ? 24 : 0
              }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute',
                  left: -28,
                  top: 4,
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: idx === 0 ? 'var(--color-brand)' : 'var(--color-border)',
                  border: idx === 0 ? '3px solid #fff7ed' : '3px solid #fff',
                  zIndex: 1
                }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                    {statusLabels[t.status] || t.status}
                  </div>
                  {t.note && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 2 }}>
                      {t.note}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {new Date(t.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
        {!['cancelled', 'delivered'].includes(order.status) && (
          <button
            onClick={async () => {
              if (window.confirm('Cancel this order?')) {
                try {
                  await axiosFetch.post(`/api/orders/${order._id}/cancel`);
                  fetchOrder();
                } catch (err) { alert(err.response?.data?.message || 'Failed'); }
              }
            }}
            style={{
              background: '#fff',
              color: '#dc2626',
              border: '1.5px solid #fca5a5',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel Order
          </button>
        )}
        {order.status === 'delivered' && (
          <button
            onClick={() => navigate('/menu')}
            style={{
              background: 'var(--color-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Order Again
          </button>
        )}
        <button
          onClick={() => navigate('/menu')}
          style={{
            background: '#fff',
            color: 'var(--color-text)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 10,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Browse Menu
        </button>
      </div>
    </div>
  );
}

export default OrderTracking;
