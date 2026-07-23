import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosFetch from '../api/axiosFetchAPI';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosFetch.get(`/api/menu/${id}`)
      .then(res => {
        setItem(res.data.item);
        setReviews(res.data.reviews || []);
        setRelatedItems(res.data.relatedItems || []);
        if (res.data.item.variants && res.data.item.variants.length > 0) {
          setSelectedVariant(res.data.item.variants[0]);
        }
      })
      .catch(err => setError(err.response?.data?.message || 'Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.name === addOn.name);
      if (exists) return prev.filter(a => a.name !== addOn.name);
      return [...prev, addOn];
    });
  };

  const calculatePrice = () => {
    if (!item) return 0;
    let base = selectedVariant ? selectedVariant.price : item.price;
    selectedAddOns.forEach(ao => { base += ao.price; });
    return base * quantity;
  };

  const handleAddToCart = () => {
    const cartItem = {
      _id: item._id,
      name: item.name,
      image: item.image,
      price: selectedVariant ? selectedVariant.price : item.price,
      quantity,
      variant: selectedVariant ? selectedVariant.name : '',
      addOns: selectedAddOns,
      notes
    };
    for (let i = 0; i < quantity; i++) addToCart(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await axiosFetch.post(`/api/menu/${id}/reviews`, newReview);
      setReviews(data.reviews || []);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div style={{ marginTop: '150px' }}><Loader /></div>;
  if (error) return (
    <div className="container-lg" style={{ marginTop: '150px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>Item Not Found</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>{error}</p>
      <button
        onClick={() => navigate('/menu')}
        style={{
          marginTop: '16px', padding: '10px 28px', borderRadius: 'var(--radius-lg)',
          background: 'var(--color-brand)', color: '#fff', border: 'none',
          fontWeight: 600, fontSize: '15px', cursor: 'pointer'
        }}
      >Back to Menu</button>
    </div>
  );

  return (
    <div className="product-detail-page">
      <div className="container-lg" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: '32px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
          <span
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'color 200ms' }}
            onMouseEnter={e => e.target.style.color = 'var(--color-brand)'}
            onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
          >Home</span>
          <span style={{ margin: '0 10px' }}>/</span>
          <span
            onClick={() => navigate('/menu')}
            style={{ cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'color 200ms' }}
            onMouseEnter={e => e.target.style.color = 'var(--color-brand)'}
            onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
          >Menu</span>
          <span style={{ margin: '0 10px' }}>/</span>
          <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{item.name}</span>
        </nav>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }} className="pd-columns">
          {/* Left: Image */}
          <div>
            <div style={{
              borderRadius: 'var(--radius-2xl)', overflow: 'hidden',
              aspectRatio: '4 / 3', background: 'var(--color-bg-alt)',
              position: 'relative'
            }}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '16px', fontWeight: 500
                }}>
                  No Image Available
                </div>
              )}
              {/* Badges */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                {item.isPopular && (
                  <span style={{
                    padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700,
                    background: 'var(--color-brand)', color: '#fff'
                  }}>Popular</span>
                )}
                {item.isLimitedTime && (
                  <span style={{
                    padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700,
                    background: 'var(--color-brand-dark)', color: '#fff'
                  }}>Limited Time</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div>
            {/* Title */}
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 10px' }}>
              {item.name}
            </h1>

            {/* Rating */}
            {item.averageRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{
                      fontSize: '16px', color: s <= Math.round(item.averageRating) ? 'var(--color-brand)' : 'var(--color-border)'
                    }}>★</span>
                  ))}
                </div>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  {item.averageRating.toFixed(1)} ({item.totalRatings} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-brand)', margin: '0 0 14px' }}>
              GH₵ {(selectedVariant ? selectedVariant.price : item.price).toFixed(2)}
            </p>

            {/* Description */}
            {item.description && (
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 24px', lineHeight: 1.6 }}>
                {item.description}
              </p>
            )}

            {/* Variants */}
            {item.variants && item.variants.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Size / Variant
                </h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {item.variants.filter(v => v.available !== false).map(v => {
                    const active = selectedVariant?.name === v.name;
                    return (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '10px 20px', borderRadius: '100px',
                          border: '1.5px solid', borderColor: active ? 'var(--color-brand)' : 'var(--color-border)',
                          background: active ? 'var(--color-brand)' : 'var(--color-bg-card)',
                          color: active ? '#fff' : 'var(--color-text)',
                          fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms'
                        }}
                      >
                        {v.name} - GH₵ {v.price.toFixed(2)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {item.addOns && item.addOns.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Add-ons
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {item.addOns.filter(a => a.available !== false).map(a => {
                    const checked = selectedAddOns.some(s => s.name === a.name);
                    return (
                      <label
                        key={a.name}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 16px', borderRadius: 'var(--radius-lg)',
                          border: '1.5px solid', borderColor: checked ? 'var(--color-brand)' : 'var(--color-border)',
                          background: checked ? 'rgba(232,93,4,0.04)' : 'var(--color-bg-card)',
                          cursor: 'pointer', transition: 'all 200ms'
                        }}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: 'var(--radius-sm)',
                          border: '2px solid', borderColor: checked ? 'var(--color-brand)' : 'var(--color-border)',
                          background: checked ? 'var(--color-brand)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all 200ms'
                        }}>
                          {checked && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddOn(a)}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: '14px', color: 'var(--color-text)', fontWeight: 500 }}>{a.name}</span>
                        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>+ GH₵ {a.price.toFixed(2)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Special Instructions
              </h4>
              <textarea
                placeholder="e.g. No onions, extra sauce..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{
                  width: '100%', minHeight: '80px', padding: '14px 16px',
                  borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-border)',
                  fontSize: '14px', outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', background: 'var(--color-bg-card)',
                  transition: 'border-color 200ms'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quantity
              </h4>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0',
                borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-border)',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '44px', height: '44px', border: 'none', background: 'var(--color-bg-alt)',
                    fontSize: '18px', fontWeight: 600, cursor: 'pointer',
                    color: quantity <= 1 ? 'var(--color-text-muted)' : 'var(--color-text)',
                    transition: 'background 200ms'
                  }}
                >−</button>
                <span style={{
                  width: '48px', textAlign: 'center', fontSize: '16px', fontWeight: 700,
                  color: 'var(--color-text)'
                }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '44px', height: '44px', border: 'none', background: 'var(--color-bg-alt)',
                    fontSize: '18px', fontWeight: 600, cursor: 'pointer', color: 'var(--color-text)',
                    transition: 'background 200ms'
                  }}
                >+</button>
              </div>
            </div>

            {/* Total */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-brand)', margin: 0 }}>
                Total: GH₵ {calculatePrice().toFixed(2)}
              </p>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              style={{
                width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
                border: 'none', fontWeight: 700, fontSize: '16px',
                cursor: 'pointer', transition: 'all 300ms',
                background: addedToCart ? 'var(--color-accent)' : 'var(--color-brand)',
                color: '#fff',
                boxShadow: addedToCart ? '0 4px 16px rgba(43,147,72,0.3)' : '0 4px 16px rgba(232,93,4,0.25)'
              }}
            >
              {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>

            {/* Meta */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
              {item.preparationTime && (
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {item.preparationTime} min prep
                </span>
              )}
              {item.category && (
                <span style={{
                  fontSize: '12px', fontWeight: 600, padding: '4px 12px',
                  borderRadius: '100px', background: 'var(--color-bg-alt)',
                  color: 'var(--color-text-muted)', textTransform: 'capitalize'
                }}>{item.category}</span>
              )}
            </div>
          </div>
        </div>

        {/* Nutrition */}
        {item.nutrition && (item.nutrition.calories || item.nutrition.protein) && (
          <div style={{
            marginTop: '48px', padding: '32px', borderRadius: 'var(--radius-xl)',
            background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 20px' }}>
              Nutrition Information
            </h4>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px'
            }} className="pd-nutrition-grid">
              {[
                { value: item.nutrition.calories, label: 'Calories', unit: '' },
                { value: item.nutrition.protein, label: 'Protein', unit: 'g' },
                { value: item.nutrition.carbs, label: 'Carbs', unit: 'g' },
                { value: item.nutrition.fat, label: 'Fat', unit: 'g' },
                { value: item.nutrition.fiber, label: 'Fiber', unit: 'g' }
              ].filter(n => n.value).map(n => (
                <div key={n.label} style={{
                  textAlign: 'center', padding: '16px 8px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-alt)'
                }}>
                  <strong style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-brand)', display: 'block' }}>
                    {n.value}{n.unit}
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, marginTop: '4px', display: 'block' }}>
                    {n.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '24px' }}>
            Reviews ({reviews.length})
          </h3>

          {user && (
            <form
              onSubmit={handleSubmitReview}
              style={{
                padding: '24px', borderRadius: 'var(--radius-xl)',
                background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span
                    key={s}
                    onClick={() => setNewReview({ ...newReview, rating: s })}
                    style={{
                      fontSize: '28px', cursor: 'pointer',
                      color: s <= newReview.rating ? 'var(--color-brand)' : 'var(--color-border)',
                      transition: 'color 150ms'
                    }}
                  >★</span>
                ))}
              </div>
              <textarea
                placeholder="Write your review..."
                value={newReview.comment}
                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                style={{
                  width: '100%', minHeight: '80px', padding: '14px 16px',
                  borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--color-border)',
                  fontSize: '14px', outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', marginBottom: '16px',
                  transition: 'border-color 200ms'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
              <button
                type="submit"
                disabled={submittingReview}
                style={{
                  padding: '10px 28px', borderRadius: 'var(--radius-lg)',
                  background: submittingReview ? 'var(--color-text-muted)' : 'var(--color-brand)',
                  color: '#fff', border: 'none', fontWeight: 600, fontSize: '14px',
                  cursor: submittingReview ? 'not-allowed' : 'pointer'
                }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', textAlign: 'center', padding: '32px 0' }}>
                No reviews yet. Be the first!
              </p>
            )}
            {reviews.map(r => (
              <div key={r._id} style={{
                padding: '20px', borderRadius: 'var(--radius-xl)',
                background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
                    background: 'var(--color-brand)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, flexShrink: 0
                  }}>
                    {(r.user?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                      {r.user?.username || 'User'}
                    </strong>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: '14px', color: s <= r.rating ? 'var(--color-brand)' : 'var(--color-border)' }}>★</span>
                  ))}
                </div>
                {r.comment && <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        {relatedItems.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '20px' }}>
              You Might Also Like
            </h3>
            <div style={{
              display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px',
              scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'
            }}>
              {relatedItems.map(ri => (
                <div
                  key={ri._id}
                  onClick={() => navigate(`/product/${ri._id}`)}
                  style={{
                    minWidth: '180px', borderRadius: 'var(--radius-xl)',
                    background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden', cursor: 'pointer',
                    transition: 'box-shadow 200ms, transform 200ms', flexShrink: 0
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
                >
                  {ri.image ? (
                    <img src={ri.image} alt={ri.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '120px', background: 'var(--color-bg-alt)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-text-muted)', fontSize: '12px'
                    }}>No Image</div>
                  )}
                  <div style={{ padding: '12px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px' }}>
                      {ri.name}
                    </h5>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-brand)', margin: 0 }}>
                      GH₵ {ri.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pd-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        @media (max-width: 768px) { .pd-columns { grid-template-columns: 1fr; gap: 32px; } }
        .pd-nutrition-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        @media (max-width: 768px) { .pd-nutrition-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 480px) { .pd-nutrition-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}

export default ProductDetail;
