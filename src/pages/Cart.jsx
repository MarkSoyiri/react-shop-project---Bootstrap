import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { HomeHeadingNL } from "../components/HomeHeading";
import { useNavigate } from "react-router-dom";
import axiosFetch from "../api/axiosFetchAPI";
import "./Cart.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setCheckingOut(true);
    setOrderResult(null);
    try {
      const { data } = await axiosFetch.post('/order', { address: '' });
      setOrderResult({ success: true, order: data });
      clearCart();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed';
      setOrderResult({ success: false, message: msg });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="container-lg cart-container">
      <HomeHeadingNL heading="Your Cart" />
      {orderResult?.success && (
        <div className="alert alert-success">Order placed! Your order ID: {orderResult.order._id}</div>
      )}
      {orderResult?.success === false && (
        <div className="alert alert-danger">{orderResult.message}</div>
      )}
      {cartItems.length === 0 && !orderResult?.success ? (
        <div className="text-center py-5">
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Your cart is empty.</p>
          <button className="btn btn-outline-primary mt-3" onClick={() => navigate('/menu')}>
            Browse Menu
          </button>
        </div>
      ) : cartItems.length > 0 ? (
        <div>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item-row">
                <div className="cart-item-details">
                  <h6>{item.name}</h6>
                  <small className="text-muted">GH₵ {Number(item.price).toFixed(2)} each</small>
                </div>
                <div className="cart-item-controls">
                  <button className="btn btn-sm btn-outline-secondary"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                  <span className="cart-qty">{item.quantity}</span>
                  <button className="btn btn-sm btn-outline-secondary"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  <span className="cart-item-total">GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                  <button className="btn btn-sm btn-outline-danger"
                    onClick={() => removeFromCart(item._id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <hr />
          <div className="cart-footer">
            <h5>Total: GH₵ {getTotalPrice().toFixed(2)}</h5>
            <div className="cart-actions">
              <button className="btn btn-primary" onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
              <button className="btn btn-outline-danger" onClick={clearCart}>Clear Cart</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Cart;
