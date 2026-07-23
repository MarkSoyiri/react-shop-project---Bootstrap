import { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import zestylogo from '../../images/zestylogo.png';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { section: 'Management' },
  { path: '/admin/products', label: 'Products', icon: '🍔' },
  { path: '/admin/categories', label: 'Categories', icon: '📁' },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/customers', label: 'Customers', icon: '👥' },
  { section: 'Marketing' },
  { path: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { path: '/admin/promotions', label: 'Promotions', icon: '📢' },
  { section: 'Reports' },
  { path: '/admin/reports', label: 'Analytics', icon: '📈' },
  { path: '/admin/inventory', label: 'Inventory', icon: '📋' },
  { section: 'System' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={zestylogo} alt="Zesty Cave" />
          <div>
            <h2>Zesty Cave</h2>
            <span>Admin Panel</span>
          </div>
        </div>
        <nav>
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <div key={i} className="nav-section">
                  {item.section}
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto' }}>
          <NavLink
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none' }}
          >
            <span className="nav-icon">🏠</span>
            Back to Store
          </NavLink>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              color: 'rgba(255,255,255,0.5)', fontSize: 14, background: 'none',
              border: 'none', cursor: 'pointer', width: '100%', marginTop: 8
            }}
          >
            <span className="nav-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="admin-sidebar-toggle-mobile"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: 'none', background: 'none', border: 'none',
                fontSize: 20, cursor: 'pointer', color: 'var(--color-text)'
              }}
            >
              ☰
            </button>
          </div>
          <div className="topbar-actions">
            <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Welcome, <strong>{user?.name || 'Admin'}</strong>
            </span>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>

      <button
        className="admin-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 999, display: 'none',
          }}
          className="admin-overlay"
        />
      )}
    </div>
  );
}

export default AdminLayout;
