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
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Customers</h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>{pagination.total} registered customers</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            style={{ width: '100%', padding: '10px 16px 10px 42px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff' }}
          />
        </div>
      </div>

      <div className="admin-table-wrapper" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
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
                      background: 'linear-gradient(135deg, #e85d04, #f48c06)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14, flexShrink: 0,
                    }}>
                      {customer.username?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{customer.username || 'N/A'}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: '#6b7280' }}>{customer.email}</td>
                <td style={{ fontSize: 13 }}>{customer.phone || '—'}</td>
                <td style={{ fontSize: 13, color: '#6b7280' }}>{formatDate(customer.createdAt)}</td>
                <td>
                  <button
                    onClick={() => loadCustomerDetails(customer._id)}
                    style={{
                      padding: '6px 14px', fontSize: 12, fontWeight: 600,
                      border: '1.5px solid #e5e7eb', borderRadius: 8,
                      background: '#fff', cursor: 'pointer', color: '#374151',
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>No customers found</td>
              </tr>
            )}
          </tbody>
        </table>

        {pagination.pages > 1 && (
          <div className="admin-pagination">
            <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>← Prev</button>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Page {pagination.page} of {pagination.pages}</span>
            <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next →</button>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 24, backdropFilter: 'blur(4px)',
        }} onClick={() => setSelectedCustomer(null)}>
          <div
            style={{
              background: '#fff', borderRadius: 16,
              padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: '#f3f4f6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #e85d04, #f48c06)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 20,
              }}>
                {selectedCustomer.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedCustomer.username}</div>
                <div style={{ color: '#6b7280', fontSize: 14 }}>{selectedCustomer.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Total Orders</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{selectedCustomer.orderCount}</div>
              </div>
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Total Spent</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#e85d04' }}>
                  {formatCurrency(selectedCustomer.totalSpent)}
                </div>
              </div>
            </div>

            {selectedCustomer.recentOrders?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#374151' }}>Recent Orders</h4>
                {selectedCustomer.recentOrders.map(order => (
                  <div key={order._id} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                    borderBottom: '1px solid #f3f4f6', fontSize: 14,
                  }}>
                    <span style={{ fontWeight: 600, color: '#6b7280' }}>#{order._id.slice(-6).toUpperCase()}</span>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(order.total)}</span>
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
