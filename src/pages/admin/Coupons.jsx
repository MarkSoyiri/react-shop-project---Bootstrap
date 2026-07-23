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
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Coupons</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{coupons.length} coupons</p>
        </div>
        <button className="btn-premium" onClick={() => { resetForm(); setEditCoupon(null); setShowModal(true); }}>
          + Create Coupon
        </button>
      </div>

      <div className="admin-table-wrapper">
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
                <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 14 }}>{coupon.code}</td>
                <td style={{ textTransform: 'capitalize' }}>{coupon.type}</td>
                <td style={{ fontWeight: 600 }}>
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `GH₵${coupon.value}`}
                </td>
                <td>{coupon.minimumOrder ? `GH₵${coupon.minimumOrder}` : '—'}</td>
                <td>{coupon.usedCount || 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                <td style={{ fontSize: 13 }}>
                  {formatDate(coupon.startDate)} – {formatDate(coupon.endDate)}
                </td>
                <td>
                  <span className={`badge-status ${coupon.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                    {coupon.isActive ? '✓ Active' : '✕ Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="quick-action-btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => openEdit(coupon)}>
                      Edit
                    </button>
                    <button className="quick-action-btn" style={{ padding: '6px 12px', fontSize: 12, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDelete(coupon._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                  No coupons created yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
              padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
              {editCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </h3>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Code</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
                </div>
                <div className="admin-form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Value</label>
                  <input type="number" step="0.01" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label>Minimum Order</label>
                  <input type="number" step="0.01" min="0" value={form.minimumOrder} onChange={e => setForm({ ...form, minimumOrder: e.target.value })} />
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
                <label>Usage Limit (optional)</label>
                <input type="number" min="1" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn-premium-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-premium">{editCoupon ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;
