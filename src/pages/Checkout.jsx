import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { formatCurrency, PAYMENT_METHODS } from '../utils/helpers';
import { useToast } from '../components/ui/Toast';

function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { post, loading } = useApi();
  const { addToast, Toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: user?.name || '',
    deliveryAddress: '',
    paymentMethod: 'cash',
    orderType: 'delivery',
    specialInstructions: '',
    couponCode: '',
  });
  const [couponDiscount, setCouponDiscount] = useState(null);

  const subtotal = cartItems.reduce((sum, item) => {
    const basePrice = item.unitPrice || item.price;
    const variantPrice = item.variant?.price || 0;
    const addOnsPrice = item.addOns?.reduce((s, a) => s + (a.price || 0), 0) || 0;
    return sum + (basePrice + variantPrice + addOnsPrice) * item.quantity;
  }, 0);

  const deliveryFee = form.orderType === 'delivery' ? (subtotal >= 50 ? 0 : 5) : 0;
  const tax = subtotal * 0.15;
  const discount = couponDiscount?.discount || 0;
  const total = Math.max(0, subtotal + deliveryFee + tax - discount);

  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Payment' },
    { number: 3, label: 'Confirm' },
  ];

  const validateCoupon = async () => {
    if (!form.couponCode) return;
    try {
      const res = await post('/coupons/validate', { code: form.couponCode, orderTotal: subtotal });
      setCouponDiscount(res.data);
      addToast(`Coupon applied! ${res.data.title}`, 'success');
    } catch (err) {
      setCouponDiscount(null);
      addToast(err.message, 'error');
    }
  };

  const handleOrder = async () => {
    try {
      const res = await post('/orders', {
        name: form.name,
        deliveryAddress: form.deliveryAddress,
        paymentMethod: form.paymentMethod,
        orderType: form.orderType,
        specialInstructions: form.specialInstructions,
        couponCode: form.couponCode || undefined,
      });
      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/order/${res.data._id}`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page" style={{ textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Add items to your cart before checking out</p>
        <button className="btn-premium" onClick={() => navigate('/menu')}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Toast />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div className="checkout-steps">
          {steps.map((s, i) => (
            <div key={s.number} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`checkout-step ${step >= s.number ? (step > s.number ? 'completed' : 'active') : ''}`}>
                <div className="step-number">{step > s.number ? '✓' : s.number}</div>
                <span className="step-label">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`checkout-step-connector ${step > s.number ? 'active' : ''}`} />
              )}
            </div>
          ))}
        </div>

        <div className="checkout-body">
          <motion.div
            className="checkout-form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={step}
          >
            {step === 1 && (
              <>
                <h2><span className="section-icon">📋</span> Order Details</h2>
                <div className="admin-form">
                  <div className="admin-form-group">
                    <label>Full Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div className="admin-form-group">
                    <label>Order Type</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {['delivery', 'pickup'].map(type => (
                        <button
                          key={type}
                          type="button"
                          className={form.orderType === type ? 'btn-premium' : 'btn-premium-outline'}
                          style={{ flex: 1, textTransform: 'capitalize' }}
                          onClick={() => setForm({ ...form, orderType: type })}
                        >
                          {type === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.orderType === 'delivery' && (
                    <div className="admin-form-group">
                      <label>Delivery Address</label>
                      <textarea
                        value={form.deliveryAddress}
                        onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                        placeholder="Enter your delivery address"
                        rows={3}
                      />
                    </div>
                  )}
                  <div className="admin-form-group">
                    <label>Special Instructions (optional)</label>
                    <input
                      value={form.specialInstructions}
                      onChange={e => setForm({ ...form, specialInstructions: e.target.value })}
                      placeholder="e.g., no onions, extra sauce..."
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button className="btn-premium" onClick={() => setStep(2)}>
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2><span className="section-icon">💳</span> Payment Method</h2>
                <div className="payment-options">
                  {PAYMENT_METHODS.map(method => (
                    <label
                      key={method.value}
                      className={`payment-option ${form.paymentMethod === method.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={form.paymentMethod === method.value}
                        onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                      />
                      <div className="radio-dot" />
                      <div className="payment-info">
                        <h4>{method.label}</h4>
                      </div>
                      <span className="payment-icon">{method.icon}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button className="btn-premium-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-premium" onClick={() => setStep(3)}>Review Order →</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2><span className="section-icon">✅</span> Confirm Order</h2>
                <div className="admin-form">
                  <div className="admin-form-group">
                    <label>Name</label>
                    <div style={{ padding: '10px 14px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)', fontSize: 14 }}>
                      {form.name}
                    </div>
                  </div>
                  {form.orderType === 'delivery' && (
                    <div className="admin-form-group">
                      <label>Delivery Address</label>
                      <div style={{ padding: '10px 14px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)', fontSize: 14 }}>
                        {form.deliveryAddress || 'Not provided'}
                      </div>
                    </div>
                  )}
                  <div className="admin-form-group">
                    <label>Payment</label>
                    <div style={{ padding: '10px 14px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)', fontSize: 14, textTransform: 'capitalize' }}>
                      {PAYMENT_METHODS.find(m => m.value === form.paymentMethod)?.label}
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Coupon Code</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={form.couponCode}
                        onChange={e => setForm({ ...form, couponCode: e.target.value })}
                        placeholder="Enter coupon code"
                        style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 14 }}
                      />
                      <button className="btn-premium-outline" onClick={validateCoupon} style={{ padding: '10px 20px', fontSize: 14 }}>
                        Apply
                      </button>
                    </div>
                    {couponDiscount && (
                      <div style={{ color: 'var(--color-accent)', fontSize: 13, marginTop: 4 }}>
                        ✓ {couponDiscount.title} — Saving {formatCurrency(couponDiscount.discount)}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button className="btn-premium-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn-premium" onClick={handleOrder} disabled={loading} style={{ fontSize: 16, padding: '14px 32px' }}>
                    {loading ? 'Placing Order...' : `Place Order — ${formatCurrency(total)}`}
                  </button>
                </div>
              </>
            )}
          </motion.div>

          <div className="checkout-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item, i) => (
              <div key={i} className="checkout-summary-item">
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-qty">Qty: {item.quantity}</div>
                </div>
                <div className="item-price">
                  {formatCurrency((item.unitPrice || item.price) * item.quantity)}
                </div>
              </div>
            ))}
            <hr className="checkout-divider" />
            <div className="checkout-total-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="checkout-total-row">
                <span>Delivery</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            {deliveryFee === 0 && form.orderType === 'delivery' && (
              <div className="checkout-total-row" style={{ color: 'var(--color-accent)' }}>
                <span>Free Delivery</span>
                <span>✓</span>
              </div>
            )}
            <div className="checkout-total-row">
              <span>Tax (15%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="checkout-total-row" style={{ color: 'var(--color-accent)' }}>
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="checkout-total-row total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
