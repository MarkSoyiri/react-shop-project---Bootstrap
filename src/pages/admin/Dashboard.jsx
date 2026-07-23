import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { formatCurrency, getStatusInfo } from '../../utils/helpers';
import { SkeletonStat } from '../../components/ui/Skeleton';

function AdminDashboard() {
  const { get, loading } = useApi();
  const [dashboard, setDashboard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await get('/admin/dashboard');
      setDashboard(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  if (loading && !dashboard) {
    return (
      <div>
        <div className="stat-cards">
          {[1, 2, 3, 4].map(i => <SkeletonStat key={i} />)}
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { stats, recentOrders, popularItems, statusBreakdown } = dashboard;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #e85d04, #f48c06)', borderRadius: 16, padding: '32px 36px', marginBottom: 28, color: '#fff' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Welcome back, Admin</h2>
        <p style={{ opacity: 0.85, fontSize: 14 }}>{today}</p>
      </div>

      <div className="stat-cards" style={{ marginBottom: 28 }}>
        {[
          { label: 'Revenue This Month', value: formatCurrency(stats.monthRevenue), sub: `↑ ${stats.monthOrders} orders`, color: '#e85d04', bg: 'rgba(232,93,4,0.1)', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#e85d04" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          { label: 'Orders This Month', value: stats.monthOrders, sub: `↑ ${stats.todayOrders} today`, color: '#2b9348', bg: 'rgba(43,147,72,0.1)', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#2b9348" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
          { label: 'Total Customers', value: stats.totalCustomers, sub: stats.newCustomersThisMonth > 0 ? `+${stats.newCustomersThisMonth} new` : '', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
          { label: 'Menu Items', value: stats.totalProducts, sub: `${stats.totalCategories} categories`, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9.5" r="1"/><circle cx="15" cy="9.5" r="1"/></svg> },
        ].map((card, i) => (
          <div key={i} className={`stat-card ${['orange','green','blue','purple'][i]}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 26 }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
              {card.sub && <div className="stat-change up">{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 28 }}>
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Orders</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              style={{
                background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8,
                padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#6b7280',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              View All →
            </button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.user?.email || 'Unknown'}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`badge-status badge-${order.status}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Popular Items</h3>
            </div>
            <div className="admin-card-body" style={{ padding: '12px 24px' }}>
              {popularItems.map((item, i) => (
                <div key={item._id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < popularItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#e85d04', flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{item.orderCount} orders</div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, flexShrink: 0 }}>{formatCurrency(item.price)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Order Status</h3>
            </div>
            <div className="admin-card-body" style={{ padding: '12px 24px' }}>
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const info = getStatusInfo(status);
                return (
                  <div key={status} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0',
                  }}>
                    <span className={`badge-status badge-${status}`}>
                      {info.icon} {info.label}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{count}</span>
                  </div>
                );
              })}
              {Object.keys(statusBreakdown).length === 0 && (
                <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: 14 }}>No orders this month</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Manage Products', path: '/admin/products', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>, color: '#e85d04', bg: 'rgba(232,93,4,0.08)' },
              { label: 'View Orders', path: '/admin/orders', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>, color: '#2b9348', bg: 'rgba(43,147,72,0.08)' },
              { label: 'Customers', path: '/admin/customers', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
              { label: 'Reports', path: '/admin/reports', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
            ].map(action => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '20px 16px', background: '#fff', border: '1.5px solid #e5e7eb',
                  borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                  textAlign: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = action.bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color }}>
                  {action.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
