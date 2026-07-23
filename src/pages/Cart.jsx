import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axiosFetch from "../api/axiosFetchAPI";
import "./Cart.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.15;
  const deliveryFee = subtotal >= 100 ? 0 : 15;
  const total = subtotal + tax + deliveryFee - couponDiscount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const { data } = await axiosFetch.post('/api/coupons/validate', { code: couponCode });
      if (data.type === 'percentage') {
        const disc = Math.round(subtotal * (data.value / 100) * 100) / 100;
        setCouponDiscount(data.maxDiscount > 0 ? Math.min(disc, data.maxDiscount) : disc);
      } else {
        setCouponDiscount(Math.min(data.value, subtotal));
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setOrderResult(null);
    try {
      const { data } = await axiosFetch.post('/api/orders', {
        address: {},
        orderType: 'delivery',
        paymentMethod: 'cash',
        couponCode: couponDiscount > 0 ? couponCode : ''
      });
      setOrderResult({ success: true, order: data });
      clearCart();
      setCouponCode('');
      setCouponDiscount(0);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed';
      setOrderResult({ success: false, message: msg });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="container-lg cart-container">
      <h1 className="cart-title">Your Cart</h1>

      {orderResult?.success && (
        <div className="alert alert-success">
          Order placed successfully! Order ID: {orderResult.order._id.slice(-8)}
          <button className="btn btn-sm btn-outline-success ms-3" onClick={() => navigate(`/order/${orderResult.order._id}`)}>
            Track Order
          </button>
        </div>
      )}
      {orderResult?.success === false && (
        <div className="alert alert-danger">{orderResult.message}</div>
      )}

      {cartItems.length === 0 && !orderResult?.success ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse our menu and add some delicious items!</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
        </div>
      ) : cartItems.length > 0 ? (
        <div className="row">
          <div className="col-lg-8">
            <div className="cart-items-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="cart-item-row">
                  {item.image && <img src={item.image} alt={item.name} className="cart-item-img" />}
                  <div className="cart-item-details">
                    <h6>{item.name}</h6>
                    {item.variant && <small className="text-muted">Size: {item.variant}</small>}
                    {item.addOns?.length > 0 && <small className="text-muted d-block">+ {item.addOns.map(a => a.name).join(', ')}</small>}
                    <small className="text-muted">GH₵ {Number(item.price).toFixed(2)} each</small>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-qty-controls">
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                      <span className="cart-qty">{item.quantity}</span>
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="cart-item-total">GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item._id)} title="Remove">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-bottom-actions">
              <button className="btn btn-outline-danger btn-sm" onClick={clearCart}>Clear Cart</button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/menu')}>Continue Shopping</button>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="cart-summary">
              <h4>Order Summary</h4>
              <div className="cart-summary-row"><span>Subtotal</span><span>GH₵ {subtotal.toFixed(2)}</span></div>
              <div className="cart-summary-row"><span>Tax (15%)</span><span>GH₵ {tax.toFixed(2)}</span></div>
              <div className="cart-summary-row"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : `GH₵ ${deliveryFee.toFixed(2)}`}</span></div>
              {couponDiscount > 0 && (
                <div className="cart-summary-row text-success"><span>Discount</span><span>-GH₵ {couponDiscount.toFixed(2)}</span></div>
              )}
              <hr />
              <div className="cart-summary-row cart-summary-total"><span>Total</span><span>GH₵ {total.toFixed(2)}</span></div>

              <div className="cart-coupon">
                <input type="text" placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} />
                <button onClick={applyCoupon} disabled={applyingCoupon}>{applyingCoupon ? '...' : 'Apply'}</button>
              </div>
              {couponError && <small className="text-danger">{couponError}</small>}
              {deliveryFee > 0 && <small className="text-muted d-block mt-2">Add GH₵ {(100 - subtotal).toFixed(2)} more for free delivery</small>}

              <button className="cart-checkout-btn" onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Cart;
