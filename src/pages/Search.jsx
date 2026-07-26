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
      <div className="container-lg" style={{ paddingTop: 84, paddingBottom: '80px' }}>
        {/* Heading */}
        <h1 className="search-heading">Search Menu</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-bar-wrap">
          <div className="search-input-wrap">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search food, drinks, deals..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              className="search-input"
            />
          </div>
          <button type="submit" className="search-submit-btn">Search</button>
        </form>

        {/* Filters */}
        <div className="search-filters">
          <div className="search-chips-scroll">
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
                  className={`search-chip ${active ? 'active' : ''}`}
                >
                  {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              );
            })}
          </div>
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); fetchResults(query, category, e.target.value); }}
            className="search-sort-select"
          >
            <option value="">Sort by</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="search-empty-state">
            <div className="search-spinner" />
            <p className="search-empty-text">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text)' }}>
              {query ? `No results for "${query}"` : 'Type something to search'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 4 }}>
              {query ? 'Try different keywords or browse by category' : 'Search across our entire menu'}
            </p>
          </div>
        ) : (
          <>
            <p className="search-result-count">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
            <div className="search-results-list">
              {results.map(item => (
                <div
                  key={item._id}
                  className="search-result-card"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="search-result-img-wrap">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="search-result-img" />
                    ) : (
                      <div className="search-result-no-img">No Image</div>
                    )}
                  </div>
                  <div className="search-result-info">
                    <h3 className="search-result-name">{item.name}</h3>
                    {item.description && (
                      <p className="search-result-desc">{item.description}</p>
                    )}
                    <div className="search-result-meta">
                      <span className="search-result-price">GH₵ {item.price.toFixed(2)}</span>
                      {item.averageRating > 0 && (
                        <span className="search-result-rating">★ {item.averageRating.toFixed(1)}</span>
                      )}
                      {item.category && (
                        <span className="search-result-cat">{item.category}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="search-add-btn"
                    onClick={(e) => { e.stopPropagation(); handleQuickAdd(item); }}
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
