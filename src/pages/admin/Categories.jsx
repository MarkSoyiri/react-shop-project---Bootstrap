import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import { PageHeader } from './components/PageHeader';
import { Modal } from './components/Modal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { EmptyState } from './components/EmptyState';
import { SkeletonTable } from './components/Skeletons';

const emptyCategory = {
  name: '',
  description: '',
  sortOrder: 0,
  active: true,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Categories() {
  const { get, post, put, del, loading: apiLoading } = useApi();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyCategory });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await get('/categories?includeInactive=true');
      setCategories(data.data || data || []);
    } catch {
      // error handled by useApi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyCategory });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      sortOrder: cat.sortOrder || 0,
      active: cat.active !== false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await put(`/categories/${editing._id}`, form);
      } else {
        await post('/categories', form);
      }
      setShowModal(false);
      fetchCategories();
    } catch {
      // error handled by useApi
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await del(`/categories/${confirmDelete._id}`);
      setConfirmDelete(null);
      fetchCategories();
    } catch {
      // error handled by useApi
    }
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Categories"
        subtitle="Organize your products"
        actionLabel="Add Category"
        onAction={openCreate}
      />

      {loading ? (
        <SkeletonTable rows={6} cols={4} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon="fa-folder-open"
          title="No categories found"
          description="Create your first category to organize products."
          actionLabel="Create Category"
          onAction={openCreate}
        />
      ) : (
        <motion.div
          className="admin-grid-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              className="admin-card"
              variants={cardVariants}
            >
              <div className="admin-card-body">
                <div className="admin-card-icon">
                  <span className="admin-category-emoji">
                    {cat.icon || '📁'}
                  </span>
                </div>
                <h3 className="admin-card-title">{cat.name}</h3>
                <p className="admin-card-text">
                  {cat.description || 'No description'}
                </p>
                <span className="admin-badge admin-badge--secondary">
                  {cat.productCount ?? cat.products?.length ?? 0} items
                </span>
                <div className={`admin-badge ${cat.active !== false ? 'admin-badge--success' : 'admin-badge--secondary'}`} style={{ marginLeft: 8 }}>
                  {cat.active !== false ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="admin-card-footer">
                <button
                  className="admin-btn admin-btn-sm admin-btn-outline"
                  onClick={() => openEdit(cat)}
                >
                  Edit
                </button>
                <button
                  className="admin-btn admin-btn-sm admin-btn-danger-outline"
                  onClick={() => setConfirmDelete(cat)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Category' : 'Create Category'}
      >
        <div className="admin-form">
          <div className="admin-form-group">
            <label className="admin-form-label">Name</label>
            <input
              className="admin-form-input"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category name"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description</label>
            <textarea
              className="admin-form-textarea"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Short description"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Sort Order</label>
            <input
              className="admin-form-input"
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) })
              }
            />
          </div>

          <div className="admin-form-group">
            <div className="d-flex align-items-center gap-3">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                />
                <span className="admin-toggle-slider" />
              </label>
              <span className="admin-form-text">Active</span>
            </div>
          </div>

          <div className="admin-modal-footer" style={{ padding: 0, border: 'none', paddingTop: 8 }}>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        show={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${confirmDelete?.name}"?`}
        type="danger"
      />
    </div>
  );
}
