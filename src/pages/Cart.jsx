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
    <div className="cart-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 60px', paddingBottom: cartItems.length > 0 ? '60px' : '60px' }}>
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
        <div className="cart-layout" style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Left: Items */}
          <div className="cart-items-col" style={{ flex: '1 1 580px', minWidth: 0 }}>
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
          <div className="cart-summary-col" style={{ flex: '0 0 360px', position: 'sticky', top: 100 }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              border: '1px solid var(--color-border)'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Free</span> : formatCurrency(deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
                <span>Tax (15%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {deliveryFee > 0 && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 10 }}>
                  Add {formatCurrency(100 - subtotal)} more for free delivery
                </div>
              )}

              {/* Proceed to Checkout */}
              <button
                onClick={() => navigate('/checkout')}
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
                  marginTop: 20
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

      {/* Mobile Sticky CTA Bar */}
      {cartItems.length > 0 && (
        <div className="cart-mobile-cta" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid var(--color-border)',
          padding: '12px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12, zIndex: 40,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-brand)' }}>
              {formatCurrency(total)}
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            style={{
              flex: 1, maxWidth: 200,
              background: 'var(--color-brand)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px 20px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
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
          .cart-page { padding-bottom: 90px !important; }
          .cart-summary-col .zc-btn--full, .cart-summary-col button[style*="Place Order"] { display: none !important; }
          .cart-items-col { gap: 0 !important; }
          .cart-item-row { min-height: 44px; }
          .cart-qty-btn { min-width: 44px; min-height: 44px; width: 44px; height: 44px; }
        }
      `}</style>
    </div>
  );
}

export default Cart;
