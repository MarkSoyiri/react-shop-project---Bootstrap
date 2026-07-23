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
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

function MiniBarChart({ data, color = 'var(--admin-brand)' }) {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.value));
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
            {data.map((d, i) => (
                <div key={i} style={{
                    flex: 1, borderRadius: 3, transition: 'height 0.4s ease-out',
                    height: `${max > 0 ? (d.value / max) * 100 : 0}%`,
                    background: color, opacity: 0.7,
                }} title={`${d.label}: ${d.value}`} />
            ))}
        </div>
    );
}

function StatusChart({ data }) {
    const colors = {
        pending: '#f59e0b', confirmed: '#3b82f6', preparing: '#f59e0b',
        ready: '#06b6d4', out_for_delivery: '#6366f1', delivered: '#22c55e', cancelled: '#ef4444',
    };
    const labels = {
        pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing',
        ready: 'Ready', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
    };
    const total = Object.values(data).reduce((a, b) => a + b, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(data).map(([key, count]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 110, fontSize: 13, color: 'var(--admin-text-secondary)', textAlign: 'right' }}>
                        {labels[key] || key}
                    </span>
                    <div style={{ flex: 1, height: 24, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ height: '100%', background: colors[key] || '#9ca3af', borderRadius: 6 }}
                        />
                    </div>
                    <span style={{ width: 32, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{count}</span>
                </div>
            ))}
        </div>
    );
}

