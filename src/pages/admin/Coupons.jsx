import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { formatDate } from '../../utils/helpers';
import { SkeletonTable } from '../../components/ui/Skeleton';

function AdminCoupons() {
  const { get, post, put, del, loading } = useApi();
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '',
    minimumOrder: '', usageLimit: '',
    startDate: '', endDate: '', isActive: true,
  });

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    try {
      const res = await get('/coupons');
      setCoupons(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, value: parseFloat(form.value) };
      if (form.minimumOrder) data.minimumOrder = parseFloat(form.minimumOrder);
      if (form.usageLimit) data.usageLimit = parseInt(form.usageLimit);

      if (editCoupon) {
        await put(`/coupons/${editCoupon._id}`, data);
      } else {
        await post('/coupons', data);
      }
      setShowModal(false);
      setEditCoupon(null);
      resetForm();
      loadCoupons();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await del(`/coupons/${id}`); loadCoupons(); } catch (err) { alert(err.message); }
  };

  const resetForm = () => {
    setForm({
      code: '', type: 'percentage', value: '',
      minimumOrder: '', usageLimit: '',
      startDate: '', endDate: '', isActive: true,
    });
  };

  const openEdit = (coupon) => {
    setEditCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minimumOrder: coupon.minimumOrder || '',
      usageLimit: coupon.usageLimit || '',
      startDate: coupon.startDate?.slice(0, 10) || '',
      endDate: coupon.endDate?.slice(0, 10) || '',
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  if (loading && coupons.length === 0) return <SkeletonTable rows={5} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Coupons</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>{coupons.length} coupons</p>
        </div>
        <button onClick={() => { resetForm(); setEditCoupon(null); setShowModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'linear-gradient(135deg, #e85d04, #f48c06)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,93,4,0.3)',
          }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Coupon
        </button>
      </div>

      <div className="admin-table-wrapper" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min. Order</th>
              <th>Usage</th>
              <th>Valid Period</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, padding: '4px 10px', borderRadius: 6, background: '#f3f4f6', color: '#111827' }}>
                    {coupon.code}
                  </span>
                </td>
                <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{coupon.type}</td>
                <td style={{ fontWeight: 700 }}>
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `GH₵${coupon.value}`}
                </td>
                <td style={{ fontSize: 13 }}>{coupon.minimumOrder ? `GH₵${coupon.minimumOrder}` : '—'}</td>
                <td style={{ fontSize: 13 }}>{coupon.usedCount || 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                <td style={{ fontSize: 12, color: '#6b7280' }}>
                  {formatDate(coupon.startDate)} – {formatDate(coupon.endDate)}
                </td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: coupon.isActive ? '#dcfce7' : '#fee2e2', color: coupon.isActive ? '#166534' : '#991b1b',
                  }}>
                    {coupon.isActive ? '✓ Active' : '✕ Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(coupon)} style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(coupon._id)} style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, border: '1.5px solid #fecaca', borderRadius: 8, background: '#fff', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>No coupons created yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24, backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>✕</button>
            </div>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Code</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa', fontFamily: 'monospace', fontWeight: 700 }} />
                </div>
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Value</label>
                  <input type="number" step="0.01" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
                </div>
                <div className="admin-form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Minimum Order</label>
                  <input type="number" step="0.01" min="0" value={form.minimumOrder} onChange={e => setForm({ ...form, minimumOrder: e.target.value })} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
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
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Usage Limit (optional)</label>
                <input type="number" min="1" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fafafa' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '8px 14px', borderRadius: 8, background: form.isActive ? 'rgba(232,93,4,0.08)' : '#f3f4f6', color: form.isActive ? '#e85d04' : '#6b7280', fontWeight: 600 }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ accentColor: '#e85d04' }} /> Active
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e85d04, #f48c06)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,93,4,0.3)' }}>{editCoupon ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;
