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
      <div className="container-lg" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <h1 className="search-title">Search Menu</h1>

        <form className="search-bar" onSubmit={handleSearch}>
          <input type="text" placeholder="Search for food, drinks, deals..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
          <button type="submit">Search</button>
        </form>

        <div className="search-filters">
          <div className="search-filter-chips">
            {categories.map(c => (
              <button key={c} className={`search-chip ${category === c ? 'active' : ''}`}
                onClick={() => { setCategory(c); setSearchParams(prev => { const p = new URLSearchParams(prev); if (c !== 'all') p.set('category', c); else p.delete('category'); return p; }); fetchResults(query, c, sort); }}>
                {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <select className="search-sort" value={sort} onChange={e => { setSort(e.target.value); fetchResults(query, category, e.target.value); }}>
            <option value="">Sort by</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="search-loading">
            <div className="search-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty">
            <p>{query ? `No results for "${query}"` : 'Type something to search the menu'}</p>
          </div>
        ) : (
          <>
            <p className="search-count">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            <div className="search-results">
              {results.map(item => (
                <div key={item._id} className="search-result-card">
                  {item.image && <img src={item.image} alt={item.name} className="search-result-img" />}
                  <div className="search-result-info">
                    <h3 onClick={() => navigate(`/product/${item._id}`)}>{item.name}</h3>
                    {item.description && <p className="search-result-desc">{item.description}</p>}
                    <div className="search-result-meta">
                      <span className="search-result-price">GH₵ {item.price.toFixed(2)}</span>
                      {item.averageRating > 0 && <span className="search-result-rating">★ {item.averageRating.toFixed(1)}</span>}
                      {item.category && <span className="search-result-cat">{item.category}</span>}
                    </div>
                  </div>
                  <button className="search-result-add" onClick={() => handleQuickAdd(item)}>Add</button>
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
