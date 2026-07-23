import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosFetch from "../api/axiosFetchAPI";
import "./Account.css";

function UserProfile() {
    const navigate = useNavigate();
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
        const colors = { delivered: 'success', cancelled: 'danger', placed: 'info', confirmed: 'info', preparing: 'warning', ready: 'primary', out_for_delivery: 'primary' };
        return colors[status] || 'secondary';
    };

    return (
        <div className="container-lg account-page">
            <div className="row">
                <div className="col-md-3 mb-4">
                    <div className="account-sidebar">
                        <div className="account-avatar">{name ? name[0].toUpperCase() : 'U'}</div>
                        <h3>Hello, {name || "User"}!</h3>
                        <p className="text-muted small">{profile?.email}</p>
                        <div className="account-nav">
                            {[
                                { key: 'AS', label: 'Profile', icon: '👤' },
                                { key: 'PO', label: 'Past Orders', icon: '📦' },
                                { key: 'ADDR', label: 'Addresses', icon: '📍' },
                            ].map(item => (
                                <button key={item.key}
                                    className={`account-nav-btn ${activeMenu === item.key ? 'active' : ''}`}
                                    onClick={() => handleMenuClick(item.key)}>
                                    <span>{item.icon}</span> {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-md-9">
                    {activeMenu === "AS" && (
                        <div className="account-card">
                            <h4>Profile Settings</h4>
                            <div className="account-form">
                                <div className="account-field">
                                    <label>Username</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="account-field">
                                    <label>Email</label>
                                    <input type="email" value={profile?.email || ''} disabled />
                                </div>
                                <div className="account-field">
                                    <label>Phone</label>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
                                </div>
                                <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeMenu === "PO" && (
                        <div className="account-card">
                            <h4>Order History</h4>
                            {ordersLoading ? (
                                <p className="text-muted">Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <div className="account-empty">
                                    <p>No orders yet.</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {orders.map(order => (
                                        <div key={order._id} className="order-card" onClick={() => navigate(`/order/${order._id}`)}>
                                            <div className="order-card-header">
                                                <div>
                                                    <strong>Order #{order._id.slice(-8)}</strong>
                                                    <small className="text-muted d-block">
                                                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </small>
                                                </div>
                                                <span className={`badge bg-${statusBadge(order.status)}`}>{order.status}</span>
                                            </div>
                                            <div className="order-card-items">
                                                {order.items?.slice(0, 3).map((item, i) => (
                                                    <span key={i}>{item.quantity}× {item.menuItem?.name || item.name || 'Item'}{i < Math.min(order.items.length, 3) - 1 ? ', ' : ''}</span>
                                                ))}
                                                {order.items?.length > 3 && <span className="text-muted"> +{order.items.length - 3} more</span>}
                                            </div>
                                            <div className="order-card-footer">
                                                <strong>GH₵ {Number(order.total).toFixed(2)}</strong>
                                                <span className="view-order-link">View Details →</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeMenu === "ADDR" && (
                        <div className="account-card">
                            <h4>Saved Addresses</h4>
                            {addresses.length > 0 ? (
                                <div className="addresses-list">
                                    {addresses.map(addr => (
                                        <div key={addr._id} className="address-card">
                                            <div className="address-info">
                                                <strong>{addr.label || 'Address'}</strong>
                                                <p>{addr.street}{addr.area ? `, ${addr.area}` : ''}, {addr.city}</p>
                                                {addr.phone && <small className="text-muted">📞 {addr.phone}</small>}
                                                {addr.isDefault && <span className="badge bg-success ms-2">Default</span>}
                                            </div>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAddress(addr._id)}>Delete</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted mb-3">No saved addresses.</p>
                            )}

                            <div className="address-form mt-4">
                                <h5>Add New Address</h5>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Label</label>
                                        <select className="form-select" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})}>
                                            <option>Home</option><option>Work</option><option>Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Phone</label>
                                        <input type="tel" className="form-control" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} placeholder="Phone number" />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Street Address *</label>
                                        <input type="text" className="form-control" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} placeholder="Street address" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Area/Landmark</label>
                                        <input type="text" className="form-control" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} placeholder="Area" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">City</label>
                                        <input type="text" className="form-control" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                    </div>
                                    <div className="col-12">
                                        <button className="btn btn-primary" onClick={addAddress} disabled={addingAddress}>
                                            {addingAddress ? 'Adding...' : 'Add Address'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
