import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { PageHeader } from './components/PageHeader';
import { Pagination } from './components/Pagination';
import { SkeletonTable } from './components/Skeletons';
import { EmptyState } from './components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_FLOW = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready'],
    ready: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
};

const STATUS_LABELS = {
    pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready',
    out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
];

export default function Orders() {
    const { get, patch, loading } = useApi();
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const loadOrders = async () => {
        try {
            const params = new URLSearchParams({ page, limit: 15 });
            if (statusFilter !== 'all') params.set('status', statusFilter);
            const data = await get(`/orders/admin?${params}`);
            setOrders(data.orders || data.data || []);
            setTotalPages(data.pagination?.pages || data.totalPages || 1);
            setTotal(data.pagination?.total || data.total || (data.orders || data.data || []).length);
        } catch {}
    };

    useEffect(() => { loadOrders(); }, [page, statusFilter, get]);

    const filtered = orders.filter(o => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (o._id || '').toLowerCase().includes(q) ||
            (o.user?.email || '').toLowerCase().includes(q) ||
            (o.user?.username || '').toLowerCase().includes(q);
    });

    const openDetail = async (order) => {
        setSelectedOrder(order);
        setDetailLoading(true);
        try {
            const data = await get(`/orders/${order._id}`);
            setSelectedOrder(data.data || data.order || data);
        } catch {}
        setDetailLoading(false);
    };

    const updateStatus = async (orderId, newStatus) => {
        setUpdating(true);
        try {
            await patch(`/orders/${orderId}/status`, { status: newStatus });
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            loadOrders();
        } catch {}
        setUpdating(false);
    };

    const nextStatuses = selectedOrder ? (STATUS_FLOW[selectedOrder.status] || []) : [];

    return (
        <div className="admin-page">
            <PageHeader title="Orders" subtitle="Manage and fulfill customer orders" />

            <div className="admin-toolbar">
                <div className="admin-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="admin-filter-pills">
                    {FILTERS.map(f => (
                        <button key={f.key} className={`admin-filter-pill ${statusFilter === f.key ? 'active' : ''}`}
                            onClick={() => { setStatusFilter(f.key); setPage(1); }}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && !orders.length ? (
                <SkeletonTable rows={8} cols={8} />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon="fa-clipboard-list"
                    title="No orders found"
                    description="Orders will appear here when customers place them."
                />
            ) : (
                <motion.div className="admin-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="admin-card-body no-pad">
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Type</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(order => (
                                        <tr key={order._id}>
                                            <td className="fw-semibold">#{order._id?.slice(-8)}</td>
                                            <td>
                                                <div className="name">{order.user?.username || 'Guest'}</div>
                                                <div className="sub">{order.user?.email || ''}</div>
                                            </td>
                                            <td>{order.items?.length || 0} items</td>
                                            <td className="fw-semibold">GH₵ {Number(order.total || 0).toFixed(2)}</td>
                                            <td>
                                                <span className={`admin-badge ${order.status}`}>
                                                    <span className="admin-badge-dot" />
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                            </td>
                                            <td className="text-capitalize">{order.deliveryType || 'delivery'}</td>
                                            <td className="admin-date-text">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openDetail(order)}>View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
                </motion.div>
            )}

            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            className="admin-side-panel-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                        />
                        <motion.div
                            className="admin-side-panel"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="admin-side-panel-header">
                                <div>
                                    <h3 className="admin-card-title">Order #{selectedOrder._id?.slice(-8)}</h3>
                                    <div className="admin-date-text" style={{ marginTop: 2 }}>
                                        {new Date(selectedOrder.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <button className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => setSelectedOrder(null)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>

                            <div className="admin-side-panel-body">
                                {detailLoading ? (
                                    <div className="admin-customers__detail-loading">Loading...</div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: 24 }}>
                                            <div className="admin-reports-label" style={{ marginBottom: 8 }}>Status</div>
                                            <span className={`admin-badge ${selectedOrder.status}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                                                <span className="admin-badge-dot" />
                                                {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                                            </span>
                                        </div>

                                        <div style={{ marginBottom: 24 }}>
                                            <div className="admin-reports-label" style={{ marginBottom: 8 }}>Customer</div>
                                            <div className="admin-customers__name">{selectedOrder.user?.username || 'Guest'}</div>
                                            <div className="admin-customers__email">{selectedOrder.user?.email || ''}</div>
                                            {selectedOrder.user?.phone && (
                                                <div className="admin-customers__phone">{selectedOrder.user.phone}</div>
                                            )}
                                        </div>

                                        {selectedOrder.deliveryAddress && (
                                            <div style={{ marginBottom: 24 }}>
                                                <div className="admin-reports-label" style={{ marginBottom: 8 }}>Delivery Address</div>
                                                <div className="admin-form-text">
                                                    {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ marginBottom: 24 }}>
                                            <div className="admin-reports-label" style={{ marginBottom: 8 }}>Items</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {(selectedOrder.items || []).map((item, i) => (
                                                    <div key={i} className="admin-customers__detail-recent-item">
                                                        <div style={{ flex: 1 }}>
                                                            <div className="admin-customers__name" style={{ fontSize: 14 }}>
                                                                {item.quantity}× {item.menuItem?.name || item.name || 'Item'}
                                                            </div>
                                                            {(item.variant || item.addOns) && (
                                                                <div className="admin-customers__detail-email" style={{ marginTop: 2 }}>
                                                                    {item.variant && <span>Size: {item.variant}</span>}
                                                                    {item.addOns?.length > 0 && <span> + {item.addOns.join(', ')}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="fw-semibold">GH₵ {Number(item.price * item.quantity || 0).toFixed(2)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 24 }}>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted">Subtotal</span>
                                                <span>GH₵ {Number(selectedOrder.subtotal || selectedOrder.total || 0).toFixed(2)}</span>
                                            </div>
                                            {selectedOrder.deliveryFee > 0 && (
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Delivery Fee</span>
                                                    <span>GH₵ {Number(selectedOrder.deliveryFee).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.discount > 0 && (
                                                <div className="d-flex justify-content-between mb-2 text-success">
                                                    <span>Discount</span>
                                                    <span>-GH₵ {Number(selectedOrder.discount).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-between fw-semibold" style={{ fontSize: 17, borderTop: '1px solid var(--admin-border-light)', paddingTop: 10, marginTop: 6 }}>
                                                <span>Total</span>
                                                <span style={{ color: 'var(--admin-brand)' }}>GH₵ {Number(selectedOrder.total || 0).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 24 }}>
                                            <div className="admin-reports-label" style={{ marginBottom: 8 }}>Payment</div>
                                            <div className="d-flex gap-2">
                                                <span className="admin-badge confirmed">{selectedOrder.paymentMethod || 'Cash'}</span>
                                                <span className={`admin-badge ${selectedOrder.paymentStatus === 'paid' ? 'delivered' : 'pending'}`}>
                                                    {selectedOrder.paymentStatus || 'pending'}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedOrder.notes && (
                                            <div style={{ marginBottom: 24 }}>
                                                <div className="admin-reports-label" style={{ marginBottom: 8 }}>Notes</div>
                                                <div className="admin-form-text" style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 8, padding: '10px 14px' }}>
                                                    {selectedOrder.notes}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {!detailLoading && nextStatuses.length > 0 && (
                                <div className="admin-side-panel-footer">
                                    {nextStatuses.map(status => (
                                        <button
                                            key={status}
                                            className={`admin-btn ${status === 'cancelled' ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                                            disabled={updating}
                                            onClick={() => updateStatus(selectedOrder._id, status)}
                                            style={{ flex: 1 }}
                                        >
                                            {updating ? 'Updating...' : STATUS_LABELS[status] || status}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
