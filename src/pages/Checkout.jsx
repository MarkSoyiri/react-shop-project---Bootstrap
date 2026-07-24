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
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
      setCouponDiscount(res);
      addToast(`Coupon applied! ${res.code}`, 'success');
    } catch (err) {
      setCouponDiscount(null);
      addToast(err.message, 'error');
    }
  };

  const handleOrder = async () => {
    try {
      const res = await post('/orders', {
        items: cartItems,
        name: form.name,
        deliveryAddress: form.deliveryAddress,
        paymentMethod: form.paymentMethod,
        orderType: form.orderType,
        specialInstructions: form.specialInstructions,
        couponCode: form.couponCode || undefined,
      });
      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate(`/order/${res._id || res.data?._id}`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid var(--color-border)',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    color: 'var(--color-text)',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: 6
  };

  const formGroupStyle = {
    marginBottom: 18
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>🛒</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Add items to your cart before checking out</p>
        <button
          onClick={() => navigate('/menu')}
          style={{
            background: 'var(--color-brand)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 60px' }}>
      <Toast />

      {/* Progress Bar */}
      <div className="checkout-steps-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, gap: 0 }}>
        {steps.map((s, i) => {
          const isCompleted = step > s.number;
          const isActive = step === s.number;
          return (
            <div key={s.number} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  background: isCompleted ? 'var(--color-accent)' : isActive ? 'var(--color-brand)' : 'var(--color-bg-alt)',
                  color: isCompleted || isActive ? '#fff' : 'var(--color-text-secondary)',
                  border: isActive ? '2px solid var(--color-brand)' : isCompleted ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                  transition: 'all 0.2s'
                }}>
                  {isCompleted ? '✓' : s.number}
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-brand)' : isCompleted ? 'var(--color-accent)' : 'var(--color-text-secondary)'
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 80,
                  height: 2,
                  background: step > s.number ? 'var(--color-accent)' : 'var(--color-border)',
                  margin: '0 8px',
                  marginBottom: 20,
                  borderRadius: 1,
                  transition: 'background 0.2s'
                }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="checkout-layout" style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left: Form */}
        <div className="checkout-form-col" style={{ flex: '1 1 580px', minWidth: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={step}
          >
            {step === 1 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid var(--color-border)' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>📋</span> Order Details
                </h2>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    style={inputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Order Type</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['delivery', 'pickup'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, orderType: type })}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: form.orderType === type ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)',
                          background: form.orderType === type ? 'var(--color-brand)' : '#fff',
                          color: form.orderType === type ? '#fff' : 'var(--color-text)',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          transition: 'all 0.15s'
                        }}
                      >
                        {type === 'delivery' ? '🚗' : '🏪'} {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {form.orderType === 'delivery' && (
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Delivery Address</label>
                    <textarea
                      value={form.deliveryAddress}
                      onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                      placeholder="Enter your delivery address"
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                )}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Special Instructions (optional)</label>
                  <input
                    value={form.specialInstructions}
                    onChange={e => setForm({ ...form, specialInstructions: e.target.value })}
                    placeholder="e.g., no onions, extra sauce..."
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      background: 'var(--color-brand)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Continue to Payment →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid var(--color-border)' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>💳</span> Payment Method
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PAYMENT_METHODS.map(method => (
                    <label
                      key={method.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 20px',
                        borderRadius: 12,
                        border: form.paymentMethod === method.value ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)',
                        background: form.paymentMethod === method.value ? '#fff7ed' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={form.paymentMethod === method.value}
                        onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        border: form.paymentMethod === method.value ? '6px solid var(--color-brand)' : '2px solid var(--color-border)',
                        flexShrink: 0,
                        transition: 'all 0.15s'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{method.label}</div>
                      </div>
                      <span style={{ fontSize: 24 }}>{method.icon}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      background: '#fff',
                      color: 'var(--color-text)',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 10,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    style={{
                      background: 'var(--color-brand)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid var(--color-border)' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>✅</span> Confirm Order
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={labelStyle}>Name</div>
                    <div style={{ padding: '12px 16px', background: 'var(--color-bg-alt)', borderRadius: 10, fontSize: 14 }}>
                      {form.name}
                    </div>
                  </div>
                  {form.orderType === 'delivery' && (
                    <div>
                      <div style={labelStyle}>Delivery Address</div>
                      <div style={{ padding: '12px 16px', background: 'var(--color-bg-alt)', borderRadius: 10, fontSize: 14 }}>
                        {form.deliveryAddress || 'Not provided'}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={labelStyle}>Payment</div>
                    <div style={{ padding: '12px 16px', background: 'var(--color-bg-alt)', borderRadius: 10, fontSize: 14, textTransform: 'capitalize' }}>
                      {PAYMENT_METHODS.find(m => m.value === form.paymentMethod)?.label}
                    </div>
                  </div>
                  {form.specialInstructions && (
                    <div>
                      <div style={labelStyle}>Special Instructions</div>
                      <div style={{ padding: '12px 16px', background: 'var(--color-bg-alt)', borderRadius: 10, fontSize: 14 }}>
                        {form.specialInstructions}
                      </div>
                    </div>
                  )}
                  <div>
                    <label style={labelStyle}>Coupon Code</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={form.couponCode}
                        onChange={e => setForm({ ...form, couponCode: e.target.value })}
                        placeholder="Enter coupon code"
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button
                        onClick={validateCoupon}
                        style={{
                          background: '#fff',
                          color: 'var(--color-text)',
                          border: '1.5px solid var(--color-border)',
                          borderRadius: 10,
                          padding: '10px 20px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Apply
                      </button>
                    </div>
                    {couponDiscount && (
                      <div style={{ color: 'var(--color-accent)', fontSize: 13, marginTop: 6, fontWeight: 500 }}>
                        ✓ {couponDiscount.code} — {couponDiscount.type === 'percentage' ? `${couponDiscount.value}% off` : `${formatCurrency(couponDiscount.value)} off`}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--color-brand)', cursor: 'pointer' }}
                  />
                  <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    I agree to the terms and conditions
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      background: '#fff',
                      color: 'var(--color-text)',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 10,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleOrder}
                    disabled={loading || !agreedToTerms}
                    style={{
                      width: '100%',
                      maxWidth: 260,
                      background: 'var(--color-brand)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '14px 24px',
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: loading || !agreedToTerms ? 'not-allowed' : 'pointer',
                      opacity: loading || !agreedToTerms ? 0.5 : 1
                    }}
                  >
                    {loading ? 'Placing Order...' : `Place Order — ${formatCurrency(total)}`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Order Summary */}
        <div className="checkout-summary-col" style={{ flex: '0 0 340px', position: 'sticky', top: 100 }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>Order Summary</h3>

            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
              {cartItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < cartItems.length - 1 ? '1px solid var(--color-bg-alt)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Qty: {item.quantity}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, flexShrink: 0, marginLeft: 12 }}>
                    {formatCurrency((item.unitPrice || item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <span>Delivery</span>
                <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Free</span>}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                <span>Tax (15%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-accent)', marginBottom: 8 }}>
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700 }}>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="checkout-mobile-cta" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid var(--color-border)',
        padding: '12px 16px', display: 'none', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, zIndex: 40,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Total</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-brand)' }}>
            {formatCurrency(total)}
          </div>
        </div>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            style={{
              flex: 1, maxWidth: 200,
              background: 'var(--color-brand)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px 20px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {step === 1 ? 'Continue to Payment →' : 'Review Order →'}
          </button>
        ) : (
          <button
            onClick={handleOrder}
            disabled={loading || !agreedToTerms}
            style={{
              flex: 1, maxWidth: 200,
              background: 'var(--color-brand)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px 20px',
              fontSize: 15, fontWeight: 700, cursor: loading || !agreedToTerms ? 'not-allowed' : 'pointer',
              opacity: loading || !agreedToTerms ? 0.5 : 1,
            }}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        )}
      </div>

      <style>{`
        .checkout-mobile-cta { display: none !important; }
        @media (max-width: 768px) {
          .checkout-mobile-cta { display: flex !important; }
          .checkout-page { padding-bottom: 90px !important; }
          .checkout-steps-bar { margin-bottom: 24px !important; }
          .checkout-form-col button[style*="Continue to Payment"], 
          .checkout-form-col button[style*="Review Order"],
          .checkout-form-col button[style*="Place Order"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default Checkout;
