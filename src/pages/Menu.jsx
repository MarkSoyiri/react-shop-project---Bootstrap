import { Card } from '../components/Card';
import { useEffect, useState } from 'react';
import axiosFetch from '../api/axiosFetchAPI';
import { motion } from 'framer-motion';
import { SkeletonCard } from '../components/ui/Skeleton';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosFetch.get('/api/menu?limit=100')
      .then((res) => {
        const items = res.data.items || res.data || [];
        setProducts(items);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load menu');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'all', name: 'ALL' },
    { id: 'promotions', name: 'PROMOTIONS' },
    { id: 'meals', name: 'MEALS' },
    { id: 'burgers', name: 'BURGERS' },
    { id: 'desserts', name: 'DESSERTS' },
    { id: 'value deals', name: 'VALUE DEALS' },
    { id: 'drinks', name: 'DRINKS' },
    { id: 'sides', name: 'SIDES' },
    { id: 'combos', name: 'COMBOS' }
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="menu-page" style={{ paddingTop: 'var(--navbar-height)', paddingBottom: '80px' }}>
        <div className="container-lg">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-lg" style={{ marginTop: 'var(--navbar-height)', paddingTop: 48, textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>Unable to load menu</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '16px', padding: '10px 28px', borderRadius: 'var(--radius-lg)',
            background: 'var(--color-brand)', color: '#fff', border: 'none',
            fontWeight: 600, fontSize: '15px', cursor: 'pointer'
          }}
        >Retry</button>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div style={{ marginTop: 'var(--navbar-height)', padding: '48px 0 24px' }}>
        <div className="container-lg">
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Our Menu
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
              Explore our delicious selection
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto 24px', width: '100%' }}>
            <svg
              style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '14px 20px 14px 52px',
                border: '2px solid var(--color-border)', borderRadius: 'var(--radius-xl)',
                fontSize: '16px', outline: 'none', background: 'var(--color-bg-card)',
                transition: 'border-color 200ms, box-shadow 200ms'
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,4,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Category Chips */}
          <div style={{
            display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px',
            WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'
          }}>
            {categories.map(cat => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '8px 22px', borderRadius: '100px',
                    border: '1.5px solid', borderColor: active ? 'var(--color-brand)' : 'var(--color-border)',
                    background: active ? 'var(--color-brand)' : 'var(--color-bg-card)',
                    color: active ? '#fff' : 'var(--color-text-secondary)',
                    fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                    cursor: 'pointer', transition: 'all 200ms',
                    flexShrink: 0
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container-lg" style={{ paddingBottom: '80px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="8" x2="14" y2="14" />
              <line x1="14" y1="8" x2="8" y2="14" />
            </svg>
            <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text)' }}>No items found</p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No items in this category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  marginTop: '20px', padding: '10px 28px', borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-brand)', background: 'transparent',
                  color: 'var(--color-brand)', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  transition: 'all 200ms'
                }}
                onMouseEnter={e => { e.target.style.background = 'var(--color-brand)'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--color-brand)'; }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="foodBox"
          >
            {filteredProducts.map(product => (
              <motion.div key={product._id} variants={itemVariants}>
                <Card products={[product]} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Menu;
