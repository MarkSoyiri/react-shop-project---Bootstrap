import { Card } from '../components/Card';
import { useEffect, useState } from 'react';
import axiosFetch from '../api/axiosFetchAPI';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  if (loading) return <div style={{ marginTop: '150px' }}><Loader /></div>;

  if (error) return (
    <div className="container-lg" style={{ marginTop: '150px', textAlign: 'center' }}>
      <h2>Unable to load menu</h2>
      <p style={{ color: '#666' }}>{error}</p>
      <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="menu-page">
      <div style={{ marginTop: '72px', padding: '24px 0 0' }}>
        <div className="container-lg">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" placeholder="Search menu items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '12px 16px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '15px', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', WebkitOverflowScrolling: 'touch' }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 20px', borderRadius: '100px', border: '1.5px solid',
                  borderColor: activeCategory === cat.id ? 'var(--color-brand)' : 'var(--color-border)',
                  background: activeCategory === cat.id ? 'rgba(232,93,4,0.06)' : 'var(--color-bg)',
                  color: activeCategory === cat.id ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                  fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 200ms'
                }}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-lg">
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
              {searchQuery ? `No items matching "${searchQuery}"` : 'No items in this category'}
            </p>
            {searchQuery && (
              <button className="btn btn-outline-primary mt-3" onClick={() => setSearchQuery('')}>Clear Search</button>
            )}
          </div>
        ) : (
          <div className="foodBox">
            <Card products={filteredProducts} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;
