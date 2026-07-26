import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
        { status: 'accepted', label: 'Accept', title: 'Accept Order', color: 'accept', icon: '✓' },
        { status: 'rejected', label: 'Reject', title: 'Reject', color: 'reject', icon: '✕', confirm: true, confirmMessage: 'Are you sure you want to reject this order?' },
    ],
    placed: [
        { status: 'accepted', label: 'Accept', title: 'Accept Order', color: 'accept', icon: '✓' },
        { status: 'rejected', label: 'Reject', title: 'Reject', color: 'reject', icon: '✕', confirm: true, confirmMessage: 'Are you sure you want to reject this order?' },
    ],
    accepted: [
        { status: 'preparing', label: 'Prepare', title: 'Start Preparing', color: 'advance', icon: '🍳' },
        { status: 'cancelled', label: 'Cancel', title: 'Cancel Order', color: 'cancel', icon: '✕', confirm: true, confirmMessage: 'Are you sure you want to cancel this accepted order?' },
    ],
    confirmed: [
        { status: 'preparing', label: 'Prepare', title: 'Start Preparing', color: 'advance', icon: '🍳' },
        { status: 'cancelled', label: 'Cancel', title: 'Cancel Order', color: 'cancel', icon: '✕', confirm: true, confirmMessage: 'Are you sure you want to cancel this accepted order?' },
    ],
    preparing: [
        { status: 'ready', label: 'Ready', title: 'Mark as Ready', color: 'accept', icon: '✓' },
    ],
    ready: [
        { status: 'out_for_delivery', label: 'Deliver', title: 'Out for Delivery', color: 'advance', icon: '🚗', deliveryOnly: true },
        { status: 'picked_up', label: 'Pickup', title: 'Mark Picked Up', color: 'accept', icon: '📦', pickupOnly: true },
    ],
    out_for_delivery: [
        { status: 'delivered', label: 'Delivered', title: 'Mark Delivered', color: 'accept', icon: '✓' },
    ],
    picked_up: [
        { status: 'completed', label: 'Complete', title: 'Complete Order', color: 'accept', icon: '✓', confirm: true, confirmMessage: 'Mark this order as completed?' },
    ],
    delivered: [
        { status: 'completed', label: 'Complete', title: 'Complete Order', color: 'accept', icon: '✓', confirm: true, confirmMessage: 'Mark this order as completed?' },
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
            onClick={onCancel}
        >
            <motion.div
                className="admin-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ textAlign: 'center' }}>
                    <div className="admin-confirm-icon warning">⚠️</div>
                    <h3 className="admin-modal-title">Confirm Action</h3>
                    <p className="admin-modal-subtitle">{message}</p>
                </div>
                <div className="admin-modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="admin-btn admin-btn-ghost" onClick={onCancel}>Cancel</button>
                    <button className="admin-btn admin-btn-danger" onClick={onConfirm}>Confirm</button>
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
                if (newest && (newest.status === 'pending' || newest.status === 'placed')) {
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

    const stats = useMemo(() => {
        const active = orders.filter(o => !['cancelled', 'rejected', 'completed'].includes(o.status)).length;
        const pending = orders.filter(o => ['pending', 'placed'].includes(o.status)).length;
        const completed = orders.filter(o => o.status === 'completed').length;
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        return { total: total, active, pending, completed, revenue };
    }, [orders, total]);

    const statCards = [
        { label: 'Total Orders', value: stats.total, icon: '📋', color: 'var(--admin-brand)', bg: 'rgba(232,93,4,0.08)' },
        { label: 'Pending', value: stats.pending, icon: '⏳', color: '#d97706', bg: 'rgba(245,158,11,0.08)' },
        { label: 'Active', value: stats.active, icon: '🔄', color: 'var(--admin-info, #3b82f6)', bg: 'rgba(59,130,246,0.08)' },
        { label: 'Completed', value: stats.completed, icon: '✅', color: 'var(--admin-success)', bg: 'rgba(34,197,94,0.08)' },
    ];

    return (
        <motion.div
            className="admin-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <PageHeader
                title="Orders"
                subtitle="Manage and fulfill customer orders"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--admin-text-muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-success)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    Auto-refreshing
                </div>
            </PageHeader>

            {/* ── Stats ── */}
            <div className="admin-orders__stats">
                {statCards.map((s, i) => (
                    <motion.div
                        key={s.label}
                        className="admin-orders__stat-card"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06 }}
                    >
                        <div className="admin-orders__stat-icon" style={{ background: s.bg, color: s.color }}>
                            {s.icon}
                        </div>
                        <div className="admin-orders__stat-info">
                            <span className="admin-orders__stat-value">{s.value}</span>
                            <span className="admin-orders__stat-label">{s.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="admin-orders__toolbar">
                <div className="admin-orders__search">
                    <svg className="admin-orders__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="admin-orders__search-input"
                        placeholder="Search orders..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="admin-orders__search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="admin-orders__filters">
                <div className="admin-orders__filter-group">
                    <span className="admin-orders__filter-label">Status:</span>
                    {STATUS_FILTERS.map(f => (
                        <button key={f.key} className={`admin-filter-pill ${statusFilter === f.key ? 'active' : ''}`}
                            onClick={() => { setStatusFilter(f.key); setPage(1); }}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="admin-orders__filter-divider" />
                <div className="admin-orders__filter-group">
                    <span className="admin-orders__filter-label">Payment:</span>
                    {PAYMENT_FILTERS.map(f => (
                        <button key={f.key} className={`admin-filter-pill ${paymentFilter === f.key ? 'active' : ''}`}
                            onClick={() => { setPaymentFilter(f.key); setPage(1); }}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            {loading && !orders.length ? (
                <SkeletonTable rows={8} cols={9} />
            ) : orders.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title="No orders found"
                    description="Orders will appear here when customers place them."
                />
            ) : (
                <motion.div className="admin-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="admin-card-body no-pad">
                        <div className="admin-orders__table-wrap">
                            <table className="admin-orders__table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Contact</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, idx) => {
                                        const payInfo = getPaymentStatusInfo(order.paymentStatus || 'pending');
                                        return (
                                            <motion.tr
                                                key={order._id}
                                                onClick={() => openDetail(order)}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, delay: idx * 0.03 }}
                                            >
                                                <td>
                                                    <div className="admin-orders__cell-order">
                                                        <span className="admin-orders__cell-order-num">#{order.orderNumber || order._id?.slice(-6)}</span>
                                                        <span className="admin-orders__cell-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="admin-orders__cell-customer">
                                                        <span className="admin-orders__cell-customer-name">{order.user?.username || 'Guest'}</span>
                                                        <span className="admin-orders__cell-customer-email">{order.user?.email || ''}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="admin-orders__cell-phone">{order.user?.phone || order.address?.phone || '—'}</span>
                                                </td>
                                                <td>
                                                    <span className="admin-orders__cell-items">{order.items?.length || 0}</span>
                                                </td>
                                                <td>
                                                    <span className="admin-orders__cell-total">{formatCurrency(order.total)}</span>
                                                </td>
                                                <td>
                                                    <span className={`admin-badge ${order.status}`}>
                                                        <span className="admin-badge-dot" />
                                                        {STATUS_LABELS[order.status] || order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`admin-badge`} style={{
                                                        background: payInfo.bgColor,
                                                        color: payInfo.color,
                                                    }}>
                                                        {payInfo.icon} {payInfo.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="admin-orders__cell-type">{order.orderType || 'delivery'}</span>
                                                </td>
                                                <td className="admin-orders__cell-actions">
                                                    <div className="admin-orders__actions" onClick={e => e.stopPropagation()}>
                                                        {getActionsForOrder(order).slice(0, 2).map(action => (
                                                            <button
                                                                key={action.status}
                                                                className={`admin-orders__action-btn admin-orders__action-btn--${action.color}`}
                                                                disabled={updating}
                                                                onClick={() => handleAction(action, order)}
                                                                title={action.title}
                                                            >
                                                                {action.icon}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
                </motion.div>
            )}

            {/* ── Side Panel ── */}
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
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{ height: 20, background: 'var(--admin-border-light)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {/* Status & Actions */}
                                        <div className="admin-orders__section">
                                            <div className="admin-orders__section-label">Status</div>
                                            <div className="admin-orders__status-row">
                                                <span className={`admin-badge ${selectedOrder.status}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                                                    <span className="admin-badge-dot" />
                                                    {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                                                </span>
                                                <span className={`admin-badge`} style={{
                                                    fontSize: 12, padding: '4px 10px',
                                                    background: getPaymentStatusInfo(selectedOrder.paymentStatus || 'pending').bgColor,
                                                    color: getPaymentStatusInfo(selectedOrder.paymentStatus || 'pending').color,
                                                }}>
                                                    {getPaymentStatusInfo(selectedOrder.paymentStatus || 'pending').icon} {getPaymentStatusInfo(selectedOrder.paymentStatus || 'pending').label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {getActionsForOrder(selectedOrder).length > 0 && (
                                            <div className="admin-orders__section">
                                                <div className="admin-orders__detail-actions">
                                                    {getActionsForOrder(selectedOrder).map(action => (
                                                        <button
                                                            key={action.status}
                                                            className={`admin-btn ${action.color === 'accept' ? 'admin-btn-success' : action.color === 'advance' ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                                                            disabled={updating}
                                                            onClick={() => handleAction(action, selectedOrder)}
                                                        >
                                                            {updating ? 'Updating...' : `${action.icon} ${action.title}`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Customer Info */}
                                        <div className="admin-orders__section">
                                            <div className="admin-orders__section-label">Customer</div>
                                            <div className="admin-orders__customer-name">{selectedOrder.user?.username || 'Guest'}</div>
                                            <div className="admin-orders__customer-email">{selectedOrder.user?.email || ''}</div>
                                            {selectedOrder.user?.phone && (
                                                <div className="admin-orders__customer-phone">{selectedOrder.user.phone}</div>
                                            )}
                                        </div>

                                        {/* Delivery Info */}
                                        <div className="admin-orders__section">
                                            <div className="admin-orders__section-label">{selectedOrder.orderType === 'pickup' ? 'Pickup' : 'Delivery'} Information</div>
                                            <div className="admin-orders__info-grid">
                                                <div className="admin-orders__info-row">
                                                    <span className="admin-orders__info-label">Method</span>
                                                    <span className="admin-orders__info-value">{selectedOrder.orderType || 'delivery'}</span>
                                                </div>
                                                {selectedOrder.orderType === 'delivery' && selectedOrder.address && (
                                                    <>
                                                        {selectedOrder.address.street && (
                                                            <div className="admin-orders__info-row">
                                                                <span className="admin-orders__info-label">Address</span>
                                                                <span className="admin-orders__info-value">{selectedOrder.address.street}{selectedOrder.address.area ? `, ${selectedOrder.address.area}` : ''}{selectedOrder.address.city ? `, ${selectedOrder.address.city}` : ''}</span>
                                                            </div>
                                                        )}
                                                        {selectedOrder.address.phone && (
                                                            <div className="admin-orders__info-row">
                                                                <span className="admin-orders__info-label">Phone</span>
                                                                <span className="admin-orders__info-value">{selectedOrder.address.phone}</span>
                                                            </div>
                                                        )}
                                                        {selectedOrder.address.instructions && (
                                                            <div className="admin-orders__info-row">
                                                                <span className="admin-orders__info-label">Notes</span>
                                                                <span className="admin-orders__info-value admin-orders__info-value--italic">{selectedOrder.address.instructions}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {selectedOrder.specialInstructions && (
                                                    <div className="admin-orders__info-row">
                                                        <span className="admin-orders__info-label">Instructions</span>
                                                        <span className="admin-orders__info-value admin-orders__info-value--italic">{selectedOrder.specialInstructions}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Estimated Delivery */}
                                        {selectedOrder.estimatedDelivery && (
                                            <div className="admin-orders__section">
                                                <div className="admin-orders__section-label">Estimated {selectedOrder.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text)' }}>
                                                    {new Date(selectedOrder.estimatedDelivery).toLocaleString()}
                                                </div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div className="admin-orders__section">
                                            <div className="admin-orders__section-label">Items ({selectedOrder.items?.length || 0})</div>
                                            <div className="admin-orders__items-list">
                                                {(selectedOrder.items || []).map((item, i) => {
                                                    const addOnsTotal = (item.addOns || []).reduce((sum, ao) => sum + (ao.price || 0), 0);
                                                    const itemTotal = item.quantity * (item.priceAtPurchase + addOnsTotal);
                                                    return (
                                                        <div key={i} className="admin-orders__item-card">
                                                            <div className="admin-orders__item-info">
                                                                <div className="admin-orders__item-name">{item.quantity}× {item.menuItem?.name || item.name || 'Item'}</div>
                                                                {item.variant && (
                                                                    <div className="admin-orders__item-detail">Size: {item.variant}</div>
                                                                )}
                                                                {item.addOns?.length > 0 && (
                                                                    <div className="admin-orders__item-detail">Add-ons: {item.addOns.map(a => `${a.name} (${formatCurrency(a.price || 0)})`).join(', ')}</div>
                                                                )}
                                                                <div className="admin-orders__item-price-each">{formatCurrency(item.priceAtPurchase)} each</div>
                                                            </div>
                                                            <div className="admin-orders__item-total">{formatCurrency(itemTotal)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Totals */}
                                        <div className="admin-orders__section">
                                            <div className="admin-orders__totals">
                                                <div className="admin-orders__totals-row">
                                                    <span className="admin-orders__totals-label">Subtotal</span>
                                                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                                </div>
                                                {selectedOrder.tax > 0 && (
                                                    <div className="admin-orders__totals-row">
                                                        <span className="admin-orders__totals-label">Tax (15%)</span>
                                                        <span>{formatCurrency(selectedOrder.tax)}</span>
                                                    </div>
                                                )}
                                                {selectedOrder.deliveryFee > 0 && (
                                                    <div className="admin-orders__totals-row">
                                                        <span className="admin-orders__totals-label">Delivery Fee</span>
                                                        <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                                                    </div>
                                                )}
                                                {selectedOrder.discount > 0 && (
                                                    <div className="admin-orders__totals-row admin-orders__totals-row--discount">
                                                        <span>Discount</span>
                                                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                                                    </div>
                                                )}
                                                <div className="admin-orders__totals-row admin-orders__totals-row--grand">
                                                    <span>Total</span>
                                                    <span className="admin-orders__totals-value">{formatCurrency(selectedOrder.total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment */}
                                        <div className="admin-orders__section">
                                            <div className="admin-orders__section-label">Payment</div>
                                            <div className="admin-orders__info-grid">
                                                <div className="admin-orders__info-row">
                                                    <span className="admin-orders__info-label">Method</span>
                                                    <span className="admin-badge confirmed" style={{ fontSize: 11 }}>
                                                        {getPaymentMethodLabel(selectedOrder.paymentMethod || 'cash')}
                                                    </span>
                                                </div>
                                                {selectedOrder.paymentReference && (
                                                    <div className="admin-orders__info-row">
                                                        <span className="admin-orders__info-label">Reference</span>
                                                        <span className="admin-orders__info-value admin-orders__info-value--mono">{selectedOrder.paymentReference}</span>
                                                    </div>
                                                )}
                                                {selectedOrder.paidAt && (
                                                    <div className="admin-orders__info-row">
                                                        <span className="admin-orders__info-label">Paid At</span>
                                                        <span className="admin-orders__info-value">{new Date(selectedOrder.paidAt).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                                            <div className="admin-orders__section">
                                                <div className="admin-orders__section-label">Timeline</div>
                                                <div className="admin-orders__timeline">
                                                    <div className="admin-orders__timeline-line" />
                                                    {selectedOrder.timeline.slice().reverse().map((t, idx) => (
                                                        <div key={idx} className="admin-orders__timeline-item">
                                                            <div className={`admin-orders__timeline-dot ${idx === 0 ? 'admin-orders__timeline-dot--active' : 'admin-orders__timeline-dot--inactive'}`} />
                                                            <div>
                                                                <div className="admin-orders__timeline-status">
                                                                    {getTimelineLabel(t.status)}
                                                                    {t.previousStatus && (
                                                                        <span className="admin-orders__timeline-previous">
                                                                            {' '}← {getTimelineLabel(t.previousStatus)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {t.adminName && (
                                                                    <div className="admin-orders__timeline-admin">by {t.adminName}</div>
                                                                )}
                                                                {t.note && (
                                                                    <div className="admin-orders__timeline-note">"{t.note}"</div>
                                                                )}
                                                                <div className="admin-orders__timeline-time">
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

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmAction && (
                    <ConfirmModal
                        message={confirmAction.message}
                        onConfirm={confirmAction.onConfirm}
                        onCancel={() => setConfirmAction(null)}
                    />
                )}
            </AnimatePresence>

            {/* Toast */}
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
        </motion.div>
    );
}
