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
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Categories</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>{categories.length} categories</p>
        </div>
        <button onClick={() => { setForm({ name: '', description: '', isActive: true, sortOrder: 0 }); setEditItem(null); setShowModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'linear-gradient(135deg, #e85d04, #f48c06)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,93,4,0.3)',
          }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {categories.map(cat => (
          <div key={cat._id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, transition: 'box-shadow 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: cat.isActive ? 'rgba(232,93,4,0.08)' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={cat.isActive ? '#e85d04' : '#9ca3af'} strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: cat.isActive ? '#dcfce7' : '#fee2e2', color: cat.isActive ? '#166534' : '#991b1b',
              }}>
                {cat.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#111827' }}>{cat.name}</h4>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>
              {cat.description || 'No description'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{cat.itemCount || 0} items</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => { setEditItem(cat); setForm({ name: cat.name, description: cat.description || '', isActive: cat.isActive, sortOrder: cat.sortOrder || 0 }); setShowModal(true); }}
                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, border: '1.5px solid #fecaca', borderRadius: 8, background: '#fff', color: '#ef4444', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24, backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{editItem ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>✕</button>
            </div>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
              </div>
              <div className="admin-form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div className="admin-form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '8px 14px', borderRadius: 8, background: form.isActive ? 'rgba(232,93,4,0.08)' : '#f3f4f6', color: form.isActive ? '#e85d04' : '#6b7280', fontWeight: 600 }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ accentColor: '#e85d04' }} /> Active
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e85d04, #f48c06)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,93,4,0.3)' }}>{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 992px) { .admin-categories-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 576px) { .admin-categories-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

export default AdminCategories;
