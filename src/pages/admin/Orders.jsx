import { useState, useEffect, useCallback, useRef } from 'react';
import useApi from '../../hooks/useApi';
import { getPaymentStatusInfo, getPaymentMethodLabel, formatCurrency } from '../../utils/helpers';
import { PageHeader } from './components/PageHeader';
import { Pagination } from './components/Pagination';
import { SkeletonTable } from './components/Skeletons';
import { EmptyState } from './components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_FLOW = {
    pending: ['accepted', 'rejected'],
    placed: ['accepted', 'rejected'],
    accepted: ['preparing', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready'],
    ready: ['out_for_delivery', 'picked_up'],
    out_for_delivery: ['delivered'],
    picked_up: ['completed'],
    delivered: ['completed'],
    cancelled: [],
    rejected: [],
    completed: [],
};

const STATUS_LABELS = {
    pending: 'Pending', placed: 'Pending', accepted: 'Accepted', confirmed: 'Accepted',
    preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'Out for Delivery',
    picked_up: 'Picked Up', delivered: 'Delivered', completed: 'Completed',
    cancelled: 'Cancelled', rejected: 'Rejected',
};

const STATUS_ACTIONS = {
    pending: [
        { status: 'accepted', label: 'Accept Order', color: 'admin-btn-success', icon: '✓' },
        { status: 'rejected', label: 'Reject', color: 'admin-btn-danger', icon: '✕', confirm: true, confirmMessage: 'Are you sure you want to reject this order?' },
    ],
    placed: [
        { status: 'accepted', label: 'Accept Order', color: 'admin-btn-success', icon: '✓' },
        { status: 'rejected', label: 'Reject', color: 'admin-btn-danger', icon: '✕', confirm: true, confirmMessage: 'Are you sure you want to reject this order?' },
    ],
    accepted: [
        { status: 'preparing', label: 'Start Preparing', color: 'admin-btn-primary', icon: '👨‍🍳' },
        { status: 'cancelled', label: 'Cancel', color: 'admin-btn-danger', icon: '✕', confirm: true, confirmMessage: 'Are you sure you want to cancel this accepted order?' },
    ],
    confirmed: [
        { status: 'preparing', label: 'Start Preparing', color: 'admin-btn-primary', icon: '👨‍🍳' },
        { status: 'cancelled', label: 'Cancel', color: 'admin-btn-danger', icon: '✕', confirm: true, confirmMessage: 'Are you sure you want to cancel this accepted order?' },
    ],
    preparing: [
        { status: 'ready', label: 'Mark as Ready', color: 'admin-btn-success', icon: '✓' },
    ],
    ready: [
        { status: 'out_for_delivery', label: 'Out for Delivery', color: 'admin-btn-primary', icon: '🚗', deliveryOnly: true },
        { status: 'picked_up', label: 'Mark Picked Up', color: 'admin-btn-success', icon: '📦', pickupOnly: true },
    ],
    out_for_delivery: [
        { status: 'delivered', label: 'Mark Delivered', color: 'admin-btn-success', icon: '✓' },
    ],
    picked_up: [
        { status: 'completed', label: 'Complete Order', color: 'admin-btn-success', icon: '✓', confirm: true, confirmMessage: 'Mark this order as completed?' },
    ],
    delivered: [
        { status: 'completed', label: 'Complete Order', color: 'admin-btn-success', icon: '✓', confirm: true, confirmMessage: 'Mark this order as completed?' },
    ],
};

const PAYMENT_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
    { key: 'refunded', label: 'Refunded' },
];

