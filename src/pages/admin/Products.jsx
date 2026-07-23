import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
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

      const response = await get(`/products?${params.toString()}`);
      setProducts(response.data.products || response.data);
      setTotalPages(response.data.totalPages || Math.ceil((response.data.total || response.data.length) / itemsPerPage));
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
        setCategories(response.data);
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
      available: product.available ?? product.status ?? true,
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
        available: form.available,
        featured: form.featured,
      };

      if (form.image) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => formData.append(key, val));
        formData.append('image', form.image);

        if (editingProduct) {
          await put(`/products/${editingProduct.id || editingProduct._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        if (editingProduct) {
          await put(`/products/${editingProduct.id || editingProduct._id}`, payload);
        } else {
          await post('/products', payload);
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
      await put(`/products/${product.id || product._id}`, {
        available: !product.available,
      });
      setProducts(prev =>
        prev.map(p =>
          (p.id || p._id) === (product.id || product._id)
            ? { ...p, available: !p.available }
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
      await del(`/products/${deletingProduct.id || deletingProduct._id}`);
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
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

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

      <div className="admin-products__filters">
        <div className="admin-products__search">
          <span className="admin-products__search-icon">
            <i className="fas fa-search" />
          </span>
          <input
            type="text"
            className="admin-products__search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="admin-products__search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <i className="fas fa-times" />
            </button>
          )}
        </div>
        <div className="admin-products__category-filter">
          <select
            className="admin-products__category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonTable columns={5} rows={8} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="fa-box-open"
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
          <div className="admin-products__table-wrapper">
            <table className="admin-products__table">
              <thead>
                <tr>
                  <th className="admin-products__th">Product</th>
                  <th className="admin-products__th">Category</th>
                  <th className="admin-products__th">Price</th>
                  <th className="admin-products__th">Status</th>
                  <th className="admin-products__th admin-products__th--actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id || product._id} className="admin-products__row">
                    <td className="admin-products__cell admin-products__cell--product">
                      <div className="admin-products__product-info">
                        <div className="admin-products__product-image-wrapper">
                          {product.image || product.imageUrl ? (
                            <img
                              src={product.image || product.imageUrl}
                              alt={product.name}
                              className="admin-products__product-image"
                            />
                          ) : (
                            <div className="admin-products__product-image-placeholder">
                              <i className="fas fa-image" />
                            </div>
                          )}
                        </div>
                        <div className="admin-products__product-details">
                          <span className="admin-products__product-name">{product.name}</span>
                          {product.featured && (
                            <span className="admin-products__badge admin-products__badge--featured">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="admin-products__cell">
                      <span className="admin-products__category-tag">
                        {categoryOptions.find(c => c.value === (product.category || product.categoryId))?.label || product.category}
                      </span>
                    </td>
                    <td className="admin-products__cell admin-products__cell--price">
                      {formatPrice(product.price)}
                    </td>
                    <td className="admin-products__cell admin-products__cell--status">
                      <label className="admin-products__toggle">
                        <input
                          type="checkbox"
                          checked={product.available ?? product.status ?? true}
                          onChange={() => handleToggleStatus(product)}
                          className="admin-products__toggle-input"
                        />
                        <span className="admin-products__toggle-slider" />
                      </label>
                    </td>
                    <td className="admin-products__cell admin-products__cell--actions">
                      <div className="admin-products__actions">
                        <button
                          className="admin-products__action-btn admin-products__action-btn--edit"
                          onClick={() => openEdit(product)}
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <i className="fas fa-pen" />
                        </button>
                        <button
                          className="admin-products__action-btn admin-products__action-btn--delete"
                          onClick={() => openDeleteConfirm(product)}
                          title="Delete product"
                          aria-label={`Delete ${product.name}`}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
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
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="md"
      >
        <form className="admin-products__form" onSubmit={handleSubmit}>
          {formErrors.submit && (
            <div className="admin-products__form-error">
              <i className="fas fa-exclamation-circle" />
              <span>{formErrors.submit}</span>
            </div>
          )}

          <div className="admin-products__form-group">
            <label className="admin-products__label" htmlFor="product-name">
              Name <span className="admin-products__required">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              className={`admin-products__input ${formErrors.name ? 'admin-products__input--error' : ''}`}
              placeholder="Product name"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              maxLength={100}
            />
            {formErrors.name && (
              <span className="admin-products__field-error">{formErrors.name}</span>
            )}
          </div>

          <div className="admin-products__form-group">
            <label className="admin-products__label" htmlFor="product-description">
              Description <span className="admin-products__required">*</span>
            </label>
            <textarea
              id="product-description"
              className={`admin-products__textarea ${formErrors.description ? 'admin-products__textarea--error' : ''}`}
              placeholder="Product description"
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
              maxLength={500}
            />
            {formErrors.description && (
              <span className="admin-products__field-error">{formErrors.description}</span>
            )}
          </div>

          <div className="admin-products__form-row">
            <div className="admin-products__form-group admin-products__form-group--half">
              <label className="admin-products__label" htmlFor="product-price">
                Price <span className="admin-products__required">*</span>
              </label>
              <div className="admin-products__input-wrapper">
                <span className="admin-products__input-prefix">$</span>
                <input
                  id="product-price"
                  type="number"
                  className={`admin-products__input admin-products__input--prefixed ${formErrors.price ? 'admin-products__input--error' : ''}`}
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              {formErrors.price && (
                <span className="admin-products__field-error">{formErrors.price}</span>
              )}
            </div>

            <div className="admin-products__form-group admin-products__form-group--half">
              <label className="admin-products__label" htmlFor="product-category">
                Category <span className="admin-products__required">*</span>
              </label>
              <select
                id="product-category"
                className={`admin-products__select ${formErrors.category ? 'admin-products__select--error' : ''}`}
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
                <span className="admin-products__field-error">{formErrors.category}</span>
              )}
            </div>
          </div>

          <div className="admin-products__form-group">
            <label className="admin-products__label">Image</label>
            <div className="admin-products__image-upload">
              {imagePreview ? (
                <div className="admin-products__image-preview">
                  <img src={imagePreview} alt="Preview" className="admin-products__preview-img" />
                  <button
                    type="button"
                    className="admin-products__image-remove"
                    onClick={() => {
                      setImagePreview(null);
                      setForm(prev => ({ ...prev, image: null }));
                    }}
                    aria-label="Remove image"
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>
              ) : (
                <label className="admin-products__upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="admin-products__file-input"
                  />
                  <i className="fas fa-cloud-upload-alt admin-products__upload-icon" />
                  <span className="admin-products__upload-text">Click to upload an image</span>
                  <span className="admin-products__upload-hint">PNG, JPG up to 5MB</span>
                </label>
              )}
            </div>
            {formErrors.image && (
              <span className="admin-products__field-error">{formErrors.image}</span>
            )}
          </div>

          <div className="admin-products__form-row">
            <div className="admin-products__form-group admin-products__form-group--half">
              <div className="admin-products__switch-group">
                <label className="admin-products__toggle">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => handleFormChange('available', e.target.checked)}
                    className="admin-products__toggle-input"
                  />
                  <span className="admin-products__toggle-slider" />
                </label>
                <span className="admin-products__switch-label">Available</span>
              </div>
            </div>
            <div className="admin-products__form-group admin-products__form-group--half">
              <div className="admin-products__switch-group">
                <label className="admin-products__toggle">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => handleFormChange('featured', e.target.checked)}
                    className="admin-products__toggle-input"
                  />
                  <span className="admin-products__toggle-slider" />
                </label>
                <span className="admin-products__switch-label">Featured</span>
              </div>
            </div>
          </div>

          <div className="admin-products__form-actions">
            <button
              type="button"
              className="admin-products__btn admin-products__btn--secondary"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-products__btn admin-products__btn--primary"
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
        isOpen={confirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        variant="danger"
      />
    </motion.div>
  );
}