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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Your Cart</h1>
        {cartItems.length > 0 && (
          <span style={{
            background: 'var(--color-brand)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            padding: '2px 10px',
            borderRadius: 999,
            lineHeight: '22px'
          }}>
            {cartItems.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        )}
      </div>

      {orderResult?.success && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <span style={{ color: '#065f46', fontWeight: 500 }}>
            Order placed successfully! ID: {orderResult.order._id.slice(-8)}
          </span>
          <button
            onClick={() => navigate(`/order/${orderResult.order._id}`)}
            style={{
              background: '#065f46',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Track Order
          </button>
        </div>
      )}
      {orderResult?.success === false && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
          color: '#991b1b',
          fontWeight: 500
        }}>
          {orderResult.message}
        </div>
      )}

      {cartItems.length === 0 && !orderResult?.success ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>🛒</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
            Browse our menu and add some delicious items!
          </p>
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
      ) : cartItems.length > 0 ? (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Left: Items */}
          <div style={{ flex: '1 1 580px', minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: idx < cartItems.length - 1 ? 8 : 0,
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {/* Left: image + details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 200px', minWidth: 0 }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      {item.variant && (
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          Size: {item.variant}
                        </div>
                      )}
                      {item.addOns?.length > 0 && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          + {item.addOns.map(a => a.name).join(', ')}
                        </div>
                      )}
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        GH₵ {Number(item.price).toFixed(2)} each
                      </div>
                    </div>
                  </div>

                  {/* Middle: Quantity */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      style={{
                        width: 34,
                        height: 34,
                        border: 'none',
                        background: 'transparent',
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text)',
                        fontWeight: 600
                      }}
                    >
                      −
                    </button>
                    <span style={{
                      width: 36,
                      textAlign: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      borderLeft: '1px solid var(--color-border)',
                      borderRight: '1px solid var(--color-border)',
                      lineHeight: '34px'
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      style={{
                        width: 34,
                        height: 34,
                        border: 'none',
                        background: 'transparent',
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text)',
                        fontWeight: 600
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Right: Price + remove */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 6,
                    flexShrink: 0,
                    minWidth: 90
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>
                      GH₵ {(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      title="Remove"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-secondary)',
                        fontSize: 13,
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: 6,
                        fontWeight: 500
                      }}
                      onMouseEnter={e => e.target.style.color = '#dc2626'}
                      onMouseLeave={e => e.target.style.color = 'var(--color-text-secondary)'}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={clearCart}
                style={{
                  background: 'transparent',
                  border: '1.5px solid #fca5a5',
                  color: '#dc2626',
                  borderRadius: 10,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('/menu')}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--color-brand)',
                  color: 'var(--color-brand)',
                  borderRadius: 10,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Right: Summary */}
          <div style={{ flex: '0 0 360px', position: 'sticky', top: 100 }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              border: '1px solid var(--color-border)'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
                <span>Subtotal</span>
                <span>GH₵ {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Free</span> : `GH₵ ${deliveryFee.toFixed(2)}`}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12, color: 'var(--color-accent)' }}>
                  <span>Discount</span>
                  <span>-GH₵ {couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                <span>Total</span>
                <span>GH₵ {total.toFixed(2)}</span>
              </div>

              {/* Coupon */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 10,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon}
                    style={{
                      background: 'var(--color-text)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{couponError}</div>
                )}
              </div>

              {deliveryFee > 0 && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 10 }}>
                  Add GH₵ {(100 - subtotal).toFixed(2)} more for free delivery
                </div>
              )}

              {/* Checkout */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                style={{
                  width: '100%',
                  background: 'var(--color-brand)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 24px',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 20,
                  opacity: checkingOut ? 0.6 : 1
                }}
              >
                {checkingOut ? 'Processing...' : 'Place Order'}
              </button>

              <button
                onClick={() => navigate('/menu')}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginTop: 10,
                  padding: 0
                }}
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Cart;
