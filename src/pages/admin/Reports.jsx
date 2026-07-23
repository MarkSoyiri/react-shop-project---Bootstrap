import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { formatCurrency } from '../../utils/helpers';
import { SkeletonStat } from '../../components/ui/Skeleton';

function AdminReports() {
  const { get, loading } = useApi();
  const [report, setReport] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => { loadReport(); }, [groupBy]);

  const loadReport = async () => {
    try {
      const params = new URLSearchParams({ groupBy });
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      const res = await get(`/admin/reports/sales?${params}`);
      setReport(res.data);
    } catch (err) { console.error(err); }
  };

  if (loading && !report) return <div className="stat-cards">{[1, 2, 3].map(i => <SkeletonStat key={i} />)}</div>;
  if (!report) return null;

  const maxRevenue = Math.max(...report.sales.map(s => s.revenue), 1);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Sales Analytics</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Track your revenue and performance</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input type="date" value={dateRange.startDate} onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
          style={{ padding: '8px 12px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 14 }} />
        <input type="date" value={dateRange.endDate} onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
          style={{ padding: '8px 12px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 14 }} />
        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 14 }}>
          <option value="hour">Hourly</option>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
        <button className="btn-premium" style={{ padding: '8px 20px', fontSize: 14 }} onClick={loadReport}>
          Apply
        </button>
      </div>

      <div className="stat-cards">
        <div className="stat-card orange">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatCurrency(report.totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{report.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{report.totalOrders > 0 ? formatCurrency(report.totalRevenue / report.totalOrders) : 'GH₵0'}</div>
          <div className="stat-label">Avg. Order Value</div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Revenue Over Time</h3>
          </div>
          <div className="admin-card-body">
            {report.sales.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.sales.slice(-20).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 80, fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                      {s._id}
                    </div>
                    <div style={{ flex: 1, height: 24, background: 'var(--color-bg-alt)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${(s.revenue / maxRevenue) * 100}%`, height: '100%',
                        background: 'linear-gradient(90deg, var(--color-brand), var(--color-brand-light))',
                        borderRadius: 4, transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ width: 80, fontSize: 13, fontWeight: 600 }}>{formatCurrency(s.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 40 }}>No sales data for this period</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Sales by Category</h3>
          </div>
          <div className="admin-card-body">
            {report.categorySales.length > 0 ? (
              report.categorySales.map((cat, i) => {
                const maxCat = Math.max(...report.categorySales.map(c => c.revenue), 1);
                return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{cat._id || 'Uncategorized'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(cat.revenue)}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--color-bg-alt)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${(cat.revenue / maxCat) * 100}%`, height: '100%',
                        background: `hsl(${i * 45}, 70%, 50%)`, borderRadius: 4,
                      }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{cat.itemsSold} items sold</div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 40 }}>No category data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
