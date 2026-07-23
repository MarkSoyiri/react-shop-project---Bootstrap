import { useState, useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import zestylogo from '../../images/zestylogo.png';

const navSections = [
    {
        label: 'Overview',
        items: [
            { to: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
        ],
    },
    {
        label: 'Management',
        items: [
            { to: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
            { to: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { to: '/admin/categories', label: 'Categories', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { to: '/admin/customers', label: 'Customers', icon: 'M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { to: '/admin/reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        ],
    },
    {
        label: 'Marketing',
        items: [
            { to: '/admin/coupons', label: 'Coupons', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
            { to: '/admin/promotions', label: 'Promotions', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        ],
    },
    {
        label: 'Analytics',
        items: [
            { to: '/admin/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { to: '/admin/reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { to: '/admin/inventory', label: 'Inventory', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        ],
    },
    {
        label: 'System',
        items: [
            { to: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
            { to: '/admin/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        ],
    },
];

const SvgIcon = ({ d }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/orders': 'Orders',
    '/admin/products': 'Products',
    '/admin/categories': 'Categories',
    '/admin/customers': 'Customers',
    '/admin/reviews': 'Reviews',
    '/admin/coupons': 'Coupons',
    '/admin/promotions': 'Promotions',
    '/admin/analytics': 'Analytics',
    '/admin/reports': 'Reports',
    '/admin/inventory': 'Inventory',
    '/admin/settings': 'Settings',
    '/admin/profile': 'Profile',
};

export default function AdminLayout({ children }) {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const currentTitle = pageTitles[location.pathname] || 'Admin';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGlobalSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-brand">
                    <img src={zestylogo} alt="Zesty Cave" />
                    <div>
                        <div className="admin-sidebar-brand-text">Zesty Cave</div>
                        <div className="admin-sidebar-brand-sub">Admin Portal</div>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    {navSections.map((section) => (
                        <div key={section.label}>
                            <div className="admin-sidebar-section">{section.label}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.exact}
                                    className={({ isActive }) =>
                                        `admin-sidebar-link ${isActive ? 'active' : ''}`
                                    }
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <SvgIcon d={item.icon} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <NavLink to="/" className="admin-sidebar-link">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                        </svg>
                        <span>Back to Store</span>
                    </NavLink>
                    <button className="admin-sidebar-link" onClick={handleLogout} style={{ color: '#fca5a5' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            <div
                className={`admin-mobile-overlay ${mobileOpen ? 'visible' : ''}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Main */}
            <div className="admin-main">
                {/* Topbar */}
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            className="admin-mobile-toggle"
                            style={{ position: 'static', width: 36, height: 36 }}
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <div>
                            <div className="admin-topbar-breadcrumb">
                                <NavLink to="/admin" style={{ textDecoration: 'none' }}>Admin</NavLink>
                                {location.pathname !== '/admin' && (
                                    <>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                        <span className="current">{currentTitle}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="admin-topbar-right">
                        {/* Global search */}
                        {searchOpen ? (
                            <form onSubmit={handleGlobalSearch} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search orders, products, customers..."
                                    style={{
                                        width: 280, padding: '7px 12px', borderRadius: 8,
                                        border: '1.5px solid var(--admin-border)', fontSize: 13, outline: 'none',
                                    }}
                                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                                />
                                <button type="button" className="admin-topbar-btn" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </form>
                        ) : (
                            <button className="admin-topbar-btn" onClick={() => setSearchOpen(true)} title="Search">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            </button>
                        )}

                        <NavLink to="/admin/orders" className="admin-topbar-btn" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 01-3.46 0" />
                            </svg>
                            <span className="badge-dot" />
                        </NavLink>

                        <NavLink to="/admin/profile" className="admin-topbar-btn" title="Profile">
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--admin-brand)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 700,
                            }}>
                                {user?.username?.[0]?.toUpperCase() || 'A'}
                            </div>
                        </NavLink>
                    </div>
                </header>

                {/* Content */}
                <main className="admin-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile FAB */}
            <button className="admin-mobile-toggle" onClick={() => setMobileOpen(true)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>
        </div>
    );
}
