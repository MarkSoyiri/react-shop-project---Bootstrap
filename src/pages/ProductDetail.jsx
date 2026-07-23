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
      <h2>Item Not Found</h2>
      <p className="text-muted">{error}</p>
      <button className="btn btn-primary mt-3" onClick={() => navigate('/menu')}>Back to Menu</button>
    </div>
  );

  return (
    <div className="product-detail-page">
      <div className="container-lg" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="pd-image-wrapper">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="pd-image-placeholder">No Image</div>
              )}
              {item.isPopular && <span className="pd-badge pd-badge-popular">Popular</span>}
              {item.isLimitedTime && <span className="pd-badge pd-badge-limited">Limited Time</span>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="pd-info">
              <h1>{item.name}</h1>
              {item.averageRating > 0 && (
                <div className="pd-rating">
                  {'★'.repeat(Math.round(item.averageRating))}{'☆'.repeat(5 - Math.round(item.averageRating))}
                  <span>{item.averageRating.toFixed(1)} ({item.totalRatings} reviews)</span>
                </div>
              )}
              <p className="pd-price">GH₵ {(selectedVariant ? selectedVariant.price : item.price).toFixed(2)}</p>
              {item.description && <p className="pd-description">{item.description}</p>}

              {item.variants && item.variants.length > 0 && (
                <div className="pd-section">
                  <h4>Size / Variant</h4>
                  <div className="pd-options">
                    {item.variants.filter(v => v.available !== false).map(v => (
                      <button key={v.name}
                        className={`pd-option-btn ${selectedVariant?.name === v.name ? 'active' : ''}`}
                        onClick={() => setSelectedVariant(v)}>
                        {v.name} - GH₵ {v.price.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {item.addOns && item.addOns.length > 0 && (
                <div className="pd-section">
                  <h4>Add-ons</h4>
                  <div className="pd-addons">
                    {item.addOns.filter(a => a.available !== false).map(a => (
                      <label key={a.name} className={`pd-addon ${selectedAddOns.find(s => s.name === a.name) ? 'active' : ''}`}>
                        <input type="checkbox" checked={selectedAddOns.some(s => s.name === a.name)} onChange={() => toggleAddOn(a)} />
                        {a.name} + GH₵ {a.price.toFixed(2)}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pd-section">
                <h4>Special Instructions</h4>
                <textarea placeholder="e.g. No onions, extra sauce..." value={notes} onChange={e => setNotes(e.target.value)} className="pd-textarea" />
              </div>

              <div className="pd-section">
                <h4>Quantity</h4>
                <div className="pd-quantity">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div className="pd-add-section">
                <p className="pd-total">Total: GH₵ {calculatePrice().toFixed(2)}</p>
                <button className={`pd-add-btn ${addedToCart ? 'added' : ''}`} onClick={handleAddToCart}>
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>

              <div className="pd-meta">
                {item.preparationTime && <span>⏱ {item.preparationTime} min</span>}
                {item.category && <span>📁 {item.category}</span>}
              </div>
            </div>
          </div>
        </div>

        {item.nutrition && (item.nutrition.calories || item.nutrition.protein) && (
          <div className="pd-nutrition mt-4">
            <h4>Nutrition Info</h4>
            <div className="pd-nutrition-grid">
              {item.nutrition.calories && <div><strong>{item.nutrition.calories}</strong><span>Calories</span></div>}
              {item.nutrition.protein && <div><strong>{item.nutrition.protein}g</strong><span>Protein</span></div>}
              {item.nutrition.carbs && <div><strong>{item.nutrition.carbs}g</strong><span>Carbs</span></div>}
              {item.nutrition.fat && <div><strong>{item.nutrition.fat}g</strong><span>Fat</span></div>}
              {item.nutrition.fiber && <div><strong>{item.nutrition.fiber}g</strong><span>Fiber</span></div>}
            </div>
          </div>
        )}

        <div className="pd-reviews mt-5">
          <h3>Reviews ({reviews.length})</h3>
          {user && (
            <form className="pd-review-form" onSubmit={handleSubmitReview}>
              <div className="pd-review-stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={s <= newReview.rating ? 'filled' : ''} onClick={() => setNewReview({...newReview, rating: s})}>★</span>
                ))}
              </div>
              <textarea placeholder="Write your review..." value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} className="pd-textarea" />
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
          <div className="pd-reviews-list">
            {reviews.length === 0 && <p className="text-muted">No reviews yet. Be the first!</p>}
            {reviews.map(r => (
              <div key={r._id} className="pd-review-card">
                <div className="pd-review-header">
                  <strong>{r.user?.username || 'User'}</strong>
                  <span className="pd-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p>{r.comment}</p>}
                <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>

        {relatedItems.length > 0 && (
          <div className="pd-related mt-5">
            <h3>You Might Also Like</h3>
            <div className="pd-related-grid">
              {relatedItems.map(ri => (
                <div key={ri._id} className="pd-related-card" onClick={() => navigate(`/product/${ri._id}`)}>
                  {ri.image && <img src={ri.image} alt={ri.name} />}
                  <h5>{ri.name}</h5>
                  <p>GH₵ {ri.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
