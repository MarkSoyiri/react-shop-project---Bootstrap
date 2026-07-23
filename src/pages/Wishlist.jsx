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
      <div className="wishlist-page" style={{ textAlign: 'center' }}>
        <h2>Please sign in to view your wishlist</h2>
        <button className="btn-premium" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>My Wishlist</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
          {items.length} saved items
        </p>

        {items.length > 0 ? (
          <div className="wishlist-grid">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                className="menu-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="card-img-wrapper" onClick={() => navigate(`/product/${item._id}`)}>
                  <img src={item.image || '/placeholder-food.jpg'} alt={item.name} />
                </div>
                <h3 onClick={() => navigate(`/product/${item._id}`)} style={{ cursor: 'pointer' }}>{item.name}</h3>
                <p className="card-desc">{item.description?.slice(0, 60)}</p>
                <div className="card-price">{formatCurrency(item.price)}</div>
                <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
                  <button className="card-order-btn" style={{ flex: 1 }} onClick={() => handleAddToCart(item)}>
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    style={{
                      width: 44, height: 44, border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)',
                      cursor: 'pointer', fontSize: 18, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Remove from wishlist"
                  >
                    ♡
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="wishlist-empty">
            <div className="empty-icon">♡</div>
            <h3>Your wishlist is empty</h3>
            <p>Browse our menu and save items you love!</p>
            <button className="btn-premium" onClick={() => navigate('/menu')}>Browse Menu</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
