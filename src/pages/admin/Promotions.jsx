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
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Promotions</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{promos.length} promotions</p>
        </div>
        <button className="btn-premium" onClick={() => { setForm({ title: '', description: '', type: 'percentage', value: '', minimumOrder: '', startDate: '', endDate: '', isActive: true, priority: 0 }); setEditItem(null); setShowModal(true); }}>
          + Create Promotion
        </button>
      </div>

      <div className="admin-table-wrapper">
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
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{p.description?.slice(0, 50)}</div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{p.type}</td>
                <td style={{ fontWeight: 600 }}>{p.type === 'percentage' ? `${p.value}%` : formatCurrency(p.value)}</td>
                <td style={{ fontSize: 13 }}>{formatDate(p.startDate)} – {formatDate(p.endDate)}</td>
                <td>{p.usedCount || 0}{p.usageLimit ? ` / ${p.usageLimit}` : ''}</td>
                <td><span className={`badge-status ${p.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="quick-action-btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { setEditItem(p); setForm({ title: p.title, description: p.description, type: p.type, value: p.value, minimumOrder: p.minimumOrder || '', startDate: p.startDate?.slice(0, 10), endDate: p.endDate?.slice(0, 10), isActive: p.isActive, priority: p.priority || 0 }); setShowModal(true); }}>Edit</button>
                    <button className="quick-action-btn" style={{ padding: '6px 12px', fontSize: 12, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>No promotions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{editItem ? 'Edit Promotion' : 'Create Promotion'}</h3>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-form-group">
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Value</label>
                  <input type="number" step="0.01" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Minimum Order (optional)</label>
                <input type="number" step="0.01" min="0" value={form.minimumOrder} onChange={e => setForm({ ...form, minimumOrder: e.target.value })} />
              </div>
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

export default AdminPromotions;
