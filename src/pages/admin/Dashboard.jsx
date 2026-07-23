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

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dashboard Overview</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Track your store performance at a glance
        </p>
      </div>

      <div className="stat-cards">
        <div className="stat-card orange">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatCurrency(stats.monthRevenue)}</div>
          <div className="stat-label">Revenue This Month</div>
          <div className="stat-change up">↑ {stats.monthOrders} orders</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.monthOrders}</div>
          <div className="stat-label">Orders This Month</div>
          <div className="stat-change up">↑ {stats.todayOrders} today</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="stat-label">Total Customers</div>
          {stats.newCustomersThisMonth > 0 && (
            <div className="stat-change up">+{stats.newCustomersThisMonth} new</div>
          )}
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🍔</div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Menu Items</div>
          <div className="stat-change up">{stats.totalCategories} categories</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3>Recent Orders</h3>
            <button
              className="quick-action-btn"
              onClick={() => navigate('/admin/orders')}
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
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <div className="admin-card" style={{ marginBottom: 24 }}>
            <div className="admin-card-header">
              <h3>Popular Items</h3>
            </div>
            <div className="admin-card-body">
              {popularItems.map((item, i) => (
                <div key={item._id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < popularItems.length - 1 ? '1px solid var(--color-border-light)' : 'none'
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--color-bg-alt)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: 'var(--color-brand)',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {item.orderCount} orders
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {formatCurrency(item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Order Status</h3>
            </div>
            <div className="admin-card-body">
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const info = getStatusInfo(status);
                return (
                  <div key={status} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0'
                  }}>
                    <span className={`badge-status badge-${status}`}>
                      {info.icon} {info.label}
                    </span>
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                );
              })}
              {Object.keys(statusBreakdown).length === 0 && (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', fontSize: 14 }}>
                  No orders this month
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="admin-card-body">
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => navigate('/admin/products')}>
                🍔 Manage Products
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/admin/orders')}>
                📦 View Orders
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/admin/customers')}>
                👥 Customers
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/admin/coupons')}>
                🎟️ Create Coupon
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/admin/reports')}>
                📈 View Reports
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/admin/settings')}>
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