const STATUS_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'rejected', label: 'Rejected' },
];

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 20, padding: 32, maxWidth: 420, width: '90%',
                    boxShadow: 'var(--admin-shadow-xl)', textAlign: 'center'
                }}
            >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--admin-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>
                    ⚠️
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--admin-text)' }}>Confirm Action</h3>
                <p style={{ fontSize: 14, color: 'var(--admin-text-secondary)', marginBottom: 24 }}>{message}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="admin-btn admin-btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
                    <button className="admin-btn admin-btn-danger" onClick={onConfirm} style={{ flex: 1 }}>Confirm</button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function Orders() {
    const { get, patch, loading } = useApi();
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [toast, setToast] = useState(null);
    const pollRef = useRef(null);
    const prevCountRef = useRef(0);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const loadOrders = useCallback(async () => {
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
            if (debouncedSearch) params.set('search', debouncedSearch);
            const data = await get(`/orders/admin?${params}`);
            const orderList = data.orders || data.data || [];
            setOrders(orderList);
            setTotalPages(data.pagination?.pages || 1);
            setTotal(data.pagination?.total || orderList.length);

            if (prevCountRef.current > 0 && orderList.length > prevCountRef.current) {
                const newest = orderList[0];
                if (newest && newest.status === 'pending' || newest?.status === 'placed') {
                    showToast(`🔔 New order #${newest.orderNumber || newest._id?.slice(-6)} received!`, 'info');
                }
            }
            prevCountRef.current = orderList.length;
        } catch {}
    }, [page, statusFilter, paymentFilter, debouncedSearch, get]);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    useEffect(() => {
        pollRef.current = setInterval(() => {
            loadOrders();
        }, 30000);
        return () => clearInterval(pollRef.current);
    }, [loadOrders]);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const openDetail = async (order) => {
        setSelectedOrder({ ...order });
        setDetailLoading(true);
        try {
            const data = await get(`/orders/admin/${order._id}`);
            setSelectedOrder(data.data || data.order || data);
        } catch {
            try {
                const data = await get(`/orders/${order._id}`);
                setSelectedOrder(data.data || data.order || data);
            } catch {}
        }
        setDetailLoading(false);
    };

    const updateOrderStatus = async (orderId, newStatus, note = '') => {
        setUpdating(true);
        try {
            await patch(`/orders/${orderId}/status`, { status: newStatus, note });
            showToast(`Order updated to ${STATUS_LABELS[newStatus] || newStatus}`, 'success');
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            loadOrders();
        } catch (err) {
            showToast(err?.message || err?.response?.data?.message || 'Failed to update order', 'error');
        }
        setUpdating(false);
    };

    const handleAction = (action, order) => {
        if (action.confirm) {
            setConfirmAction({
                message: action.confirmMessage,
                onConfirm: () => {
                    setConfirmAction(null);
                    updateOrderStatus(order._id, action.status);
                }
            });
        } else {
            updateOrderStatus(order._id, action.status);
        }
    };

    const getActionsForOrder = (order) => {
        const actions = STATUS_ACTIONS[order.status] || [];
        return actions.filter(a => {
            if (a.deliveryOnly && order.orderType !== 'delivery') return false;
            if (a.pickupOnly && order.orderType !== 'pickup') return false;
            return true;
        });
    };

    const getTimelineLabel = (status) => STATUS_LABELS[status] || status;

    return (
        <div className="admin-page">
            <PageHeader
                title="Orders"
                subtitle="Manage and fulfill customer orders"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--admin-text-muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-success)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    Auto-refreshing
                </div>
            </PageHeader>

            <div className="admin-toolbar">
                <div className="admin-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input placeholder="Search by order number, customer name, or email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div className="admin-filter-pills">
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-muted)', marginRight: 4, alignSelf: 'center' }}>Status:</span>
                    {STATUS_FILTERS.map(f => (
                        <button key={f.key} className={`admin-filter-pill ${statusFilter === f.key ? 'active' : ''}`}
                            onClick={() => { setStatusFilter(f.key); setPage(1); }}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="admin-filter-pills">
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-muted)', marginRight: 4, alignSelf: 'center' }}>Payment:</span>
                    {PAYMENT_FILTERS.map(f => (
                        <button key={f.key} className={`admin-filter-pill ${paymentFilter === f.key ? 'active' : ''}`}
                            onClick={() => { setPaymentFilter(f.key); setPage(1); }}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && !orders.length ? (
                <SkeletonTable rows={8} cols={9} />
            ) : orders.length === 0 ? (
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
                                        <th>Contact</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Order Status</th>
                                        <th>Payment</th>
                                        <th>Type</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => openDetail(order)}>
                                            <td className="fw-semibold">#{order.orderNumber || order._id?.slice(-8)}</td>
                                            <td>
                                                <div className="name">{order.user?.username || 'Guest'}</div>
                                                <div className="sub">{order.user?.email || ''}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: 13 }}>{order.user?.phone || order.address?.phone || '—'}</div>
                                            </td>
                                            <td>{order.items?.length || 0}</td>
                                            <td className="fw-semibold">{formatCurrency(order.total)}</td>
                                            <td>
                                                <span className={`admin-badge ${order.status}`}>
                                                    <span className="admin-badge-dot" />
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    background: getPaymentStatusInfo(order.paymentStatus || 'pending').bgColor,
                                                    color: getPaymentStatusInfo(order.paymentStatus || 'pending').color,
                                                    border: `1px solid ${getPaymentStatusInfo(order.paymentStatus || 'pending').color}30`
                                                }}>
                                                    {getPaymentStatusInfo(order.paymentStatus || 'pending').icon} {getPaymentStatusInfo(order.paymentStatus || 'pending').label}
                                                </span>
                                            </td>
                                            <td style={{ textTransform: 'capitalize' }}>{order.orderType || 'delivery'}</td>
                                            <td className="admin-date-text">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                    {getActionsForOrder(order).slice(0, 2).map(action => (
                                                        <button
                                                            key={action.status}
                                                            className={`admin-btn ${action.color} admin-btn-sm`}
                                                            disabled={updating}
                                                            onClick={() => handleAction(action, order)}
                                                            title={action.label}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
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
                                    <h3 className="admin-card-title">#{selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}</h3>
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
                                    <div className="admin-customers__detail-loading">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} style={{ height: 20, background: 'var(--admin-border-light)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Status & Actions */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div className="admin-reports-label" style={{ marginBottom: 8 }}>Status</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                <span className={`admin-badge ${selectedOrder.status}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                                                    <span className="admin-badge-dot" />
                                                    {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                                                </span>
                                                <span style={{
                                                    fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    background: getPaymentStatusInfo(selectedOrder.paymentStatus || 'pending').bgColor,
                                                    color: getPaymentStatusInfo(selectedOrder.paymentStatus || 'pending').color,
                                                    border: `1px solid ${getPaymentStatusInfo(selectedOrder.paymentStatus || 'pending').color}30`
                                                }}>
                                                    {getPaymentStatusInfo(selectedOrder.paymentStatus || 'pending').icon} {getPaymentStatusInfo(selectedOrder.paymentStatus || 'pending').label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {getActionsForOrder(selectedOrder).length > 0 && (
                                            <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {getActionsForOrder(selectedOrder).map(action => (
                                                    <button
                                                        key={action.status}
                                                        className={`admin-btn ${action.color}`}
                                                        disabled={updating}
                                                        onClick={() => handleAction(action, selectedOrder)}
                                                        style={{ flex: '1 1 auto', minWidth: 120 }}
                                                    >
                                                        {updating ? 'Updating...' : `${action.icon} ${action.label}`}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Customer Info */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div className="admin-reports-label" style={{ marginBottom: 8 }}>Customer</div>
                                            <div className="admin-customers__name">{selectedOrder.user?.username || 'Guest'}</div>
                                            <div className="admin-customers__email">{selectedOrder.user?.email || ''}</div>
                                            {selectedOrder.user?.phone && (
                                                <div className="admin-customers__phone">{selectedOrder.user.phone}</div>
                                            )}
                                        </div>

                                        {/* Delivery Info */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div className="admin-reports-label" style={{ marginBottom: 8 }}>Delivery Information</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <span style={{ color: 'var(--admin-text-muted)', minWidth: 100 }}>Method</span>
                                                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedOrder.orderType || 'delivery'}</span>
                                                </div>
                                                {selectedOrder.orderType === 'delivery' && selectedOrder.address && (
                                                    <>
                                                        {selectedOrder.address.street && (
                                                            <div style={{ display: 'flex', gap: 8 }}>
                                                                <span style={{ color: 'var(--admin-text-muted)', minWidth: 100 }}>Address</span>
                                                                <span>{selectedOrder.address.street}{selectedOrder.address.area ? `, ${selectedOrder.address.area}` : ''}{selectedOrder.address.city ? `, ${selectedOrder.address.city}` : ''}</span>
                                                            </div>
                                                        )}
                                                        {selectedOrder.address.phone && (
                                                            <div style={{ display: 'flex', gap: 8 }}>
                                                                <span style={{ color: 'var(--admin-text-muted)', minWidth: 100 }}>Phone</span>
                                                                <span>{selectedOrder.address.phone}</span>
                                                            </div>
                                                        )}
                                                        {selectedOrder.address.instructions && (
                                                            <div style={{ display: 'flex', gap: 8 }}>
                                                                <span style={{ color: 'var(--admin-text-muted)', minWidth: 100 }}>Notes</span>
                                                                <span style={{ fontStyle: 'italic' }}>{selectedOrder.address.instructions}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {selectedOrder.specialInstructions && (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <span style={{ color: 'var(--admin-text-muted)', minWidth: 100 }}>Instructions</span>
                                                        <span style={{ fontStyle: 'italic' }}>{selectedOrder.specialInstructions}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Estimated Delivery */}
                                        {selectedOrder.estimatedDelivery && (
                                            <div style={{ marginBottom: 24 }}>
                                                <div className="admin-reports-label" style={{ marginBottom: 8 }}>Estimated {selectedOrder.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</div>
                                                <div style={{ fontSize: 14, fontWeight: 600 }}>
                                                    {new Date(selectedOrder.estimatedDelivery).toLocaleString()}
                                                </div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div className="admin-reports-label" style={{ marginBottom: 8 }}>Items ({selectedOrder.items?.length || 0})</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {(selectedOrder.items || []).map((item, i) => {
                                                    const addOnsTotal = (item.addOns || []).reduce((sum, ao) => sum + (ao.price || 0), 0);
                                                    const itemTotal = item.quantity * (item.priceAtPurchase + addOnsTotal);
                                                    return (
                                                        <div key={i} className="admin-customers__detail-recent-item" style={{ padding: 12, background: 'var(--admin-border-light)', borderRadius: 10 }}>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: 14, fontWeight: 600 }}>
                                                                    {item.quantity}× {item.menuItem?.name || item.name || 'Item'}
                                                                </div>
                                                                {item.variant && (
                                                                    <div style={{ fontSize: 12, color: 'var(--admin-text-secondary)', marginTop: 2 }}>
                                                                        Size: {item.variant}
                                                                    </div>
                                                                )}
                                                                {item.addOns?.length > 0 && (
                                                                    <div style={{ fontSize: 12, color: 'var(--admin-text-secondary)', marginTop: 2 }}>
                                                                        Add-ons: {item.addOns.map(a => `${a.name} (${formatCurrency(a.price || 0)})`).join(', ')}
                                                                    </div>
                                                                )}
                                                                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>
                                                                    {formatCurrency(item.priceAtPurchase)} each
                                                                </div>
                                                            </div>
                                                            <div className="fw-semibold" style={{ fontSize: 14, color: 'var(--admin-brand)' }}>{formatCurrency(itemTotal)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Totals */}
                                        <div style={{ marginBottom: 24, padding: 16, background: 'var(--admin-border-light)', borderRadius: 12 }}>
                                            <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}>
                                                <span className="text-muted">Subtotal</span>
                                                <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                            </div>
                                            {selectedOrder.tax > 0 && (
                                                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}>
                                                    <span className="text-muted">Tax (15%)</span>
                                                    <span>{formatCurrency(selectedOrder.tax)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.deliveryFee > 0 && (
                                                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13 }}>
                                                    <span className="text-muted">Delivery Fee</span>
                                                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.discount > 0 && (
                                                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 13, color: 'var(--admin-success)' }}>
                                                    <span>Discount</span>
                                                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-between" style={{ fontSize: 17, fontWeight: 700, borderTop: '1px solid var(--admin-border)', paddingTop: 10, marginTop: 6 }}>
                                                <span>Total</span>
                                                <span style={{ color: 'var(--admin-brand)' }}>{formatCurrency(selectedOrder.total)}</span>
                                            </div>
                                        </div>

                                        {/* Payment */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div className="admin-reports-label" style={{ marginBottom: 8 }}>Payment</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <span style={{ color: 'var(--admin-text-muted)', minWidth: 100 }}>Method</span>
                                                    <span className="admin-badge confirmed" style={{ fontSize: 11 }}>
                                                        {getPaymentMethodLabel(selectedOrder.paymentMethod || 'cash')}
                                                    </span>
                                                </div>
                                                {selectedOrder.paymentReference && (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <span style={{ color: 'var(--admin-text-muted)', minWidth: 100 }}>Reference</span>
                                                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{selectedOrder.paymentReference}</span>
                                                    </div>
                                                )}
                                                {selectedOrder.paidAt && (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <span style={{ color: 'var(--admin-text-muted)', minWidth: 100 }}>Paid At</span>
                                                        <span>{new Date(selectedOrder.paidAt).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                                            <div style={{ marginBottom: 24 }}>
                                                <div className="admin-reports-label" style={{ marginBottom: 12 }}>Timeline</div>
                                                <div style={{ position: 'relative', paddingLeft: 28 }}>
                                                    <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--admin-border)', borderRadius: 1 }} />
                                                    {selectedOrder.timeline.slice().reverse().map((t, idx) => (
                                                        <div key={idx} style={{ position: 'relative', paddingBottom: idx < selectedOrder.timeline.length - 1 ? 20 : 0 }}>
                                                            <div style={{
                                                                position: 'absolute', left: -28, top: 4, width: 16, height: 16, borderRadius: '50%',
                                                                background: idx === 0 ? 'var(--admin-brand)' : 'var(--admin-border-strong)',
                                                                border: idx === 0 ? '3px solid var(--admin-brand-light)' : '3px solid var(--admin-surface-solid)',
                                                                zIndex: 1
                                                            }} />
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                                                                    {getTimelineLabel(t.status)}
                                                                    {t.previousStatus && (
                                                                        <span style={{ fontWeight: 400, color: 'var(--admin-text-muted)', fontSize: 12 }}>
                                                                            {' '}← {getTimelineLabel(t.previousStatus)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {t.adminName && (
                                                                    <div style={{ fontSize: 11, color: 'var(--admin-info)', fontWeight: 500, marginBottom: 2 }}>
                                                                        by {t.adminName}
                                                                    </div>
                                                                )}
                                                                {t.note && (
                                                                    <div style={{ fontSize: 12, color: 'var(--admin-text-secondary)', marginBottom: 2, fontStyle: 'italic' }}>
                                                                        "{t.note}"
                                                                    </div>
                                                                )}
                                                                <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>
                                                                    {new Date(t.timestamp).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmAction && (
                    <ConfirmModal
                        message={confirmAction.message}
                        onConfirm={confirmAction.onConfirm}
                        onCancel={() => setConfirmAction(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        style={{
                            position: 'fixed', bottom: 32, left: '50%', zIndex: 10000,
                            background: toast.type === 'error' ? 'var(--admin-danger)' : toast.type === 'success' ? 'var(--admin-success)' : 'var(--admin-info)',
                            color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                            boxShadow: 'var(--admin-shadow-lg)', whiteSpace: 'nowrap'
                        }}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
