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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--color-border)', transition: 'box-shadow 0.2s, border-color 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'transparent'; }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              <div style={{ height: 200, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/product/${item._id}`)}>
                <img src={item.image || '/placeholder-food.jpg'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'} />
              </div>

              <div style={{ padding: '16px 20px 20px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, cursor: 'pointer' }} onClick={() => navigate(`/product/${item._id}`)}>{item.name}</h3>

                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(s => (<span key={s} style={{ fontSize: 13, color: s <= 4 ? '#f59e0b' : '#d1d5db' }}>&#9733;</span>))}
                </div>

                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-brand)', marginBottom: 16 }}>
                  {formatCurrency(item.price)}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleAddToCart(item)} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--color-brand)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--color-brand-dark)'} onMouseOut={e => e.currentTarget.style.background = 'var(--color-brand)'}>
                    Add to Cart
                  </button>
                  <button onClick={() => removeFromWishlist(item._id)} style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #fca5a5', background: 'transparent', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fee2e2'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} title="Remove from wishlist">
                    &#9825;
                  </button>
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
