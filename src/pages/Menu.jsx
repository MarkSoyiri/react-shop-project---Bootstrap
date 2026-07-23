import { HomeHeadingNL } from '../components/HomeHeading';
import { Card } from '../components/Card';
import { useEffect,useState } from 'react';
import axiosFetch from '../api/axiosFetchAPI';
import Loader from '../components/Loader';

function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosFetch.get('/menu')
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load menu');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'promotions', name: 'PROMOTIONS' },
    { id: 'meals', name: 'MEALS' },
    { id: 'burgers', name: 'BURGERS' },
    { id: 'desserts', name: 'DESSERTS' }
  ];

  const getItemsByCategory = (cat) => {
    if (cat === 'promotions') return products.filter(p => p.category === 'promotions');
    return products.filter(p => !p.category || p.category === cat || p.category === 'meals');
  };

  if (loading) return <div style={{ marginTop: '150px' }}><Loader /></div>;

  if (error) return (
    <div className="container-lg" style={{ marginTop: '150px', textAlign: 'center' }}>
      <h2>Unable to load menu</h2>
      <p style={{ color: '#666' }}>{error}</p>
    </div>
  );

  return (
    <div className="menu-page">
      {categories.map((cat) => {
        const items = getItemsByCategory(cat.id);
        return (
          <section key={cat.id} id={cat.id} className="menu-section">
            <HomeHeadingNL heading={cat.name} />
            <div className="container-lg">
              {items.length === 0 ? (
                <p className="text-muted text-center py-4">No items available in this category.</p>
              ) : (
                <div className="foodBox">
                  <Card products={items} />
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default Menu