export default function Dashboard() {
    const { get, loading } = useApi();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
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

    if (loading && !dashboard) return <SkeletonStatCards />;

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <p style={{ color: 'var(--admin-danger)', fontSize: 15, fontWeight: 600 }}>Failed to load dashboard</p>
                <p style={{ color: 'var(--admin-text-secondary)', marginTop: 8 }}>{error}</p>
                <button className="admin-btn admin-btn-primary" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (!dashboard) return null;

    const { stats = {}, recentOrders = [], popularItems = [], orderStatus = {}, dailyRevenue = [], monthlyRevenue = [] } = dashboard;

    const revenueData = dailyRevenue.map((d, i) => ({ label: d._id || `Day ${i + 1}`, value: d.revenue || 0 }));

    const activityItems = [
        { icon: '🛒', bg: '#fff7ed', text: 'New order received', time: '2 min ago' },
        { icon: '👤', bg: '#eff6ff', text: 'New customer registered', time: '15 min ago' },
        { icon: '⭐', bg: '#fffbeb', text: 'New review submitted', time: '1 hour ago' },
        { icon: '🏷️', bg: '#f0fdf4', text: 'Coupon "WELCOME10" activated', time: '3 hours ago' },
        { icon: '📦', bg: '#eef2ff', text: 'Product "BBQ Bacon Burger" updated', time: '5 hours ago' },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Welcome Banner */}
            <motion.div variants={itemVariants} style={{
                background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
                borderRadius: 16, padding: '28px 32px', marginBottom: 24,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
            }}>
                <div>
                    <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
                        Welcome back, {user?.username || 'Admin'} 👋
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6 }}>
                        Here's what's happening with your restaurant today.
                    </p>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                    <div>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="admin-stat-grid">
                <StatCard label="Revenue Today" value={`GH₵ ${(stats.todayRevenue || 0).toFixed(2)}`} change={stats.revenueChange || 0} changeLabel="vs yesterday" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} color="brand" delay={0} />
                <StatCard label="Orders Today" value={stats.todayOrders || 0} change={stats.ordersChange || 0} changeLabel="vs yesterday" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>} color="info" delay={0.05} />
                <StatCard label="Pending Orders" value={stats.pendingOrders || 0} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} color="warning" delay={0.1} />
                <StatCard label="Total Customers" value={stats.totalCustomers || 0} change={stats.customersChange || 0} changeLabel="this month" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>} color="success" delay={0.15} />
            </div>

            {/* Second row stats */}
            <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                <StatCard label="Avg Order Value" value={`GH₵ ${(stats.avgOrderValue || 0).toFixed(2)}`} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} color="brand" delay={0.2} />
                <StatCard label="Menu Items" value={stats.totalProducts || 0} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>} color="info" delay={0.25} />
                <StatCard label="Monthly Revenue" value={`GH₵ ${(stats.monthRevenue || 0).toLocaleString()}`} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>} color="success" delay={0.3} />
            </div>

            {/* Charts Row */}
            <div className="admin-grid-2" style={{ marginBottom: 24 }}>
                {/* Weekly Revenue Chart */}
                <motion.div variants={itemVariants} className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Revenue This Week</h3>
                    </div>
                    <div className="admin-card-body">
                        {revenueData.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <MiniBarChart data={revenueData} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--admin-text-muted)' }}>
                                    {revenueData.map((d, i) => (
                                        <span key={i}>{typeof d.label === 'string' ? d.label.slice(0, 3) : d.label}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: 32, fontSize: 14 }}>No revenue data yet</p>
                        )}
                    </div>
                </motion.div>

                {/* Order Status */}
                <motion.div variants={itemVariants} className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Order Status Overview</h3>
                    </div>
                    <div className="admin-card-body">
                        {Object.keys(orderStatus).length > 0 ? (
                            <StatusChart data={orderStatus} />
                        ) : (
                            <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: 32, fontSize: 14 }}>No orders yet</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Recent Orders + Sidebar */}
            <div className="admin-grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                {/* Recent Orders */}
                <motion.div variants={itemVariants} className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Recent Orders</h3>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => navigate('/admin/orders')}>View All</button>
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
                                            <td style={{ fontWeight: 600 }}>#{order._id?.slice(-8)}</td>
                                            <td>{order.user?.email || order.user?.username || 'Guest'}</td>
                                            <td style={{ fontWeight: 600 }}>GH₵ {Number(order.total || 0).toFixed(2)}</td>
                                            <td><span className={`admin-badge ${order.status}`}><span className="admin-badge-dot" />{order.status?.replace(/_/g, ' ')}</span></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--admin-text-muted)' }}>No orders yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* Popular Items */}
                <motion.div variants={itemVariants} className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Best Sellers</h3>
                    </div>
                    <div className="admin-card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {popularItems.length > 0 ? popularItems.slice(0, 5).map((item, i) => (
                                <div key={item._id || i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 8, overflow: 'hidden',
                                        background: 'var(--admin-surface-hover)', flexShrink: 0,
                                    }}>
                                        {item.image ? (
                                            <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🍔</div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{item.orderCount || item.orders || 0} orders</div>
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-brand)' }}>GH₵ {Number(item.price || item.revenue || 0).toFixed(0)}</div>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: 24, fontSize: 14 }}>No data yet</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {[
                        { to: '/admin/products', label: 'Manage Products', icon: '📦', bg: '#fff7ed' },
                        { to: '/admin/orders', label: 'View Orders', icon: '🛒', bg: '#eff6ff' },
                        { to: '/admin/customers', label: 'Customers', icon: '👥', bg: '#f0fdf4' },
                        { to: '/admin/reports', label: 'Reports', icon: '📊', bg: '#faf5ff' },
                        { to: '/admin/coupons', label: 'Coupons', icon: '🏷️', bg: '#fffbeb' },
                        { to: '/admin/settings', label: 'Settings', icon: '⚙️', bg: '#f8fafc' },
                    ].map((action) => (
                        <button
                            key={action.to}
                            className="admin-btn admin-btn-secondary"
                            onClick={() => navigate(action.to)}
                            style={{ justifyContent: 'flex-start', padding: '14px 16px', gap: 12 }}
                        >
                            <span style={{
                                width: 36, height: 36, borderRadius: 8, background: action.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                            }}>{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Recent Activity</h3>
                    </div>
                    <div className="admin-card-body no-pad" style={{ padding: '0 24px' }}>
                        <div className="admin-activity">
                            {activityItems.map((item, i) => (
                                <div key={i} className="admin-activity-item">
                                    <div className="admin-activity-icon" style={{ background: item.bg }}>{item.icon}</div>
                                    <div className="admin-activity-text">
                                        <p>{item.text}</p>
                                        <div className="admin-activity-time">{item.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
