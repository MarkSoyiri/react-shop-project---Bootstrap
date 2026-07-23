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
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Inventory</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Track product availability</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card green">
          <div className="stat-icon">✓</div>
          <div className="stat-value">{inventory.available}</div>
          <div className="stat-label">Available Items</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⚠</div>
          <div className="stat-value">{inventory.lowStock}</div>
          <div className="stat-label">Low Stock</div>
        </div>
        <div className="stat-card" style={{ borderColor: '#ef4444' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>✕</div>
          <div className="stat-value">{inventory.unavailable}</div>
          <div className="stat-label">Unavailable</div>
        </div>
      </div>

      <div className="admin-table-wrapper">
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
                <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                <td>
                  <span className={`badge-status ${item.isAvailable ? 'badge-delivered' : 'badge-cancelled'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td>{item.orderCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminInventory;
