import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/helpers";
import "./Cart.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.15;
  const deliveryFee = subtotal >= 100 ? 0 : 15;
  const total = subtotal + tax + deliveryFee;

  return (
    <div className="cart-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '84px 24px 60px', paddingBottom: cartItems.length > 0 ? '60px' : '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Your Cart</h1>
        {cartItems.length > 0 && (
          <span style={{
            background: 'var(--color-brand)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 999,
            lineHeight: '20px'
          }}>
            {cartItems.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 14, opacity: 0.3 }}>🛒</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Your cart is empty</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20, fontSize: 14 }}>
            Browse our menu and add some delicious items!
          </p>
          <button
            onClick={() => navigate('/menu')}
            style={{
              background: 'var(--color-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 48
            }}
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="cart-layout" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Left: Items */}
          <div className="cart-items-col" style={{ flex: '1 1 0', minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="cart-item-card"
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-img"
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 10,
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                  )}

                  {/* Info + Controls */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Name + Price row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                        {item.variant && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                            {item.variant}
                          </div>
                        )}
                        {item.addOns?.length > 0 && (
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            + {item.addOns.map(a => a.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-brand)', flexShrink: 0 }}>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Quantity + Remove row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 10,
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="cart-qty-btn"
                          style={{
                            width: 36,
                            height: 36,
                            border: 'none',
                            background: 'transparent',
                            fontSize: 16,
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
                          width: 32,
                          textAlign: 'center',
                          fontSize: 13,
                          fontWeight: 600,
                          borderLeft: '1px solid var(--color-border)',
                          borderRight: '1px solid var(--color-border)',
                          lineHeight: '36px'
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="cart-qty-btn"
                          style={{
                            width: 36,
                            height: 36,
                            border: 'none',
                            background: 'transparent',
                            fontSize: 16,
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
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="cart-remove-btn"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          fontSize: 12,
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontWeight: 500,
                          minHeight: 36,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={clearCart}
                style={{
                  background: 'transparent',
                  border: '1.5px solid #fca5a5',
                  color: '#dc2626',
                  borderRadius: 10,
                  padding: '10px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 40
                }}
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('/menu')}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: 10,
                  padding: '10px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 40
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="cart-summary-col" style={{ flex: '0 0 320px', position: 'sticky', top: 100 }}>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              padding: 20,
              border: '1px solid var(--color-border)'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Order Summary</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10, color: 'var(--color-text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10, color: 'var(--color-text-secondary)' }}>
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Free</span> : formatCurrency(deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10, color: 'var(--color-text-secondary)' }}>
                <span>Tax (15%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 2, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700 }}>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {deliveryFee > 0 && (
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                  Add {formatCurrency(100 - subtotal)} more for free delivery
                </div>
              )}

              <button
                onClick={() => navigate('/checkout')}
                className="cart-checkout-btn"
                style={{
                  width: '100%',
                  background: 'var(--color-brand)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 24px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 16,
                  minHeight: 48
                }}
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/menu')}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginTop: 8,
                  padding: 0
                }}
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky CTA Bar */}
      {cartItems.length > 0 && (
        <div className="cart-mobile-cta" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)',
          padding: '12px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12, zIndex: 40,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Total</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-brand)' }}>
              {formatCurrency(total)}
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            style={{
              flex: 1, maxWidth: 200,
              background: 'var(--color-brand)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px 20px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              minHeight: 48
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      <style>{`
        .cart-mobile-cta { display: none !important; }
        @media (max-width: 768px) {
          .cart-mobile-cta { display: flex !important; }
          .cart-page { padding-bottom: 80px !important; }
          .cart-summary-col { display: none !important; }
          .cart-items-col { flex: 1 1 auto !important; width: 100%; }
          .cart-item-card { padding: 12px; gap: 10px; }
          .cart-item-card img { width: 60px !important; height: 60px !important; }
        }
        @media (max-width: 480px) {
          .cart-item-card { padding: 10px; gap: 8px; }
          .cart-item-card img { width: 52px !important; height: 52px !important; }
        }
      `}</style>
    </div>
  );
}

export default Cart;
