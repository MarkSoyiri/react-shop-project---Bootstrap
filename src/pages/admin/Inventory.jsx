import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { SkeletonTable } from '../../components/ui/Skeleton';

function AdminInventory() {
  const { get, loading } = useApi();
  const [inventory, setInventory] = useState(null);

  useEffect(() => { loadInventory(); }, []);

  const loadInventory = async () => {
    try {
      const res = await get('/admin/reports/inventory');
      setInventory(res.data);
    } catch (err) { console.error(err); }
  };

  if (loading && !inventory) return <SkeletonTable rows={8} />;
  if (!inventory) return null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Inventory</h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Track product availability</p>
      </div>

      <div className="stat-cards" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Items', value: inventory.available + inventory.lowStock + inventory.unavailable, color: '#6b7280', bg: '#f3f4f6', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
          { label: 'Available', value: inventory.available, color: '#2b9348', bg: 'rgba(43,147,72,0.1)', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2b9348" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Low Stock', value: inventory.lowStock, color: '#e85d04', bg: 'rgba(232,93,4,0.1)', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#e85d04" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
          { label: 'Unavailable', value: inventory.unavailable, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
        ].map((card, i) => (
          <div key={i} className={`stat-card ${['','green','orange',''][i]}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 24 }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-table-wrapper" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Status</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {inventory.items.map(item => (
              <tr key={item._id}>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: '#f3f4f6', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                    {item.category}
                  </span>
                </td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: item.isAvailable ? '#dcfce7' : '#fee2e2', color: item.isAvailable ? '#166534' : '#991b1b',
                  }}>
                    {item.isAvailable ? '✓ Available' : '✕ Unavailable'}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#374151' }}>{item.orderCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminInventory;
