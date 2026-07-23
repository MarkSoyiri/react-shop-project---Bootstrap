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
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Products</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            {pagination.total} products total
          </p>
        </div>
        <button
          className="btn-premium"
          onClick={() => { resetForm(); setEditItem(null); setShowModal(true); }}
        >
          + Add Product
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          style={{
            width: 320, padding: '10px 16px', border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none',
          }}
        />
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Popular</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 8, overflow: 'hidden',
                      background: 'var(--color-bg-alt)',
                    }}>
                      {item.image ? (
                        <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍔</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {item.description?.slice(0, 40)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</td>
                <td>
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`badge-status ${item.isAvailable ? 'badge-delivered' : 'badge-cancelled'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {item.isAvailable ? '✓ Active' : '✕ Inactive'}
                  </button>
                </td>
                <td>{item.isPopular ? '🔥' : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="quick-action-btn"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => openEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="quick-action-btn"
                      style={{ padding: '6px 12px', fontSize: 12, borderColor: '#ef4444', color: '#ef4444' }}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
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
          zIndex: 9999, padding: 24,
        }} onClick={() => setShowModal(false)}>
          <div
            style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
              padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
              {editItem ? 'Edit Product' : 'Add Product'}
            </h3>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-form-group">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
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
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} />
                  Available
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} />
                  Popular
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
                  Featured
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn-premium-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-premium">
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
