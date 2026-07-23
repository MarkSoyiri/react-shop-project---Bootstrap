import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosFetch from '../api/axiosFetchAPI';
import { CartContext } from '../context/CartContext';
import './Search.css';

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  const categories = ['all', 'promotions', 'meals', 'burgers', 'desserts', 'value deals', 'drinks', 'sides', 'combos'];

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      fetchResults(q, category, sort);
    }
  }, [searchParams]);

  const fetchResults = async (q, cat, srt) => {
    if (!q && cat === 'all') { setResults([]); return; }
    setLoading(true);
    try {
      let url = `/api/menu?limit=50`;
      if (q) url += `&search=${encodeURIComponent(q)}`;
      if (cat && cat !== 'all') url += `&category=${encodeURIComponent(cat)}`;
      if (srt) url += `&sort=${srt}`;
      const { data } = await axiosFetch.get(url);
      setResults(data.items || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (query) params.q = query;
    if (category !== 'all') params.category = category;
    if (sort) params.sort = sort;
    setSearchParams(params);
    fetchResults(query, category, sort);
  };

  const handleQuickAdd = (item) => {
    addToCart({ _id: item._id, name: item.name, image: item.image, price: item.price, quantity: 1 });
  };

  return (
    <div className="search-page">
      <div className="container-lg" style={{ paddingTop: 'var(--navbar-height)', paddingBottom: '80px' }}>
        {/* Heading */}
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', marginBottom: '32px' }}>
          Search Menu
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: '640px', margin: '0 auto 28px', width: '100%' }}>
          <svg
            style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search for food, drinks, deals..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '16px 20px 16px 52px',
              border: '2px solid var(--color-border)', borderRadius: 'var(--radius-xl)',
              fontSize: '16px', outline: 'none', background: 'var(--color-bg-card)',
              transition: 'border-color 200ms, box-shadow 200ms'
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,4,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
              padding: '10px 24px', borderRadius: 'var(--radius-lg)',
              background: 'var(--color-brand)', color: '#fff', border: 'none',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'background 200ms'
            }}
          >Search</button>
        </form>

        {/* Filters Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {/* Category Chips */}
          <div style={{
            display: 'flex', gap: '10px', overflowX: 'auto', flex: 1,
            scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '2px'
          }}>
            {categories.map(c => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setSearchParams(prev => {
                      const p = new URLSearchParams(prev);
                      if (c !== 'all') p.set('category', c); else p.delete('category');
                      return p;
                    });
                    fetchResults(query, c, sort);
                  }}
                  style={{
                    padding: '8px 20px', borderRadius: '100px',
                    border: '1.5px solid', borderColor: active ? 'var(--color-brand)' : 'var(--color-border)',
                    background: active ? 'var(--color-brand)' : 'var(--color-bg-card)',
                    color: active ? '#fff' : 'var(--color-text-secondary)',
                    fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                    cursor: 'pointer', transition: 'all 200ms', flexShrink: 0
                  }}
                >
                  {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); fetchResults(query, category, e.target.value); }}
            style={{
              padding: '10px 16px', borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)', background: 'var(--color-bg-card)',
              fontSize: '14px', color: 'var(--color-text)', outline: 'none',
              cursor: 'pointer', flexShrink: 0, minWidth: '160px'
            }}
          >
            <option value="">Sort by</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-brand)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>Searching...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 20px', display: 'block', opacity: 0.6 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)' }}>
              {query ? `No results for "${query}"` : 'Type something to search'}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              {query ? 'Try different keywords or browse by category' : 'Search across our entire menu'}
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px', fontWeight: 500 }}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map(item => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)',
                    padding: '12px', boxShadow: 'var(--shadow-sm)',
                    transition: 'box-shadow 200ms, transform 200ms', cursor: 'pointer'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Image */}
                  <div style={{
                    width: '100px', height: '100px', borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg-alt)'
                  }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '12px'
                      }}>No Image</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      onClick={() => navigate(`/product/${item._id}`)}
                      style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', margin: 0, cursor: 'pointer' }}
                    >
                      {item.name}
                    </h3>
                    {item.description && (
                      <p style={{
                        fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 6px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {item.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand)' }}>
                        GH₵ {item.price.toFixed(2)}
                      </span>
                      {item.averageRating > 0 && (
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          ★ {item.averageRating.toFixed(1)}
                        </span>
                      )}
                      {item.category && (
                        <span style={{
                          fontSize: '11px', fontWeight: 600, padding: '2px 10px',
                          borderRadius: '100px', background: 'var(--color-bg-alt)',
                          color: 'var(--color-text-muted)', textTransform: 'capitalize'
                        }}>
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuickAdd(item); }}
                    style={{
                      padding: '10px 22px', borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-brand)', color: '#fff', border: 'none',
                      fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                      flexShrink: 0, transition: 'background 200ms'
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--color-brand-dark)'}
                    onMouseLeave={e => e.target.style.background = 'var(--color-brand)'}
                  >Add</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
