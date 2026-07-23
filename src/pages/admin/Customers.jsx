import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { SkeletonTable } from '../../components/ui/Skeleton';

function AdminCustomers() {
  const { get, loading } = useApi();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [pagination.page, search]);

  const loadCustomers = async () => {
    try {
      const params = new URLSearchParams({ page: pagination.page, limit: 15 });
      if (search) params.append('search', search);
      const res = await get(`/admin/customers?${params}`);
      setCustomers(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCustomerDetails = async (id) => {
    try {
      const res = await get(`/admin/customers/${id}`);
      setSelectedCustomer(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && customers.length === 0) return <SkeletonTable rows={10} />;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Customers</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          {pagination.total} registered customers
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          style={{
            width: 320, padding: '10px 16px', border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none',
          }}
        />
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--color-brand)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14,
                    }}>
                      {customer.username?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{customer.username || 'N/A'}</span>
                  </div>
                </td>
                <td>{customer.email}</td>
                <td>{customer.phone || '—'}</td>
                <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {formatDate(customer.createdAt)}
                </td>
                <td>
                  <button
                    className="quick-action-btn"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => loadCustomerDetails(customer._id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {pagination.pages > 1 && (
          <div className="admin-pagination">
            <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
              ← Prev
            </button>
            <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
              Next →
            </button>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 24,
        }} onClick={() => setSelectedCustomer(null)}>
          <div
            style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
              padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--color-brand)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 20,
              }}>
                {selectedCustomer.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedCustomer.username}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{selectedCustomer.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 16, background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Total Orders</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{selectedCustomer.orderCount}</div>
              </div>
              <div style={{ padding: 16, background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Total Spent</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-brand)' }}>
                  {formatCurrency(selectedCustomer.totalSpent)}
                </div>
              </div>
            </div>

            {selectedCustomer.recentOrders?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Orders</h4>
                {selectedCustomer.recentOrders.map(order => (
                  <div key={order._id} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                    borderTop: '1px solid var(--color-border-light)', fontSize: 14,
                  }}>
                    <span>#{order._id.slice(-6).toUpperCase()}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(order.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
