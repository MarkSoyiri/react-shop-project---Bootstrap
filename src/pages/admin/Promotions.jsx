import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { SkeletonTable } from '../../components/ui/Skeleton';

function AdminPromotions() {
  const { get, post, put, del, loading } = useApi();
  const [promos, setPromos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', type: 'percentage', value: '',
    minimumOrder: '', startDate: '', endDate: '', isActive: true, priority: 0,
  });

  useEffect(() => { loadPromos(); }, []);

  const loadPromos = async () => {
    try {
      const res = await get('/promotions');
      setPromos(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, value: parseFloat(form.value) };
      if (form.minimumOrder) data.minimumOrder = parseFloat(form.minimumOrder);
      if (editItem) {
        await put(`/promotions/${editItem._id}`, data);
      } else {
        await post('/promotions', data);
      }
      setShowModal(false); setEditItem(null); loadPromos();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotion?')) return;
    try { await del(`/promotions/${id}`); loadPromos(); } catch (err) { alert(err.message); }
  };

  if (loading && promos.length === 0) return <SkeletonTable rows={5} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Promotions</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>{promos.length} promotions</p>
        </div>
        <button onClick={() => { setForm({ title: '', description: '', type: 'percentage', value: '', minimumOrder: '', startDate: '', endDate: '', isActive: true, priority: 0 }); setEditItem(null); setShowModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'linear-gradient(135deg, #e85d04, #f48c06)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,93,4,0.3)',
          }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Promotion
        </button>
      </div>

      <div className="admin-table-wrapper" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Value</th>
              <th>Valid Period</th>
              <th>Used</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map(p => (
              <tr key={p._id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{p.description?.slice(0, 50) || 'No description'}{p.description?.length > 50 ? '...' : ''}</div>
                </td>
                <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{p.type}</td>
                <td style={{ fontWeight: 700 }}>{p.type === 'percentage' ? `${p.value}%` : formatCurrency(p.value)}</td>
                <td style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(p.startDate)} – {formatDate(p.endDate)}</td>
                <td style={{ fontSize: 13 }}>{p.usedCount || 0}{p.usageLimit ? ` / ${p.usageLimit}` : ''}</td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#166534' : '#991b1b',
                  }}>{p.isActive ? '✓ Active' : '✕ Inactive'}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditItem(p); setForm({ title: p.title, description: p.description, type: p.type, value: p.value, minimumOrder: p.minimumOrder || '', startDate: p.startDate?.slice(0, 10), endDate: p.endDate?.slice(0, 10), isActive: p.isActive, priority: p.priority || 0 }); setShowModal(true); }}
                      style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}
                      style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, border: '1.5px solid #fecaca', borderRadius: 8, background: '#fff', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>No promotions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24, backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{editItem ? 'Edit Promotion' : 'Create Promotion'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>✕</button>
            </div>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
              </div>
              <div className="admin-form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Value</label>
                  <input type="number" step="0.01" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
                </div>
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
                </div>
              </div>
              <div className="admin-form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Minimum Order (optional)</label>
                <input type="number" step="0.01" min="0" value={form.minimumOrder} onChange={e => setForm({ ...form, minimumOrder: e.target.value })} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e85d04, #f48c06)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,93,4,0.3)' }}>{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPromotions;
