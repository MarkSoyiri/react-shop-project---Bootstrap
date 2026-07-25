import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import { PageHeader } from './components/PageHeader';
import { Pagination } from './components/Pagination';
import { Modal } from './components/Modal';
import { EmptyState } from './components/EmptyState';
import { SkeletonTable } from './components/Skeletons';
import { ConfirmDialog } from './components/ConfirmDialog';

const CATEGORIES = [
  { value: 'meals', label: 'Meals' },
  { value: 'burgers', label: 'Burgers' },
  { value: 'combos', label: 'Combos' },
  { value: 'sides', label: 'Sides' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'value-deals', label: 'Value Deals' },
  { value: 'promotions', label: 'Promotions' },
];

const INITIAL_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'meals',
  available: true,
  featured: false,
  image: null,
};

export default function Products() {
  const { get, post, put, del } = useApi();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await get(`/menu?${params.toString()}`);
      const items = response.data?.items || response.items || response.data || response;
      setProducts(Array.isArray(items) ? items : []);
      setTotalPages(response.data?.pagination?.pages || response.pagination?.pages || Math.ceil((response.data?.pagination?.total || response.pagination?.total || (Array.isArray(items) ? items.length : 0)) / itemsPerPage));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [get, currentPage, itemsPerPage, search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await get('/categories');
        const cats = response.data || response;
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setCategories(CATEGORIES);
      }
    };
    loadCategories();
  }, [get]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const categoryOptions = categories.length > 0
    ? categories.map(c => ({ value: c.slug || c.id, label: c.name }))
    : CATEGORIES;

  const openCreate = () => {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category || product.categoryId || 'meals',
      available: product.isAvailable ?? product.available ?? true,
      featured: product.featured ?? false,
      image: null,
    });
    setFormErrors({});
    setImagePreview(product.image || product.imageUrl || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setImagePreview(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      errors.price = 'Valid price is required';
    }
    if (!form.category) errors.category = 'Category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, image: 'Image must be under 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setForm(prev => ({ ...prev, image: file }));
      setFormErrors(prev => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        isAvailable: form.available,
        featured: form.featured,
      };

      if (form.image) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => formData.append(key, val));
        formData.append('image', form.image);

        if (editingProduct) {
          await put(`/menu/${editingProduct.id || editingProduct._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await post('/menu', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        if (editingProduct) {
          await put(`/menu/${editingProduct.id || editingProduct._id}`, payload);
        } else {
          await post('/menu', payload);
        }
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      const message = err.response?.data?.message || 'Failed to save product. Please try again.';
      setFormErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await put(`/menu/${product.id || product._id}`, {
        isAvailable: !product.isAvailable,
      });
      setProducts(prev =>
        prev.map(p =>
          (p.id || p._id) === (product.id || product._id)
            ? { ...p, isAvailable: !p.isAvailable }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const openDeleteConfirm = (product) => {
    setDeletingProduct(product);
    setConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmOpen(false);
    setDeletingProduct(null);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await del(`/menu/${deletingProduct.id || deletingProduct._id}`);
      closeDeleteConfirm();
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    return isNaN(num) ? 'GH₵0.00' : `GH₵${num.toFixed(2)}`;
  };

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.isAvailable ?? p.available ?? true).length;
    const inactive = total - active;
    const cats = new Set(products.map(p => p.category || p.categoryId).filter(Boolean)).size;
    return { total, active, inactive, cats };
  }, [products]);

  const statCards = [
    { label: 'Total Products', value: stats.total, icon: '📦', color: 'var(--admin-brand)', bg: 'rgba(232,93,4,0.08)' },
    { label: 'Active', value: stats.active, icon: '✅', color: 'var(--admin-success)', bg: 'rgba(34,197,94,0.08)' },
    { label: 'Inactive', value: stats.inactive, icon: '⏸️', color: 'var(--admin-danger)', bg: 'rgba(239,68,68,0.08)' },
    { label: 'Categories', value: stats.cats, icon: '🏷️', color: 'var(--admin-info, #3b82f6)', bg: 'rgba(59,130,246,0.08)' },
  ];

  return (
    <motion.div
      className="admin-products"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        actionLabel="Add Product"
        onAction={openCreate}
      />

      {/* ── Stats Cards ── */}
      <div className="admin-products__stats">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="admin-products__stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <div className="admin-products__stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="admin-products__stat-info">
              <span className="admin-products__stat-value">{s.value}</span>
              <span className="admin-products__stat-label">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="admin-products__toolbar">
        <div className="admin-products__search">
          <svg className="admin-products__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-products__search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="admin-products__search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>
        <div className="admin-products__filter">
          <svg className="admin-products__filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <select
            className="admin-products__filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonTable columns={5} rows={8} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No products found"
          description={
            search || categoryFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first product.'
          }
          actionLabel={!search && !categoryFilter ? 'Add Product' : undefined}
          onAction={!search && !categoryFilter ? openCreate : undefined}
        />
      ) : (
        <>
          <div className="admin-products__table-wrap">
            <table className="admin-products__table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="admin-products__th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <motion.tr
                    key={product.id || product._id}
                    className="admin-products__row"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                  >
                    <td>
                      <div className="admin-products__cell-product">
                        <div className="admin-products__cell-img">
                          {product.image || product.imageUrl ? (
                            <img src={product.image || product.imageUrl} alt={product.name} />
                          ) : (
                            <div className="admin-products__cell-img-placeholder">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="admin-products__cell-info">
                          <span className="admin-products__cell-name">{product.name}</span>
                          {product.featured && (
                            <span className="admin-products__badge admin-products__badge--featured">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-products__category-tag">
                        {categoryOptions.find(c => c.value === (product.category || product.categoryId))?.label || product.category}
                      </span>
                    </td>
                    <td className="admin-products__cell-price">
                      {formatPrice(product.price)}
                    </td>
                    <td>
                      <label className="admin-products__toggle">
                        <input
                          type="checkbox"
                          checked={product.isAvailable ?? product.available ?? true}
                          onChange={() => handleToggleStatus(product)}
                        />
                        <span className="admin-products__toggle-track" />
                      </label>
                    </td>
                    <td>
                      <div className="admin-products__actions">
                        <button
                          className="admin-products__action-btn admin-products__action-btn--edit"
                          onClick={() => openEdit(product)}
                          title="Edit"
                          aria-label={`Edit ${product.name}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="admin-products__action-btn admin-products__action-btn--delete"
                          onClick={() => openDeleteConfirm(product)}
                          title="Delete"
                          aria-label={`Delete ${product.name}`}
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

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        wide
      >
        <form className="admin-products__form" onSubmit={handleSubmit}>
          {formErrors.submit && (
            <div className="admin-alert admin-alert--danger">
              <i className="fas fa-exclamation-circle" />
              <span>{formErrors.submit}</span>
            </div>
          )}

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="product-name">
              Name <span className="text-danger">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              className={`admin-form-input ${formErrors.name ? 'admin-form-input--error' : ''}`}
              placeholder="Product name"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              maxLength={100}
            />
            {formErrors.name && (
              <span className="admin-form-hint" style={{ color: 'var(--admin-danger)' }}>{formErrors.name}</span>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="product-description">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="product-description"
              className={`admin-form-textarea ${formErrors.description ? 'admin-form-textarea--error' : ''}`}
              placeholder="Product description"
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
              maxLength={500}
            />
            {formErrors.description && (
              <span className="admin-form-hint" style={{ color: 'var(--admin-danger)' }}>{formErrors.description}</span>
            )}
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="product-price">
                Price <span className="text-danger">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                className={`admin-form-input ${formErrors.price ? 'admin-form-input--error' : ''}`}
                placeholder="0.00"
                value={form.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                min="0"
                step="0.01"
              />
              {formErrors.price && (
                <span className="admin-form-hint" style={{ color: 'var(--admin-danger)' }}>{formErrors.price}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="product-category">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="product-category"
                className={`admin-form-select ${formErrors.category ? 'admin-form-select--error' : ''}`}
                value={form.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <span className="admin-form-hint" style={{ color: 'var(--admin-danger)' }}>{formErrors.category}</span>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Image</label>
            <div className="admin-products__upload">
              {imagePreview ? (
                <div className="admin-products__image-preview">
                  <img src={imagePreview} alt="Preview" className="admin-products__upload-preview" />
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-ghost"
                    onClick={() => {
                      setImagePreview(null);
                      setForm(prev => ({ ...prev, image: null }));
                    }}
                    aria-label="Remove image"
                  >
                    <i className="fas fa-times" /> Remove
                  </button>
                </div>
              ) : (
                <label className="admin-products__upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="admin-products__file-input"
                    style={{ display: 'none' }}
                  />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--admin-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="admin-form-text">Click to upload an image</span>
                  <span className="admin-form-hint">PNG, JPG up to 5MB</span>
                </label>
              )}
            </div>
            {formErrors.image && (
              <span className="admin-form-hint" style={{ color: 'var(--admin-danger)' }}>{formErrors.image}</span>
            )}
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => handleFormChange('available', e.target.checked)}
                />
                <span className="admin-toggle-slider" />
              </label>
              <span className="admin-form-text">Available</span>
            </div>
            <div className="admin-form-group">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => handleFormChange('featured', e.target.checked)}
                />
                <span className="admin-toggle-slider" />
              </label>
              <span className="admin-form-text">Featured</span>
            </div>
          </div>

          <div className="admin-modal-footer" style={{ padding: 0, border: 'none', paddingTop: 8 }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  <span>{editingProduct ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        type="danger"
      />
    </motion.div>
  );
}
