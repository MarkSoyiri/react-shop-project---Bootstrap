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
            const data = await get(`/orders/all?${params}`);
            setOrders(data.orders || data || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || (data.orders || data || []).length);
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
            setSelectedOrder(data.order || data);
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
        <div>
            <PageHeader title="Orders" subtitle="Manage and fulfill customer orders" />

            {/* Status Filters */}
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
                <SkeletonTable rows={8} cols={7} />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--admin-text-muted)" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    title="No orders found"
                    description="Orders will appear here when customers place them."
                />
            ) : (
                <>
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
                                                <td style={{ fontWeight: 600, fontSize: 13 }}>#{order._id?.slice(-8)}</td>
                                                <td>
                                                    <div style={{ fontSize: 14 }}>{order.user?.username || 'Guest'}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{order.user?.email || ''}</div>
                                                </td>
                                                <td>{order.items?.length || 0} items</td>
                                                <td style={{ fontWeight: 700 }}>GH₵ {Number(order.total || 0).toFixed(2)}</td>
                                                <td><span className={`admin-badge ${order.status}`}><span className="admin-badge-dot" />{STATUS_LABELS[order.status] || order.status}</span></td>
                                                <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{order.deliveryType || 'delivery'}</td>
                                                <td style={{ fontSize: 13, color: 'var(--admin-text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
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
                </>
            )}

            {/* Order Detail Side Panel */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div className="admin-side-panel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} />
                        <motion.div className="admin-side-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
                            <div className="admin-side-panel-header">
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Order #{selectedOrder._id?.slice(-8)}</h3>
                                    <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                                </div>
                                <button className="admin-btn admin-btn-icon admin-btn-ghost" onClick={() => setSelectedOrder(null)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>

                            <div className="admin-side-panel-body">
                                {detailLoading ? (
                                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--admin-text-muted)' }}>Loading...</div>
                                ) : (
                                    <>
                                        {/* Status */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Status</div>
                                            <span className={`admin-badge ${selectedOrder.status}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                                                <span className="admin-badge-dot" />{STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                                            </span>
                                        </div>

                                        {/* Customer */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Customer</div>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedOrder.user?.username || 'Guest'}</div>
                                            <div style={{ fontSize: 13, color: 'var(--admin-text-secondary)' }}>{selectedOrder.user?.email || ''}</div>
                                            {selectedOrder.user?.phone && <div style={{ fontSize: 13, color: 'var(--admin-text-secondary)' }}>{selectedOrder.user.phone}</div>}
                                        </div>

                                        {/* Delivery Address */}
                                        {selectedOrder.deliveryAddress && (
                                            <div style={{ marginBottom: 24 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Delivery Address</div>
                                                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}</div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Items</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {(selectedOrder.items || []).map((item, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'spaceBetween', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.quantity}× {item.menuItem?.name || item.name || 'Item'}</div>
                                                            {(item.variant || item.addOns) && (
                                                                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>
                                                                    {item.variant && <span>Size: {item.variant}</span>}
                                                                    {item.addOns?.length > 0 && <span> + {item.addOns.join(', ')}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: 14, fontWeight: 600 }}>GH₵ {Number(item.price * item.quantity || 0).toFixed(2)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Totals */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                                                <span style={{ color: 'var(--admin-text-secondary)' }}>Subtotal</span>
                                                <span>GH₵ {Number(selectedOrder.subtotal || selectedOrder.total || 0).toFixed(2)}</span>
                                            </div>
                                            {selectedOrder.deliveryFee > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                                                    <span style={{ color: 'var(--admin-text-secondary)' }}>Delivery Fee</span>
                                                    <span>GH₵ {Number(selectedOrder.deliveryFee).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.discount > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6, color: 'var(--admin-success)' }}>
                                                    <span>Discount</span>
                                                    <span>-GH₵ {Number(selectedOrder.discount).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, borderTop: '1px solid var(--admin-border-light)', paddingTop: 10, marginTop: 6 }}>
                                                <span>Total</span>
                                                <span style={{ color: 'var(--admin-brand)' }}>GH₵ {Number(selectedOrder.total || 0).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Payment */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Payment</div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <span className="admin-badge confirmed" style={{ fontSize: 12 }}>{selectedOrder.paymentMethod || 'Cash'}</span>
                                                <span className={`admin-badge ${selectedOrder.paymentStatus === 'paid' ? 'delivered' : 'pending'}`}>
                                                    {selectedOrder.paymentStatus || 'pending'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {selectedOrder.notes && (
                                            <div style={{ marginBottom: 24 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Notes</div>
                                                <div style={{ fontSize: 14, padding: '10px 14px', background: '#f9fafb', borderRadius: 8 }}>{selectedOrder.notes}</div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Status Actions */}
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
