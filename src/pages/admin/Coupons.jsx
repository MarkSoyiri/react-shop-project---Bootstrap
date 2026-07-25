import { useState, useEffect, useCallback, useMemo } from 'react';
import useApi from '../../hooks/useApi';
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

function mapToFrontend(c) {
  return {
    ...c,
    _id: c._id || c.id,
    code: c.code || '',
    type: c.type || 'percentage',
    value: c.value ?? '',
    minimum_order: c.minOrder ?? c.minimum_order ?? '',
    start_date: (c.validFrom || c.start_date || '').slice(0, 10),
    end_date: (c.validUntil || c.end_date || '').slice(0, 10),
    usage_limit: c.usageLimit ?? c.usage_limit ?? '',
    usage_count: c.usedCount ?? c.usage_count ?? 0,
    is_active: c.isActive ?? c.is_active ?? true,
  };
}

function mapToBackend(form) {
  return {
    code: form.code.toUpperCase(),
    type: form.type,
    value: form.type === 'free_delivery' ? 0 : Number(form.value),
    minOrder: Number(form.minimum_order) || 0,
    usageLimit: Number(form.usage_limit) || 0,
    validFrom: form.start_date || undefined,
    validUntil: form.end_date || undefined,
    isActive: form.is_active,
  };
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
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      const result = await get('/coupons');
      const couponData = result.data || result;
      const raw = Array.isArray(couponData) ? couponData : couponData?.coupons || [];
      setCoupons(raw.map(mapToFrontend));
    } catch (err) {
      console.error(err);
    }
  }, [get]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (formErrors[key]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
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
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.code.trim()) errors.code = 'Code is required';
    if (!form.start_date) errors.start_date = 'Start date is required';
    if (!form.end_date) errors.end_date = 'End date is required';
    if (form.type !== 'free_delivery' && (!form.value || Number(form.value) <= 0)) {
      errors.value = 'Value is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    const payload = mapToBackend(form);
    try {
      if (editing) {
        await put(`/coupons/${editing._id || editing.id}`, payload);
      } else {
        await post('/coupons', payload);
      }
      setShowModal(false);
      await fetchCoupons();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to save coupon. Please try again.';
      setFormErrors({ submit: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/coupons/${deleteTarget._id || deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchCoupons();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.is_active).length;
    const inactive = total - active;
    const totalUsage = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);
    return { total, active, inactive, totalUsage };
  }, [coupons]);

  const statCards = [
    { label: 'Total Coupons', value: stats.total, icon: '🏷️', color: 'var(--admin-brand)', bg: 'rgba(232,93,4,0.08)' },
    { label: 'Active', value: stats.active, icon: '✅', color: 'var(--admin-success)', bg: 'rgba(34,197,94,0.08)' },
    { label: 'Inactive', value: stats.inactive, icon: '⏸️', color: 'var(--admin-danger)', bg: 'rgba(239,68,68,0.08)' },
    { label: 'Total Usage', value: stats.totalUsage, icon: '📊', color: 'var(--admin-info, #3b82f6)', bg: 'rgba(59,130,246,0.08)' },
  ];

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'percentage': return 'admin-badge admin-badge--primary';
      case 'fixed': return 'admin-badge admin-badge--success';
      case 'free_delivery': return 'admin-badge admin-badge--info';
      default: return 'admin-badge';
    }
  };

  const getTypeLabel = (type) => {
    return CouponTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <motion.div
      className="admin-coupons-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Coupons"
        subtitle="Manage discount coupons for your store"
        actionLabel="Create Coupon"
        onAction={openCreate}
      />

      {/* ── Stats Cards ── */}
      <div className="admin-coupons__stats">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="admin-coupons__stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <div className="admin-coupons__stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="admin-coupons__stat-info">
              <span className="admin-coupons__stat-value">{s.value}</span>
              <span className="admin-coupons__stat-label">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <SkeletonTable rows={5} columns={8} />
      ) : error ? (
        <div className="admin-alert admin-alert--danger">{error}</div>
      ) : !coupons || coupons.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No Coupons"
          description="You haven't created any coupons yet."
          actionLabel="Create Coupon"
          onAction={openCreate}
        />
      ) : (
        <div className="admin-coupons__table-wrap">
          <table className="admin-coupons__table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min. Order</th>
                <th>Usage</th>
                <th>Valid Period</th>
                <th>Status</th>
                <th className="admin-coupons__th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon, idx) => (
                <motion.tr
                  key={coupon._id || coupon.id}
                  className="admin-coupons__row"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                >
                  <td>
                    <code className="admin-coupons__code">{coupon.code}</code>
                  </td>
                  <td>
                    <span className={getTypeBadgeClass(coupon.type)}>
                      {getTypeLabel(coupon.type)}
                    </span>
                  </td>
                  <td className="admin-coupons__cell-value">
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
                  <td className="admin-coupons__cell-usage">
                    {coupon.usage_count ?? 0}
                    {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}
                  </td>
                  <td className="admin-coupons__cell-date">
                    {formatDate(coupon.start_date)}
                    {' — '}
                    {formatDate(coupon.end_date)}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        coupon.is_active
                          ? 'admin-badge--success'
                          : 'admin-badge--secondary'
                      }`}
                    >
                      <span className="admin-badge-dot" />
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="admin-coupons__td-actions">
                    <div className="admin-coupons__actions">
                      <button
                        className="admin-coupons__action-btn admin-coupons__action-btn--edit"
                        onClick={() => openEdit(coupon)}
                        title="Edit"
                        aria-label={`Edit ${coupon.code}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="admin-coupons__action-btn admin-coupons__action-btn--delete"
                        onClick={() => setDeleteTarget(coupon)}
                        title="Delete"
                        aria-label={`Delete ${coupon.code}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Coupon' : 'Create Coupon'}
      >
        <form className="admin-coupons__form" onSubmit={handleSubmit}>
          {formErrors.submit && (
            <div className="admin-alert admin-alert--danger">
              <span>{formErrors.submit}</span>
            </div>
          )}

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="coupon-code">
              Code <span className="text-danger">*</span>
            </label>
            <input
              id="coupon-code"
              type="text"
              className={`admin-form-input admin-input--mono ${formErrors.code ? 'admin-form-input--error' : ''}`}
              placeholder="e.g. SUMMER20"
              value={form.code}
              onChange={(e) => setField('code', e.target.value.toUpperCase())}
              autoFocus
              maxLength={20}
            />
            {formErrors.code && (
              <span className="admin-form-hint" style={{ color: 'var(--admin-danger)' }}>{formErrors.code}</span>
            )}
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="coupon-type">
                Type <span className="text-danger">*</span>
              </label>
              <select
                id="coupon-type"
                className="admin-form-select"
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
              >
                {CouponTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {form.type !== 'free_delivery' && (
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="coupon-value">
                  {form.type === 'percentage' ? 'Percentage (%)' : 'Amount'} <span className="text-danger">*</span>
                </label>
                <input
                  id="coupon-value"
                  type="number"
                  className={`admin-form-input ${formErrors.value ? 'admin-form-input--error' : ''}`}
                  min="0"
                  step={form.type === 'percentage' ? '1' : '0.01'}
                  placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 10.00'}
                  value={form.value}
                  onChange={(e) => setField('value', e.target.value)}
                />
                {formErrors.value && (
                  <span className="admin-form-hint" style={{ color: 'var(--admin-danger)' }}>{formErrors.value}</span>
                )}
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="coupon-min-order">Minimum Order</label>
            <input
              id="coupon-min-order"
              type="number"
              className="admin-form-input"
              min="0"
              step="0.01"
              placeholder="0 for no minimum"
              value={form.minimum_order}
              onChange={(e) => setField('minimum_order', e.target.value)}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="coupon-start">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                id="coupon-start"
                type="date"
                className={`admin-form-input ${formErrors.start_date ? 'admin-form-input--error' : ''}`}
                value={form.start_date}
                onChange={(e) => setField('start_date', e.target.value)}
              />
              {formErrors.start_date && (
                <span className="admin-form-hint" style={{ color: 'var(--admin-danger)' }}>{formErrors.start_date}</span>
              )}
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="coupon-end">
                End Date <span className="text-danger">*</span>
              </label>
              <input
                id="coupon-end"
                type="date"
                className={`admin-form-input ${formErrors.end_date ? 'admin-form-input--error' : ''}`}
                value={form.end_date}
                onChange={(e) => setField('end_date', e.target.value)}
              />
              {formErrors.end_date && (
                <span className="admin-form-hint" style={{ color: 'var(--admin-danger)' }}>{formErrors.end_date}</span>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="coupon-limit">Usage Limit</label>
            <input
              id="coupon-limit"
              type="number"
              className="admin-form-input"
              min="0"
              placeholder="0 for unlimited"
              value={form.usage_limit}
              onChange={(e) => setField('usage_limit', e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Active</label>
            <div className="d-flex align-items-center gap-3">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setField('is_active', e.target.checked)}
                />
                <span className="admin-toggle-slider" />
              </label>
              <span className="admin-form-text">Enabled</span>
            </div>
          </div>

          <div className="admin-modal-footer" style={{ padding: 0, border: 'none', paddingTop: 8 }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editing ? 'Update Coupon' : 'Create Coupon'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
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
        type="danger"
      />
    </motion.div>
  );
}
