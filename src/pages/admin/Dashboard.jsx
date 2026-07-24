import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { AuthContext } from '../../context/AuthContext';
import { StatCard } from './components/StatCard';
import { SkeletonStatCards } from './components/Skeletons';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const statusColors = {
    pending: '#f59e0b', confirmed: '#3b82f6', preparing: '#f59e0b',
    ready: '#06b6d4', out_for_delivery: '#6366f1', delivered: '#059669', cancelled: '#dc2626',
};
const statusLabels = {
    pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing',
    ready: 'Ready', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

function RevenueChart({ data }) {
    if (!data || data.length === 0) return <div className="admin-chart-empty">No revenue data yet</div>;
    const max = Math.max(...data.map(d => d.value));
    return (
        <>
            <div className="admin-chart-bars">
                {data.map((d, i) => (
                    <motion.div
                        key={i}
                        className="admin-chart-bar"
                        initial={{ height: 0 }}
                        animate={{ height: max > 0 ? `${(d.value / max) * 100}%` : '4px' }}
                        transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        data-value={`GH₵ ${d.value.toFixed(0)}`}
                    />
                ))}
            </div>
            <div className="admin-chart-labels">
                {data.map((d, i) => (
                    <span key={i}>{typeof d.label === 'string' ? d.label.slice(0, 3) : d.label}</span>
                ))}
            </div>
        </>
    );
}

function StatusChart({ data }) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    if (total === 0) return <div className="admin-chart-empty">No orders yet</div>;
    return (
        <div className="admin-status-bars">
            {Object.entries(data).map(([key, count]) => (
                <div key={key} className="admin-status-row">
                    <span className="admin-status-label">{statusLabels[key] || key}</span>
                    <div className="admin-status-track">
                        <motion.div
                            className="admin-status-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / total) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ background: statusColors[key] || '#94a3b8' }}
                        />
                    </div>
                    <span className="admin-status-count">{count}</span>
                </div>
            ))}
        </div>
    );
}

