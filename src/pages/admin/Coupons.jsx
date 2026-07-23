import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader } from './components/PageHeader';
import { Modal } from './components/Modal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { EmptyState } from './components/EmptyState';
import { SkeletonTable } from './components/Skeletons';
import { motion } from 'framer-motion';

const CouponTypes = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'free_delivery', label: 'Free Delivery' },
];

function formatCurrency(amount) {
  return `GH₵${Number(amount).toFixed(2)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const emptyForm = {
  code: '',
  type: 'percentage',
  value: '',
  minimum_order: '',
  start_date: '',
  end_date: '',
  usage_limit: '',
  is_active: true,
};

export default function Coupons() {
  const { get, post, put, del, loading, error } = useApi();
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await get('/coupons');
        setCoupons(Array.isArray(result) ? result : result.coupons || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [get]);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value ?? '',
      minimum_order: coupon.minimum_order ?? '',
      start_date: coupon.start_date ? coupon.start_date.slice(0, 10) : '',
      end_date: coupon.end_date ? coupon.end_date.slice(0, 10) : '',
      usage_limit: coupon.usage_limit ?? '',
      is_active: coupon.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      code: form.code.toUpperCase(),
      value: form.type === 'free_delivery' ? 0 : Number(form.value),
      minimum_order: Number(form.minimum_order) || 0,
      usage_limit: Number(form.usage_limit) || 0,
    };
    try {
      if (editing) {
        await put(`/coupons/${editing.id}`, payload);
      } else {
        await post('/coupons', payload);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/coupons/${deleteTarget.id}`);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'percentage':
        return 'admin-badge admin-badge--primary';
      case 'fixed':
        return 'admin-badge admin-badge--success';
      case 'free_delivery':
        return 'admin-badge admin-badge--info';
      default:
        return 'admin-badge';
    }
  };

  const getTypeLabel = (type) => {
    return CouponTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Coupons"
        subtitle="Manage discount coupons for your store"
        action={{ label: 'Create Coupon', onClick: openCreate }}
      />

      {loading ? (
        <SkeletonTable rows={5} cols={8} />
      ) : error ? (
        <div className="admin-alert admin-alert--danger">{error}</div>
      ) : !coupons || coupons.length === 0 ? (
        <EmptyState
          title="No Coupons"
          message="You haven't created any coupons yet."
          action={{ label: 'Create Coupon', onClick: openCreate }}
        />
      ) : (
        <motion.div
          className="admin-table-wrapper"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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
                <tr key={coupon.id}>
                  <td>
                    <code className="admin-code-badge">{coupon.code}</code>
                  </td>
                  <td>
                    <span className={getTypeBadgeClass(coupon.type)}>
                      {getTypeLabel(coupon.type)}
                    </span>
                  </td>
                  <td>
                    {coupon.type === 'percentage'
                      ? `${coupon.value}%`
                      : coupon.type === 'fixed'
                      ? formatCurrency(coupon.value)
                      : '—'}
                  </td>
                  <td>
                    {coupon.minimum_order > 0
                      ? formatCurrency(coupon.minimum_order)
                      : '—'}
                  </td>
                  <td>
                    <span className="admin-usage-text">
                      {coupon.usage_count ?? 0}
                      {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}
                    </span>
                  </td>
                  <td>
                    <span className="admin-date-text">
                      {formatDate(coupon.start_date)}
                      {' — '}
                      {formatDate(coupon.end_date)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        coupon.is_active
                          ? 'admin-badge--success'
                          : 'admin-badge--secondary'
                      }`}
                    >
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-btn admin-btn--sm admin-btn--outline"
                        onClick={() => openEdit(coupon)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className="admin-btn admin-btn--sm admin-btn--danger-outline"
                        onClick={() => setDeleteTarget(coupon)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Coupon' : 'Create Coupon'}
      >
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="coupon-code">Code</label>
            <input
              id="coupon-code"
              type="text"
              className="admin-input admin-input--mono"
              placeholder="e.g. SUMMER20"
              value={form.code}
              onChange={(e) => setField('code', e.target.value.toUpperCase())}
              required
              autoFocus
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="coupon-type">Type</label>
              <select
                id="coupon-type"
                className="admin-select"
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
              >
                {CouponTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {form.type !== 'free_delivery' && (
              <div className="admin-form-group">
                <label htmlFor="coupon-value">
                  {form.type === 'percentage' ? 'Percentage (%)' : 'Amount'}
                </label>
                <input
                  id="coupon-value"
                  type="number"
                  className="admin-input"
                  min="0"
                  step={form.type === 'percentage' ? '1' : '0.01'}
                  placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 10.00'}
                  value={form.value}
                  onChange={(e) => setField('value', e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="coupon-min-order">Minimum Order</label>
            <input
              id="coupon-min-order"
              type="number"
              className="admin-input"
              min="0"
              step="0.01"
              placeholder="0 for no minimum"
              value={form.minimum_order}
              onChange={(e) => setField('minimum_order', e.target.value)}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="coupon-start">Start Date</label>
              <input
                id="coupon-start"
                type="date"
                className="admin-input"
                value={form.start_date}
                onChange={(e) => setField('start_date', e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="coupon-end">End Date</label>
              <input
                id="coupon-end"
                type="date"
                className="admin-input"
                value={form.end_date}
                onChange={(e) => setField('end_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="coupon-limit">Usage Limit</label>
            <input
              id="coupon-limit"
              type="number"
              className="admin-input"
              min="0"
              placeholder="0 for unlimited"
              value={form.usage_limit}
              onChange={(e) => setField('usage_limit', e.target.value)}
            />
          </div>

          <div className="admin-form-group admin-form-group--toggle">
            <label htmlFor="coupon-active">Active</label>
            <label className="admin-toggle">
              <input
                id="coupon-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setField('is_active', e.target.checked)}
              />
              <span className="admin-toggle-slider" />
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : editing ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={
          deleteTarget
            ? `Are you sure you want to delete coupon "${deleteTarget.code}"? This action cannot be undone.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        loading={deleting}
        danger
      />
    </div>
  );
}