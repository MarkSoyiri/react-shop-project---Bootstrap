import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { PageHeader } from './components/PageHeader';
import { Pagination } from './components/Pagination';
import { ConfirmDialog } from './components/ConfirmDialog';
import { EmptyState } from './components/EmptyState';
import { SkeletonTable } from './components/Skeletons';

const REVIEWS_PER_PAGE = 8;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const renderStars = (rating) => {
  return (
    <span className="admin-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? 'admin-star-filled' : 'admin-star-empty'}>
          {i <= rating ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

export default function Reviews() {
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { get, patch, del, loading } = useApi();
  const [reviews, setReviews] = useState([]);
  const [patching, setPatching] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = async () => {
    try {
      const result = await get('/menu/reviews/all?includeHidden=true');
      const reviewData = result.data || result;
      setReviews(Array.isArray(reviewData) ? reviewData : reviewData?.reviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [get]);

  const filtered = useMemo(() => {
    if (!reviews) return [];
    let list = [...reviews];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.customerName?.toLowerCase().includes(q) ||
          r.productName?.toLowerCase().includes(q)
      );
    }
    if (ratingFilter > 0) {
      list = list.filter((r) => r.rating === ratingFilter);
    }
    return list;
  }, [reviews, search, ratingFilter]);

  const totalPages = Math.ceil(filtered.length / REVIEWS_PER_PAGE);
  const paged = useMemo(
    () => filtered.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE),
    [filtered, page]
  );

  const handleToggleVisibility = useCallback(
    async (review) => {
      setPatching(true);
      try {
        await patch(`/menu/reviews/${review._id}`, { visible: !review.visible });
        await fetchReviews();
      } finally {
        setPatching(false);
      }
    },
    [patch]
  );

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setDeleting(true);
    del(`/menu/reviews/${deleteTarget._id}`).then(() => {
      setDeleteTarget(null);
      fetchReviews();
    }).finally(() => {
      setDeleting(false);
    });
  }, [deleteTarget, del]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRatingChange = (val) => {
    setRatingFilter(val);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <PageHeader title="Reviews" />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <PageHeader title="Reviews" />

      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search by customer or product..."
          value={search}
          onChange={handleSearchChange}
        />
        <div className="admin-filter-group">
          {[0, 5, 4, 3, 2, 1].map((val) => (
            <button
              key={val}
              className={`admin-filter-btn${ratingFilter === val ? ' admin-filter-btn-active' : ''}`}
              onClick={() => handleRatingChange(val)}
            >
              {val === 0 ? 'All' : `${val}★`}
            </button>
          ))}
        </div>
      </div>

      {paged.length === 0 ? (
        <EmptyState message="No reviews yet" />
      ) : (
        <>
          <motion.div
            className="admin-reviews-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={page}
          >
            {paged.map((review) => (
              <motion.div
                key={review._id}
                className={`admin-review-card${review.visible ? '' : ' admin-review-hidden'}`}
                variants={cardVariants}
              >
                <div className="admin-review-header">
                  <div className="admin-review-avatar">{getInitial(review.customerName)}</div>
                  <div className="admin-review-meta">
                    <span className="admin-review-customer">{review.customerName}</span>
                    <span className="admin-review-rating">{renderStars(review.rating)}</span>
                  </div>
                  <span
                    className={`admin-review-status${review.visible ? ' admin-review-status-visible' : ' admin-review-status-hidden'}`}
                  >
                    {review.visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                <p className="admin-review-product">on {review.productName}</p>
                <p className="admin-review-comment">{review.comment}</p>
                <p className="admin-review-date">{formatDate(review.date)}</p>

                <div className="admin-review-actions">
                  <button
                    className="admin-btn admin-btn-sm admin-btn-outline"
                    disabled={patching}
                    onClick={() => handleToggleVisibility(review)}
                  >
                    {review.visible ? 'Hide' : 'Show'}
                  </button>
                  <button
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => setDeleteTarget(review)}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Review"
        message={`Are you sure you want to delete this review by ${deleteTarget?.customerName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
