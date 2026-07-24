import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosFetch from "../api/axiosFetchAPI";
import { AuthContext } from "../context/AuthContext";
import "./Account.css";

function UserProfile() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [activeMenu, setActiveMenu] = useState("AS");
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: 'Accra', area: '', phone: '' });
    const [addingAddress, setAddingAddress] = useState(false);

    useEffect(() => {
        axiosFetch.get('/api/auth/profile')
            .then(res => {
                if (res.data?.user) {
                    setProfile(res.data.user);
                    setName(res.data.user.username || '');
                    setPhone(res.data.user.phone || '');
                    setAddresses(res.data.user.addresses || []);
                }
            })
            .catch(err => console.error(err.message));
    }, []);

    const loadOrders = async () => {
        if (orders.length > 0) return;
        setOrdersLoading(true);
        try {
            const { data } = await axiosFetch.get('/api/orders');
            setOrders(data.orders || data || []);
        } catch (err) {
            console.error(err.message);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
        if (menu === "PO") loadOrders();
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            await axiosFetch.put('/api/auth/profile', { username: name, phone });
            alert('Profile updated!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const addAddress = async () => {
        if (!newAddress.street || !newAddress.phone) {
            alert('Street and phone are required');
            return;
        }
        setAddingAddress(true);
        try {
            const { data } = await axiosFetch.post('/api/auth/addresses', newAddress);
            setAddresses(data.addresses || []);
            setNewAddress({ label: 'Home', street: '', city: 'Accra', area: '', phone: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add address');
        } finally {
            setAddingAddress(false);
        }
    };

    const deleteAddress = async (addrId) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            const { data } = await axiosFetch.delete(`/api/auth/addresses/${addrId}`);
            setAddresses(data.addresses || []);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed');
        }
    };

    const statusBadge = (status) => {
        const map = {
            delivered: { bg: '#dcfce7', text: '#16a34a' },
            cancelled: { bg: '#fee2e2', text: '#dc2626' },
            placed: { bg: '#dbeafe', text: '#2563eb' },
            confirmed: { bg: '#dbeafe', text: '#2563eb' },
            preparing: { bg: '#fef3c7', text: '#d97706' },
            ready: { bg: '#e0f2fe', text: '#0284c7' },
            out_for_delivery: { bg: '#e0f2fe', text: '#0284c7' },
        };
        return map[status] || { bg: '#f3f4f6', text: '#6b7280' };
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: 12,
        border: '1.5px solid var(--color-border)',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        background: '#fff',
        color: 'var(--color-text)',
    };

    const labelStyle = {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        marginBottom: 6,
        display: 'block',
    };

    const tabs = [
        { key: 'AS', label: 'Profile', icon: '👤' },
        { key: 'ADDR', label: 'Addresses', icon: '📍' },
        { key: 'PO', label: 'Order History', icon: '📦' },
    ];

    return (
        <div className="account-page-wrap" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', paddingTop: 'var(--navbar-height)', paddingBottom: 80 }}>
            <div style={{ paddingTop: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>My Account</h1>

            {/* Mobile Horizontal Tabs */}
            <div className="account-mobile-tabs" style={{ display: 'none', gap: 6, marginBottom: 24, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => handleMenuClick(tab.key)}
                        style={{
                            padding: '10px 18px', borderRadius: 100, border: 'none',
                            cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                            transition: 'all 0.2s', flexShrink: 0,
                            background: activeMenu === tab.key ? 'var(--color-brand)' : 'var(--color-bg-card)',
                            color: activeMenu === tab.key ? '#fff' : 'var(--color-text-secondary)',
                        }}
                    >
                        <span style={{ marginRight: 6 }}>{tab.icon}</span>{tab.label}
                    </button>
                ))}
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    style={{
                        padding: '10px 18px', borderRadius: 100, border: 'none',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                        transition: 'all 0.2s', flexShrink: 0,
                        background: '#fef2f2', color: '#dc2626',
                    }}
                >
                    🚪 Sign Out
                </button>
            </div>

            <div className="account-layout" style={{ display: 'flex', gap: 32 }}>
                {/* Sidebar */}
                <div className="account-sidebar-col" style={{
                    width: '25%', minWidth: 220, flexShrink: 0,
                    background: '#fff', borderRadius: 16, padding: 24,
                    border: '1px solid var(--color-border)',
                }}>
                    <div className="account-avatar-wrap" style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'var(--color-brand)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28, fontWeight: 700, margin: '0 auto 12px',
                        }}>
                            {name ? name[0].toUpperCase() : 'U'}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{name || 'User'}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{profile?.email}</div>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleMenuClick(tab.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 14px', borderRadius: 12, border: 'none',
                                    cursor: 'pointer', fontSize: 14, fontWeight: 500,
                                    transition: 'all 0.2s',
                                    background: activeMenu === tab.key ? 'rgba(232,93,4,0.08)' : 'transparent',
                                    color: activeMenu === tab.key ? 'var(--color-brand)' : 'var(--color-text)',
                                }}
                            >
                                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 16, paddingTop: 12 }}>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                padding: '10px 14px', borderRadius: 12, border: 'none',
                                cursor: 'pointer', fontSize: 14, fontWeight: 500,
                                transition: 'all 0.2s', background: 'transparent', color: '#dc2626',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {activeMenu === "AS" && (
                        <div style={{
                            background: '#fff', borderRadius: 16, padding: 32,
                            border: '1px solid var(--color-border)',
                        }}>
                            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Profile Settings</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480 }}>
                                <div>
                                    <label style={labelStyle}>Username</label>
                                    <input
                                        type="text" value={name}
                                        onChange={e => setName(e.target.value)}
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,4,0.12)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input
                                        type="email" value={profile?.email || ''} disabled
                                        style={{ ...inputStyle, background: 'var(--color-bg-alt)', color: 'var(--color-text-secondary)', cursor: 'not-allowed' }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input
                                        type="tel" value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="Phone number"
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,4,0.12)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <button
                                    onClick={saveProfile} disabled={saving}
                                    style={{
                                        padding: '12px 28px', borderRadius: 12, border: 'none',
                                        background: 'var(--color-brand)', color: '#fff',
                                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                        transition: 'background 0.2s', alignSelf: 'flex-start',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = 'var(--color-brand-dark)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'var(--color-brand)'}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeMenu === "ADDR" && (
                        <div style={{
                            background: '#fff', borderRadius: 16, padding: 32,
                            border: '1px solid var(--color-border)',
                        }}>
                            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Saved Addresses</h4>
                            {addresses.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                                    {addresses.map(addr => (
                                        <div key={addr._id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '16px 20px', borderRadius: 12,
                                            border: '1px solid var(--color-border)', background: '#fff',
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                                                    {addr.label || 'Address'}
                                                    {addr.isDefault && (
                                                        <span style={{
                                                            marginLeft: 8, fontSize: 11, padding: '2px 8px',
                                                            borderRadius: 6, background: '#dcfce7', color: '#16a34a', fontWeight: 600,
                                                        }}>Default</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                                    {addr.street}{addr.area ? `, ${addr.area}` : ''}, {addr.city}
                                                </div>
                                                {addr.phone && (
                                                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                                        📞 {addr.phone}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteAddress(addr._id)}
                                                style={{
                                                    padding: '6px 14px', borderRadius: 8, border: '1.5px solid #fca5a5',
                                                    background: 'transparent', color: '#dc2626',
                                                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                                }}
                                                onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; }}
                                                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>No saved addresses yet.</p>
                            )}

                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24 }}>
                                <h5 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add New Address</h5>
                                <div className="addr-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 560 }}>
                                    <div>
                                        <label style={labelStyle}>Label</label>
                                        <select
                                            value={newAddress.label}
                                            onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                                            style={{ ...inputStyle, appearance: 'auto' }}
                                        >
                                            <option>Home</option><option>Work</option><option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Phone</label>
                                        <input
                                            type="tel" value={newAddress.phone}
                                            onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                            placeholder="Phone number" style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,4,0.12)'; }}
                                            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Street Address *</label>
                                        <input
                                            type="text" value={newAddress.street}
                                            onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                            placeholder="Street address" style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,4,0.12)'; }}
                                            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Area/Landmark</label>
                                        <input
                                            type="text" value={newAddress.area}
                                            onChange={e => setNewAddress({ ...newAddress, area: e.target.value })}
                                            placeholder="Area" style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,4,0.12)'; }}
                                            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>City</label>
                                        <input
                                            type="text" value={newAddress.city}
                                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                            style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,4,0.12)'; }}
                                            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <button
                                            onClick={addAddress} disabled={addingAddress}
                                            style={{
                                                padding: '12px 28px', borderRadius: 12, border: 'none',
                                                background: 'var(--color-brand)', color: '#fff',
                                                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'var(--color-brand-dark)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'var(--color-brand)'}
                                        >
                                            {addingAddress ? 'Adding...' : 'Add Address'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeMenu === "PO" && (
                        <div style={{
                            background: '#fff', borderRadius: 16, padding: 32,
                            border: '1px solid var(--color-border)',
                        }}>
                            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Order History</h4>
                            {ordersLoading ? (
                                <p style={{ color: 'var(--color-text-secondary)' }}>Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>No orders yet.</p>
                                    <button
                                        onClick={() => navigate('/menu')}
                                        style={{
                                            padding: '12px 28px', borderRadius: 12, border: 'none',
                                            background: 'var(--color-brand)', color: '#fff',
                                            fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = 'var(--color-brand-dark)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'var(--color-brand)'}
                                    >
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {orders.map(order => {
                                        const badge = statusBadge(order.status);
                                        return (
                                            <div
                                                key={order._id}
                                                onClick={() => navigate(`/order/${order._id}`)}
                                                style={{
                                                    padding: '18px 22px', borderRadius: 12,
                                                    border: '1px solid var(--color-border)', cursor: 'pointer',
                                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                                }}
                                                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(232,93,4,0.08)'; }}
                                                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                                    <div>
                                                        <strong style={{ fontSize: 15 }}>Order #{order._id.slice(-8)}</strong>
                                                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                        background: badge.bg, color: badge.text, textTransform: 'capitalize',
                                                    }}>
                                                        {order.status?.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                                    {order.items?.slice(0, 3).map((item, i) => (
                                                        <span key={i}>{item.quantity}× {item.menuItem?.name || item.name || 'Item'}{i < Math.min(order.items.length, 3) - 1 ? ', ' : ''}</span>
                                                    ))}
                                                    {order.items?.length > 3 && <span> +{order.items.length - 3} more</span>}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <strong style={{ fontSize: 15 }}>GH₵ {Number(order.total).toFixed(2)}</strong>
                                                    <span style={{ fontSize: 13, color: 'var(--color-brand)', fontWeight: 600 }}>View Details →</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            </div>

            <style>{`
                .account-mobile-tabs { display: none !important; }
                @media (max-width: 768px) {
                    .account-mobile-tabs { display: flex !important; }
                    .account-sidebar-col { display: none !important; }
                    .account-layout { flex-direction: column !important; gap: 16px !important; }
                    .account-page-wrap { padding-left: 16px !important; padding-right: 16px !important; }
                    .account-page-wrap h1 { font-size: 24px !important; }
                    .addr-form-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

export default UserProfile;
