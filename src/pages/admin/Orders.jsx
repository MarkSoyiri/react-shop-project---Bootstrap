import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { formatCurrency, getStatusInfo, ORDER_STATUSES, formatDateTime } from '../../utils/helpers';
import { SkeletonTable } from '../../components/ui/Skeleton';

function AdminOrders() {
  const { get, patch, loading } = useApi();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [pagination.page, statusFilter]);

  const loadOrders = async () => {
    try {
      const params = new URLSearchParams({ page: pagination.page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await get(`/orders/all?${params}`);
      setOrders(res.data.orders || res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await patch(`/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const getNextStatuses = (current) => {
    const flow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready'],
      ready: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: [],
    };
    return flow[current] || [];
  };

  if (loading && orders.length === 0) return <SkeletonTable rows={10} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Orders</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            {pagination.total} orders total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`quick-action-btn ${!statusFilter ? 'active' : ''}`}
            style={!statusFilter ? { borderColor: 'var(--color-brand)', color: 'var(--color-brand)' } : {}}
            onClick={() => { setStatusFilter(''); setPagination(p => ({ ...p, page: 1 })); }}
          >
            All
          </button>
          {ORDER_STATUSES.filter(s => s.value !== 'cancelled').map(s => (
            <button
              key={s.value}
              className="quick-action-btn"
              style={statusFilter === s.value ? { borderColor: 'var(--color-brand)', color: 'var(--color-brand)' } : {}}
              onClick={() => { setStatusFilter(s.value); setPagination(p => ({ ...p, page: 1 })); }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: 24 }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    style={{ cursor: 'pointer', background: selectedOrder?._id === order._id ? 'var(--color-bg-alt)' : undefined }}
                  >
                    <td style={{ fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.user?.email || order.name || 'N/A'}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{order.orderType || 'delivery'}</td>
                    <td>
                      <span className={`badge-status badge-${order.status}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="admin-pagination">
              <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                ← Prev
              </button>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                Next →
              </button>
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="admin-card" style={{ position: 'sticky', top: 96, alignSelf: 'flex-start' }}>
            <div className="admin-card-header">
              <h3>Order #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div className="admin-card-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Customer</div>
                <div style={{ fontWeight: 600 }}>{selectedOrder.user?.email || 'N/A'}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {selectedOrder.deliveryAddress || selectedOrder.name}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Items</div>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>Delivery</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-accent)' }}>
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-brand)' }}>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Update Status</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {getNextStatuses(selectedOrder.status).map(status => {
                    const info = getStatusInfo(status);
                    return (
                      <button
                        key={status}
                        className="quick-action-btn"
                        onClick={() => updateStatus(selectedOrder._id, status)}
                        style={{ fontSize: 12, padding: '8px 14px' }}
                      >
                        {info.icon} {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
