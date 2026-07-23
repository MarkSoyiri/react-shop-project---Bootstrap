import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
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
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
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
      const res = await get(`/admin/customers/${customer.id || customer._id}`);
      setSelectedCustomer(res.data.customer || res.data);
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

  return (
    <div className="admin-customers">
      <PageHeader title="Customers" subtitle="Manage your customer base" />

      <div className="admin-customers__actions">
        <form className="admin-customers__search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="admin-customers__search-input"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="admin-customers__search-btn">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <SkeletonTable rows={5} columns={6} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={search ? 'Try adjusting your search terms.' : 'No customers have registered yet.'}
        />
      ) : (
        <>
          <motion.div
            className="admin-customers__table-wrapper"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <table className="admin-customers__table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id || customer._id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <td>
                      <div className="admin-customers__customer-info">
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
                        className={`admin-customers__badge admin-customers__badge--${
                          customer.status === 'active' || customer.active ? 'active' : 'inactive'
                        }`}
                      >
                        {customer.status === 'active' || customer.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-customers__view-btn"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

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
                      key={order.id || order._id || idx}
                      className="admin-customers__detail-recent-item"
                    >
                      <span className="admin-customers__detail-recent-id">
                        #{(order.id || order._id || '').slice(-8) || order.orderNumber || '—'}
                      </span>
                      <span className="admin-customers__detail-recent-date">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="admin-customers__detail-recent-amount">
                        {formatCurrency(order.total || order.totalAmount)}
                      </span>
                      <span
                        className={`admin-customers__badge admin-customers__badge--${order.status === 'delivered' ? 'active' : 'inactive'}`}
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
    </div>
  );
}
