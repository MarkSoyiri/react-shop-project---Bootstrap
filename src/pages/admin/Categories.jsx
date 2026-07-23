import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { SkeletonTable } from '../../components/ui/Skeleton';

function AdminCategories() {
  const { get, post, put, del, loading } = useApi();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', isActive: true, sortOrder: 0 });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await get('/categories?includeInactive=true');
      setCategories(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await put(`/categories/${editItem._id}`, form);
      } else {
        await post('/categories', form);
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ name: '', description: '', isActive: true, sortOrder: 0 });
      loadCategories();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await del(`/categories/${id}`); loadCategories(); } catch (err) { alert(err.message); }
  };

  if (loading && categories.length === 0) return <SkeletonTable rows={5} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Categories</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{categories.length} categories</p>
        </div>
        <button className="btn-premium" onClick={() => { setForm({ name: '', description: '', isActive: true, sortOrder: 0 }); setEditItem(null); setShowModal(true); }}>
          + Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {categories.map(cat => (
          <div key={cat._id} className="admin-card">
            <div className="admin-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{cat.name}</h4>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  {cat.description || 'No description'}
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge-status ${cat.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {cat.itemCount || 0} items
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="quick-action-btn" style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => { setEditItem(cat); setForm({ name: cat.name, description: cat.description || '', isActive: cat.isActive, sortOrder: cat.sortOrder || 0 }); setShowModal(true); }}>
                  Edit
                </button>
                <button className="quick-action-btn" style={{ padding: '6px 10px', fontSize: 12, borderColor: '#ef4444', color: '#ef4444' }}
                  onClick={() => handleDelete(cat._id)}>
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', padding: 32, width: '100%', maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{editItem ? 'Edit Category' : 'Add Category'}</h3>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-form-group">
                <label>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="admin-form-group">
                <label>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn-premium-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-premium">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
