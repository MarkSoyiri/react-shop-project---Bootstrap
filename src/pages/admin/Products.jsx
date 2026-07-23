import { useState, useEffect, useCallback } from 'react';
import useApi from '../../hooks/useApi';
import { formatCurrency } from '../../utils/helpers';
import { SkeletonTable } from '../../components/ui/Skeleton';

function AdminProducts() {
  const { get, post, put, del, loading } = useApi();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'meals',
    isAvailable: true, isPopular: false, isFeatured: false,
  });

  useEffect(() => {
    loadProducts();
  }, [pagination.page, search]);

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(search && { search }),
      });
      const res = await get(`/menu?${params}`);
      setProducts(res.data.items || res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, price: parseFloat(form.price) };
      if (editItem) {
        await put(`/menu/${editItem._id}`, data);
      } else {
        await post('/menu', data);
      }
      setShowModal(false);
      setEditItem(null);
      resetForm();
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await del(`/menu/${id}`);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await put(`/menu/${item._id}`, { isAvailable: !item.isAvailable });
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      isPopular: item.isPopular,
      isFeatured: item.isFeatured,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', price: '', category: 'meals',
      isAvailable: true, isPopular: false, isFeatured: false,
    });
  };

  if (loading && products.length === 0) return <SkeletonTable rows={8} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Products</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>{pagination.total} products total</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditItem(null); setShowModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'linear-gradient(135deg, #e85d04, #f48c06)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,93,4,0.3)',
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            style={{
              width: '100%', padding: '10px 16px 10px 42px', border: '1.5px solid #e5e7eb',
              borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff',
              transition: 'border-color 0.2s',
            }}
          />
        </div>
      </div>

      <div className="admin-table-wrapper" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
                      background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.image ? (
                        <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {item.description?.slice(0, 40) || 'No description'}{item.description?.length > 40 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: '#f3f4f6', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                    {item.category}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: '#111827' }}>{formatCurrency(item.price)}</td>
                <td>
                  <button
                    onClick={() => toggleAvailability(item)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '5px 12px', borderRadius: 20, border: 'none',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: item.isAvailable ? '#dcfce7' : '#fee2e2',
                      color: item.isAvailable ? '#166534' : '#991b1b',
                    }}
                  >
                    {item.isAvailable ? '✓ Active' : '✕ Inactive'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => openEdit(item)}
                      style={{
                        padding: '6px 14px', fontSize: 12, fontWeight: 600,
                        border: '1.5px solid #e5e7eb', borderRadius: 8,
                        background: '#fff', color: '#111827', cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{
                        padding: '6px 14px', fontSize: 12, fontWeight: 600,
                        border: '1.5px solid #fecaca', borderRadius: 8,
                        background: '#fff', color: '#ef4444', cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {pagination.pages > 1 && (
          <div className="admin-pagination">
            <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
              ← Prev
            </button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={p === pagination.page ? 'active' : ''}
                onClick={() => setPagination(prev => ({ ...prev, page: p }))}
              >
                {p}
              </button>
            ))}
            <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
              Next →
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 24, backdropFilter: 'blur(4px)',
        }} onClick={() => setShowModal(false)}>
          <div
            style={{
              background: '#fff', borderRadius: 16,
              padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{editItem ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>✕</button>
            </div>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }}
                />
              </div>
              <div className="admin-form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Price (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    required
                    style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }}
                  />
                </div>
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }}>
                    <option value="meals">Meals</option>
                    <option value="burgers">Burgers</option>
                    <option value="combos">Combos</option>
                    <option value="sides">Sides</option>
                    <option value="desserts">Desserts</option>
                    <option value="drinks">Drinks</option>
                    <option value="value deals">Value Deals</option>
                    <option value="promotions">Promotions</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { key: 'isAvailable', label: 'Available' },
                  { key: 'isPopular', label: 'Popular' },
                  { key: 'isFeatured', label: 'Featured' },
                ].map(opt => (
                  <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '8px 14px', borderRadius: 8, background: form[opt.key] ? 'rgba(232,93,4,0.08)' : '#f3f4f6', color: form[opt.key] ? '#e85d04' : '#6b7280', fontWeight: 600, transition: 'all 0.2s' }}>
                    <input type="checkbox" checked={form[opt.key]} onChange={e => setForm({ ...form, [opt.key]: e.target.checked })} style={{ accentColor: '#e85d04' }} />
                    {opt.label}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#6b7280' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e85d04, #f48c06)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,93,4,0.3)' }}>
                  {editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
