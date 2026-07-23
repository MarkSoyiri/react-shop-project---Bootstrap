import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosFetch from "../api/axiosFetchAPI";

function UserProfile(){
    const navigate = useNavigate();
    const [ActiveMenu,SetActiveMenu] = useState("AS");
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        axiosFetch.get('/profile')
            .then((res) => {
                if (res.data && res.data.user) {
                    setName(res.data.user.username || res.data.user.name || '');
                    setEmail(res.data.user.email || '');
                }
            })
            .catch((err) => console.error(err.message));
    }, []);

    const loadOrders = async () => {
        if (orders.length > 0) return;
        setOrdersLoading(true);
        try {
            const { data } = await axiosFetch.get('/order');
            setOrders(data);
        } catch (err) {
            console.error(err.message);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleMenuClick = (menu) => {
        SetActiveMenu(menu);
        if (menu === "PO") loadOrders();
    };

    return(
        <div className="container-lg" style={{ marginTop: '120px', minHeight: '60vh' }}>
            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card p-4">
                        <h3>Hello, {name || "User"}!</h3>
                        <div className="d-flex flex-column gap-2 mt-3">
                            <button className={`btn ${ActiveMenu === "AS" ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => handleMenuClick("AS")}>Account Settings</button>
                            <button className={`btn ${ActiveMenu === "PO" ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => handleMenuClick("PO")}>Past Orders</button>
                            <button className={`btn ${ActiveMenu === "PM" ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => handleMenuClick("PM")}>Payment Methods</button>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    {ActiveMenu === "AS" && (
                        <div className="card p-4">
                            <h4>Account Settings</h4>
                            <hr />
                            <p><strong>Name:</strong> {name}</p>
                            <p><strong>Email:</strong> {email}</p>
                            <p className="text-muted small">Edit functionality coming soon</p>
                        </div>
                    )}
                    {ActiveMenu === "PO" && (
                        <div className="card p-4">
                            <h4>Past Orders</h4>
                            <hr />
                            {ordersLoading ? (
                                <p className="text-muted">Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <div>
                                    <p>No orders yet.</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/menu')}>
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order._id} className="border-bottom pb-3 mb-3">
                                        <div className="d-flex justify-content-between">
                                            <strong>Order #{order._id.slice(-6)}</strong>
                                            <span className={`badge bg-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <small className="text-muted">
                                            {new Date(order.createdAt).toLocaleDateString()} — GH₵ {Number(order.total).toFixed(2)}
                                        </small>
                                        <div className="mt-1">
                                            {order.items?.map((item, i) => (
                                                <small key={i} className="d-block">
                                                    {item.quantity}x {item.menuItem?.name || '(item)'}
                                                </small>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {ActiveMenu === "PM" && (
                        <div className="card p-4">
                            <h4>Payment Methods</h4>
                            <hr />
                            <p className="text-muted">No payment methods saved yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
