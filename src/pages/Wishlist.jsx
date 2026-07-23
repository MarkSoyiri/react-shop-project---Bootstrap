import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import useApi from '../hooks/useApi';
import { formatCurrency } from '../utils/helpers';

function Wishlist() {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { get, loading } = useApi();
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    try {
      const res = await get('/auth/wishlist');
      setItems(res.data || []);
    } catch (err) { console.error(err); }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await get(`/auth/wishlist/toggle/${itemId}`);
      setItems(items.filter(i => i._id !== itemId));
    } catch (err) { console.error(err); }
  };

  const handleAddToCart = (item) => {
    addToCart({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Please sign in to view your wishlist</h2>
        <button onClick={() => navigate('/login')} style={{ marginTop: 16, padding: '12px 32px', borderRadius: 12, border: 'none', background: 'var(--color-brand)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>My Wishlist</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 32 }}>
        {items.length} saved {items.length === 1 ? 'item' : 'items'}
      </p>

      {items.length > 0 ? (
        <div className="foodBox">
          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="zc-product-card-wrap"
              onClick={() => navigate(`/product/${item._id}`)}
            >
              <div className="zc-product-card">
                <div className="zc-product-card__img-wrap">
                  <img
                    src={item.image || '/placeholder-food.jpg'}
                    alt={item.name}
                    className="zc-product-card__img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>

                <div className="zc-product-card__body">
                  <h3 className="zc-product-card__title">{item.name}</h3>

                  <div className="zc-product-card__rating">
                    <span className="zc-product-card__stars">★★★★☆</span>
                  </div>

                  <div className="zc-product-card__footer">
                    <span className="zc-product-card__price">{formatCurrency(item.price)}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="zc-product-card__add-btn"
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                      >
                        Add
                      </button>
                      <button
                        className="zc-product-card__add-btn"
                        style={{ background: 'transparent', color: '#dc2626', border: '1.5px solid #fca5a5' }}
                        onClick={(e) => { e.stopPropagation(); removeFromWishlist(item._id); }}
                        title="Remove from wishlist"
                      >
                        ♡
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.25 }}>&#9825;</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Browse our menu and save items you love!</p>
          <button onClick={() => navigate('/menu')} style={{ padding: '12px 32px', borderRadius: 12, border: 'none', background: 'var(--color-brand)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Browse Menu</button>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