function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const activityMeta = {
    order:          { bg: 'var(--admin-brand-light)', color: 'var(--admin-brand)',       icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg> },
    order_delivered:{ bg: 'var(--admin-success-bg)', color: 'var(--admin-success)',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> },
    order_cancelled:{ bg: 'var(--admin-danger-bg)',  color: 'var(--admin-danger)',       icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg> },
    user:           { bg: 'var(--admin-info-bg)',    color: 'var(--admin-info)',         icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    review:         { bg: 'var(--admin-warning-bg)', color: 'var(--admin-warning)',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
    coupon:         { bg: 'var(--admin-success-bg)', color: 'var(--admin-success)',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
    menu_update:    { bg: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed',                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> },
    promotion:      { bg: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed',                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg> },
};

export default function Dashboard() {
    const { get, loading } = useApi();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [activity, setActivity] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await get('/admin/dashboard');
                setDashboard(data.data || data);
            } catch (err) {
                setError(err.message || 'Failed to load dashboard');
            }
        };
        load();
    }, [get]);

    useEffect(() => {
        const loadActivity = async () => {
            try {
                const data = await get('/admin/activity?limit=15');
                setActivity(Array.isArray(data.data) ? data.data : []);
            } catch {
                setActivity([]);
            }
        };
        loadActivity();
    }, [get]);

    if (loading && !dashboard) return <SkeletonStatCards />;

    if (error) {
        return (
            <div className="admin-empty" style={{ minHeight: '50vh' }}>
                <div className="admin-empty-icon" style={{ background: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <h3>Failed to load dashboard</h3>
                <p>{error}</p>
                <button className="admin-btn admin-btn-primary" onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (!dashboard) return null;

    const { stats = {}, recentOrders = [], popularItems = [], orderStatus = {}, dailyRevenue = [] } = dashboard;
    const revenueData = dailyRevenue.map((d, i) => ({ label: d._id || `Day ${i + 1}`, value: d.revenue || 0 }));

    const quickActions = [
        { to: '/admin/products', label: 'Products', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>, color: 'rgba(232, 93, 4, 0.08)', iconColor: 'var(--admin-brand)' },
        { to: '/admin/orders', label: 'Orders', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>, color: 'rgba(37, 99, 235, 0.08)', iconColor: 'var(--admin-info)' },
        { to: '/admin/customers', label: 'Customers', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>, color: 'rgba(5, 150, 105, 0.08)', iconColor: 'var(--admin-success)' },
        { to: '/admin/reports', label: 'Reports', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>, color: 'rgba(124, 58, 237, 0.08)', iconColor: '#7c3aed' },
        { to: '/admin/coupons', label: 'Coupons', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>, color: 'rgba(217, 119, 6, 0.08)', iconColor: 'var(--admin-warning)' },
        { to: '/admin/settings', label: 'Settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>, color: 'rgba(100, 116, 139, 0.08)', iconColor: '#64748b' },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Welcome Banner */}
            <motion.div variants={itemVariants} className="admin-dash-welcome">
                <div className="admin-dash-welcome-text">
                    <h2>Welcome back, {user?.username || 'Admin'}</h2>
                    <p>Here's what's happening with your restaurant today.</p>
                </div>
                <div className="admin-dash-welcome-date">
                    <strong>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</strong>
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </motion.div>

            {/* Primary Stat Cards */}
            <div className="admin-stat-grid">
                <StatCard label="Revenue Today" value={`GH₵ ${(stats.todayRevenue || 0).toFixed(2)}`} change={stats.revenueChange || 0} changeLabel="vs yesterday" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} color="brand" delay={0} />
                <StatCard label="Orders Today" value={stats.todayOrders || 0} change={stats.ordersChange || 0} changeLabel="vs yesterday" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>} color="info" delay={0.05} />
                <StatCard label="Pending Orders" value={stats.pendingOrders || 0} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} color="warning" delay={0.1} />
                <StatCard label="Total Customers" value={stats.totalCustomers || 0} change={stats.customersChange || 0} changeLabel="this month" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>} color="success" delay={0.15} />
            </div>

            {/* Secondary Stats */}
            <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                <StatCard label="Avg Order Value" value={`GH₵ ${(stats.avgOrderValue || 0).toFixed(2)}`} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} color="brand" delay={0.2} />
                <StatCard label="Menu Items" value={stats.totalProducts || 0} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>} color="info" delay={0.25} />
                <StatCard label="Monthly Revenue" value={`GH₵ ${(stats.monthRevenue || 0).toLocaleString()}`} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>} color="success" delay={0.3} />
            </div>

            {/* Charts Row */}
            <div className="admin-grid-2 admin-dash-charts">
                <motion.div variants={itemVariants} className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Revenue This Week</h3>
                    </div>
                    <div className="admin-card-body">
                        <RevenueChart data={revenueData} />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Order Status Overview</h3>
                    </div>
                    <div className="admin-card-body">
                        <StatusChart data={orderStatus} />
                    </div>
                </motion.div>
            </div>

            {/* Recent Orders + Best Sellers */}
            <div className="admin-grid-2 admin-dash-main">
                <motion.div variants={itemVariants} className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Recent Orders</h3>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => navigate('/admin/orders')}>
                            View All
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                    </div>
                    <div className="admin-card-body no-pad">
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? recentOrders.slice(0, 6).map((order) => (
                                        <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
                                            <td><span style={{ fontWeight: 600 }}>#{order._id?.slice(-8)}</span></td>
                                            <td>{order.user?.email || order.user?.username || 'Guest'}</td>
                                            <td><span style={{ fontWeight: 700 }}>GH₵ {Number(order.total || 0).toFixed(2)}</span></td>
                                            <td><span className={`admin-badge ${order.status}`}><span className="admin-badge-dot" />{order.status?.replace(/_/g, ' ')}</span></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--admin-text-muted)' }}>No orders yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Best Sellers</h3>
                    </div>
                    <div className="admin-card-body">
                        <div className="admin-best-sellers">
                            {popularItems.length > 0 ? popularItems.slice(0, 5).map((item, i) => (
                                <div key={item._id || i} className="admin-best-seller">
                                    <div className="admin-best-seller-img">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} />
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="admin-best-seller-info">
                                        <div className="admin-best-seller-name">{item.name}</div>
                                        <div className="admin-best-seller-meta">{item.orderCount || item.orders || 0} orders</div>
                                    </div>
                                    <div className="admin-best-seller-price">GH₵ {Number(item.price || item.revenue || 0).toFixed(0)}</div>
                                </div>
                            )) : (
                                <div className="admin-empty" style={{ padding: 24 }}>
                                    <p style={{ color: 'var(--admin-text-muted)', fontSize: 14 }}>No data yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="admin-dash-quick">
                <h3 className="admin-dash-section-title">Quick Actions</h3>
                <div className="admin-dash-quick-grid">
                    {quickActions.map((action) => (
                        <button
                            key={action.to}
                            className="admin-dash-quick-btn"
                            onClick={() => navigate(action.to)}
                        >
                            <span className="admin-dash-quick-icon" style={{ background: action.color, color: action.iconColor }}>{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div variants={itemVariants}>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Recent Activity</h3>
                        <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', fontWeight: 500 }}>Last 7 days</span>
                    </div>
                    <div className="admin-card-body no-pad">
                        <div className="admin-dash-activity">
                            {activity.length > 0 ? activity.map((item, i) => {
                                const meta = activityMeta[item.type] || activityMeta.order;
                                return (
                                    <div key={i} className="admin-activity-item">
                                        <div className="admin-activity-icon" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</div>
                                        <div className="admin-activity-text">
                                            <p>{item.text}</p>
                                            <div className="admin-activity-time">
                                                {item.detail && <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 500 }}>{item.detail}</span>}
                                                {item.detail && ' · '}
                                                {timeAgo(item.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 14 }}>
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
