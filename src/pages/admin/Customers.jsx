import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import { PageHeader } from './components/PageHeader';
import { Pagination } from './components/Pagination';
import { Modal } from './components/Modal';
import { EmptyState } from './components/EmptyState';
import { SkeletonTable } from './components/Skeletons';

export default function Customers() {
  const { get } = useApi();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '10');
      if (search) params.append('search', search);
      const res = await get(`/admin/customers?${params.toString()}`);
      setCustomers(res.data?.customers || res.customers || res.data || res || []);
      setTotalPages(res.data?.totalPages || res.totalPages || 1);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [get, page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleViewCustomer = async (customer) => {
    setModalOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await get(`/admin/customers/${customer._id || customer.id}`);
      setSelectedCustomer(res.data?.customer || res.data);
    } catch {
      setDetailError('Failed to load customer details.');
      setSelectedCustomer(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
    setDetailError(null);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (amount == null) return 'GH₵0.00';
    return `GH₵${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active' || c.active).length;
    const inactive = total - active;
    const now = new Date();
    const thisMonth = customers.filter(c => {
      const d = new Date(c.createdAt || c.joined);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, active, inactive, thisMonth };
  }, [customers]);

  const statCards = [
    { label: 'Total Customers', value: stats.total, icon: '👥', color: 'var(--admin-brand)', bg: 'rgba(232,93,4,0.08)' },
    { label: 'Active', value: stats.active, icon: '✅', color: 'var(--admin-success)', bg: 'rgba(34,197,94,0.08)' },
    { label: 'Inactive', value: stats.inactive, icon: '⏸️', color: 'var(--admin-danger)', bg: 'rgba(239,68,68,0.08)' },
    { label: 'New This Month', value: stats.thisMonth, icon: '🆕', color: 'var(--admin-info, #3b82f6)', bg: 'rgba(59,130,246,0.08)' },
  ];

  return (
    <motion.div
      className="admin-customers-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Customers"
        subtitle="Manage your customer base"
      />

      {/* ── Stats Cards ── */}
      <div className="admin-customers__stats">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="admin-customers__stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <div className="admin-customers__stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="admin-customers__stat-info">
              <span className="admin-customers__stat-value">{s.value}</span>
              <span className="admin-customers__stat-label">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="admin-customers__toolbar">
        <form className="admin-customers__search" onSubmit={handleSearchSubmit}>
          <svg className="admin-customers__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-customers__search-input"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="admin-customers__search-clear"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <SkeletonTable columns={6} rows={8} />
      ) : customers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No customers found"
          description={
            search
              ? 'Try adjusting your search terms.'
              : 'No customers have registered yet.'
          }
        />
      ) : (
        <>
          <div className="admin-customers__table-wrap">
            <table className="admin-customers__table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="admin-customers__th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <motion.tr
                    key={customer._id || customer.id || index}
                    className="admin-customers__row"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                  >
                    <td>
                      <div className="admin-customers__cell-product">
                        <div className="admin-customers__avatar">
                          {getInitial(customer.username || customer.name)}
                        </div>
                        <span className="admin-customers__name">
                          {customer.username || customer.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="admin-customers__email">
                      {customer.email || '—'}
                    </td>
                    <td className="admin-customers__phone">
                      {customer.phone || '—'}
                    </td>
                    <td className="admin-customers__date">
                      {formatDate(customer.createdAt || customer.joined)}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          customer.status === 'active' || customer.active
                            ? 'admin-badge--success'
                            : 'admin-badge--secondary'
                        }`}
                      >
                        <span className="admin-badge-dot" />
                        {customer.status === 'active' || customer.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-customers__view-btn"
                        onClick={() => handleViewCustomer(customer)}
                        aria-label={`View ${customer.username || customer.name}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal open={modalOpen} onClose={handleCloseModal} title="Customer Details">
        {detailLoading ? (
          <div className="admin-customers__detail-loading">
            <p>Loading customer details...</p>
          </div>
        ) : detailError ? (
          <div className="admin-customers__detail-error">
            <p>{detailError}</p>
          </div>
        ) : selectedCustomer ? (
          <div className="admin-customers__detail">
            <div className="admin-customers__detail-header">
              <div className="admin-customers__detail-avatar">
                {getInitial(selectedCustomer.username || selectedCustomer.name)}
              </div>
              <div className="admin-customers__detail-info">
                <h3 className="admin-customers__detail-name">
                  {selectedCustomer.username || selectedCustomer.name}
                </h3>
                <p className="admin-customers__detail-email">{selectedCustomer.email}</p>
              </div>
            </div>

            <div className="admin-customers__detail-stats">
              <div className="admin-customers__detail-stat">
                <span className="admin-customers__detail-stat-label">Total Orders</span>
                <span className="admin-customers__detail-stat-value">
                  {selectedCustomer.totalOrders ?? selectedCustomer.ordersCount ?? 0}
                </span>
              </div>
              <div className="admin-customers__detail-stat">
                <span className="admin-customers__detail-stat-label">Total Spent</span>
                <span className="admin-customers__detail-stat-value">
                  {formatCurrency(selectedCustomer.totalSpent ?? selectedCustomer.totalAmount)}
                </span>
              </div>
            </div>

            {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 && (
              <div className="admin-customers__detail-recent">
                <h4 className="admin-customers__detail-recent-title">Recent Orders</h4>
                <ul className="admin-customers__detail-recent-list">
                  {selectedCustomer.recentOrders.map((order, idx) => (
                    <li
                      key={order._id || order.id || idx}
                      className="admin-customers__detail-recent-item"
                    >
                      <span className="admin-customers__detail-recent-id">
                        #{(order._id || order.id || '').slice(-8) || order.orderNumber || '—'}
                      </span>
                      <span className="admin-customers__detail-recent-date">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="admin-customers__detail-recent-amount">
                        {formatCurrency(order.total || order.totalAmount)}
                      </span>
                      <span
                        className={`admin-badge ${
                          order.status === 'delivered'
                            ? 'admin-badge--success'
                            : 'admin-badge--secondary'
                        }`}
                      >
                        {order.status || 'Pending'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </motion.div>
  );
}
