import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { formatCurrency, getStatusInfo, ORDER_STATUSES, formatDateTime } from '../../utils/helpers';
import { SkeletonTable } from '../../components/ui/Skeleton';

function AdminOrders() {
  const { get, patch, loading } = useApi();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
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

  const filteredOrders = search
    ? orders.filter(o => (o.user?.email || o.name || '').toLowerCase().includes(search.toLowerCase()) || o._id.includes(search))
    : orders;

  if (loading && orders.length === 0) return <SkeletonTable rows={10} />;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Orders</h2>
            <p style={{ color: '#6b7280', fontSize: 14 }}>{pagination.total} orders total</p>
          </div>
          <div style={{ position: 'relative', maxWidth: 280 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 14px 9px 38px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setStatusFilter(''); setPagination(p => ({ ...p, page: 1 })); }}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: !statusFilter ? '#111827' : '#f3f4f6', color: !statusFilter ? '#fff' : '#6b7280',
              transition: 'all 0.2s',
            }}
          >
            All
          </button>
          {ORDER_STATUSES.filter(s => s.value !== 'cancelled').map(s => (
            <button
              key={s.value}
              onClick={() => { setStatusFilter(s.value); setPagination(p => ({ ...p, page: 1 })); }}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: statusFilter === s.value ? '#e85d04' : '#f3f4f6', color: statusFilter === s.value ? '#fff' : '#6b7280',
                transition: 'all 0.2s',
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: 24 }}>
        <div className="admin-table-wrapper" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    style={{ cursor: 'pointer', background: selectedOrder?._id === order._id ? '#f9fafb' : undefined }}
                  >
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.user?.email || order.name || 'N/A'}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`badge-status badge-${order.status}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="admin-pagination">
              <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>← Prev</button>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Page {pagination.page} of {pagination.pages}</span>
              <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next →</button>
            </div>
          )}
        </div>

        {selectedOrder && (
          <div style={{ position: 'sticky', top: 88, alignSelf: 'flex-start', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Order #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: '#f3f4f6', border: 'none', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6b7280' }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Customer</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedOrder.user?.email || 'N/A'}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{selectedOrder.deliveryAddress || selectedOrder.name}</div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Items</div>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: i < selectedOrder.items.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <span style={{ color: '#374151' }}>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#6b7280' }}>Delivery</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#2b9348' }}>
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                  <span>Total</span>
                  <span style={{ color: '#e85d04' }}>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Update Status</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {getNextStatuses(selectedOrder.status).map(status => {
                    const info = getStatusInfo(status);
                    const colorMap = { confirmed: '#3b82f6', preparing: '#8b5cf6', ready: '#2b9348', out_for_delivery: '#0891b2', delivered: '#16a34a', cancelled: '#ef4444' };
                    const bgMap = { confirmed: '#dbeafe', preparing: '#ede9fe', ready: '#d1fae5', out_for_delivery: '#cffafe', delivered: '#dcfce7', cancelled: '#fee2e2' };
                    return (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedOrder._id, status)}
                        style={{
                          padding: '6px 12px', fontSize: 12, fontWeight: 600,
                          border: 'none', borderRadius: 8,
                          background: bgMap[status] || '#f3f4f6', color: colorMap[status] || '#6b7280',
                          cursor: 'pointer', transition: 'opacity 0.2s',
                        }}
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
