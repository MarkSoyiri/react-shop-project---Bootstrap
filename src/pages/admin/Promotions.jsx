import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { PageHeader } from './components/PageHeader';
import { Modal } from './components/Modal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { EmptyState } from './components/EmptyState';
import { SkeletonTable } from './components/Skeletons';

const initialForm = {
  title: '',
  description: '',
  type: 'percentage',
  value: '',
  startDate: '',
  endDate: '',
  minimumOrder: '',
  active: true,
  priority: 0,
};

const typeColors = {
  percentage: 'bg-primary',
  fixed: 'bg-success',
  free_delivery: 'bg-info',
};

const typeLabels = {
  percentage: 'Percentage',
  fixed: 'Fixed Amount',
  free_delivery: 'Free Delivery',
};

export default function Promotions() {
  const { get, post, put, del, loading, error } = useApi();
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPromotions = async () => {
    try {
      const result = await get('/promotions');
      const promoData = result.data || result;
      setPromotions(Array.isArray(promoData) ? promoData : promoData?.promotions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [get]);

  useEffect(() => {
    if (editingPromo) {
      setForm({
        title: editingPromo.title || '',
        description: editingPromo.description || '',
        type: editingPromo.type || 'percentage',
        value: editingPromo.value ?? '',
        startDate: editingPromo.startDate ? editingPromo.startDate.slice(0, 10) : '',
        endDate: editingPromo.endDate ? editingPromo.endDate.slice(0, 10) : '',
        minimumOrder: editingPromo.minimumOrder ?? '',
        active: editingPromo.active ?? true,
        priority: editingPromo.priority ?? 0,
      });
    } else {
      setForm(initialForm);
    }
  }, [editingPromo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openCreate = () => {
    setEditingPromo(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (promo) => {
    setEditingPromo(promo);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: form.type === 'free_delivery' ? 0 : Number(form.value),
        minimumOrder: Number(form.minimumOrder) || 0,
        priority: Number(form.priority) || 0,
      };

      if (editingPromo) {
        await put(`/promotions/${editingPromo.id}`, payload);
      } else {
        await post('/promotions', payload);
      }
      setShowModal(false);
      fetchPromotions();
    } catch (err) {
      console.error('Failed to save promotion:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del(`/promotions/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchPromotions();
    } catch (err) {
      console.error('Failed to delete promotion:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (val) => `GH₵${Number(val).toFixed(2)}`;

  const renderValue = (promo) => {
    if (promo.type === 'free_delivery') return '—';
    if (promo.type === 'percentage') return `${promo.value}%`;
    return formatCurrency(promo.value);
  };

  if (loading) return <SkeletonTable rows={5} cols={7} />;

  if (error) {
    return (
      <div className="admin-alert admin-alert-danger">
        Failed to load promotions. <button className="admin-btn admin-btn-sm" onClick={fetchPromotions}>Retry</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="admin-promotions"
    >
      <PageHeader
        title="Promotions"
        actionLabel="Add Promotion"
        onAction={openCreate}
      />

      {!promotions || promotions.length === 0 ? (
        <EmptyState message="No promotions found." />
      ) : (
        <div className="admin-card">
          <div className="admin-table-responsive">
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
                {promotions.map((promo) => (
                  <tr key={promo.id}>
                    <td className="admin-fw-semibold">{promo.title}</td>
                    <td>
                      <span className={`admin-badge ${typeColors[promo.type] || 'bg-secondary'}`}>
                        {typeLabels[promo.type] || promo.type}
                      </span>
                    </td>
                    <td>{renderValue(promo)}</td>
                    <td>
                      {formatDate(promo.startDate)} — {formatDate(promo.endDate)}
                    </td>
                    <td>{promo.usedCount ?? 0}</td>
                    <td>
                      <span className={`admin-badge ${promo.active ? 'bg-success' : 'bg-secondary'}`}>
                        {promo.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn admin-btn-sm admin-btn-outline"
                          onClick={() => openEdit(promo)}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn-sm admin-btn-danger-outline"
                          onClick={() => setDeleteTarget(promo)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingPromo ? 'Edit Promotion' : 'Create Promotion'}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              className="admin-input"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Description</label>
            <textarea
              name="description"
              className="admin-input admin-textarea"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Type</label>
              <select
                name="type"
                className="admin-select"
                value={form.type}
                onChange={handleChange}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>

            {form.type !== 'free_delivery' && (
              <div className="admin-form-group">
                <label>Value</label>
                <input
                  type="number"
                  name="value"
                  className="admin-input"
                  value={form.value}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            )}
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                className="admin-input"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                className="admin-input"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Minimum Order</label>
              <input
                type="number"
                name="minimumOrder"
                className="admin-input"
                value={form.minimumOrder}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
            <div className="admin-form-group">
              <label>Priority</label>
              <input
                type="number"
                name="priority"
                className="admin-input"
                value={form.priority}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-toggle-label">
              <input
                type="checkbox"
                name="active"
                className="admin-toggle-input"
                checked={form.active}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingPromo ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        show={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Promotion"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </motion.div>
  );
}