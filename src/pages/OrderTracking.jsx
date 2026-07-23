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

  if (loading) return <div style={{ marginTop: '150px' }}><Loader /></div>;
  if (error) return (
    <div className="container-lg" style={{ marginTop: '150px', textAlign: 'center' }}>
      <h2>Order Not Found</h2>
      <p className="text-muted">{error}</p>
      <button className="btn btn-primary mt-3" onClick={() => navigate('/userprofile')}>Back to Account</button>
    </div>
  );

  return (
    <div className="tracking-page">
      <div className="container-lg" style={{ paddingTop: '120px', paddingBottom: '80px', maxWidth: '800px' }}>
        <div className="tracking-header">
          <h1>Order #{order._id.slice(-8)}</h1>
          <span className={`tracking-status-badge tracking-status-${order.status}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        <p className="tracking-date">Placed on {new Date(order.createdAt).toLocaleString()}</p>

        {order.status !== 'cancelled' && (
          <div className="tracking-progress">
            <div className="tracking-progress-bar">
              <div className="tracking-progress-fill" style={{ width: `${((getStatusIndex() + 1) / statusSteps.length) * 100}%` }}></div>
            </div>
            <div className="tracking-steps">
              {statusSteps.map((step, idx) => {
                const isComplete = idx <= getStatusIndex();
                const isCurrent = idx === getStatusIndex();
                return (
                  <div key={step} className={`tracking-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="tracking-step-dot">{isComplete ? '✓' : idx + 1}</div>
                    <span className="tracking-step-label">{statusLabels[step]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {order.estimatedDelivery && (
          <div className="tracking-eta">
            <span>Estimated delivery:</span>
            <strong>{new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
        )}

        <div className="tracking-card">
          <h3>Order Items</h3>
          {order.items.map((item, idx) => (
            <div key={idx} className="tracking-item">
              <div className="tracking-item-info">
                <span className="tracking-item-qty">{item.quantity}×</span>
                <div>
                  <strong>{item.name || item.menuItem?.name}</strong>
                  {item.variant && <small className="text-muted"> ({item.variant})</small>}
                  {item.addOns?.length > 0 && <small className="text-muted"> +{item.addOns.map(a => a.name).join(', ')}</small>}
                </div>
              </div>
              <span className="tracking-item-price">GH₵ {(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="tracking-totals">
            <div><span>Subtotal</span><span>GH₵ {order.subtotal?.toFixed(2) || (order.total - (order.tax || 0) - (order.deliveryFee || 0) + (order.discount || 0)).toFixed(2)}</span></div>
            {order.tax > 0 && <div><span>Tax</span><span>GH₵ {order.tax.toFixed(2)}</span></div>}
            {order.deliveryFee > 0 && <div><span>Delivery</span><span>GH₵ {order.deliveryFee.toFixed(2)}</span></div>}
            {order.discount > 0 && <div><span>Discount</span><span className="text-success">-GH₵ {order.discount.toFixed(2)}</span></div>}
            <div className="tracking-total"><span>Total</span><span>GH₵ {order.total.toFixed(2)}</span></div>
          </div>
        </div>

        {order.timeline && order.timeline.length > 0 && (
          <div className="tracking-card">
            <h3>Timeline</h3>
            {order.timeline.slice().reverse().map((t, idx) => (
              <div key={idx} className="tracking-timeline-item">
                <div className="tracking-timeline-dot"></div>
                <div>
                  <strong>{statusLabels[t.status] || t.status}</strong>
                  {t.note && <p className="text-muted small">{t.note}</p>}
                  <small className="text-muted">{new Date(t.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="tracking-actions">
          {!['cancelled', 'delivered'].includes(order.status) && (
            <button className="btn btn-outline-danger" onClick={async () => {
              if (window.confirm('Cancel this order?')) {
                try {
                  await axiosFetch.post(`/api/orders/${order._id}/cancel`);
                  fetchOrder();
                } catch (err) { alert(err.response?.data?.message || 'Failed'); }
              }
            }}>Cancel Order</button>
          )}
          {order.status === 'delivered' && (
            <button className="btn btn-primary" onClick={() => navigate('/menu')}>Order Again</button>
          )}
          <button className="btn btn-outline-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;
