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
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Sales Analytics</h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Track your revenue and performance</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <input type="date" value={dateRange.startDate} onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
            style={{ padding: '9px 12px 9px 36px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <input type="date" value={dateRange.endDate} onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
            style={{ padding: '9px 12px 9px 36px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff' }} />
        </div>
        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
          style={{ padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff' }}>
          <option value="hour">Hourly</option>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
        <button onClick={loadReport} style={{
          padding: '9px 20px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          background: 'linear-gradient(135deg, #e85d04, #f48c06)', color: '#fff',
          boxShadow: '0 2px 8px rgba(232,93,4,0.3)',
        }}>Apply</button>
      </div>

      <div className="stat-cards" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(report.totalRevenue), color: '#e85d04', bg: 'rgba(232,93,4,0.1)', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#e85d04" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          { label: 'Total Orders', value: report.totalOrders, color: '#2b9348', bg: 'rgba(43,147,72,0.1)', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2b9348" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> },
          { label: 'Avg. Order Value', value: report.totalOrders > 0 ? formatCurrency(report.totalRevenue / report.totalOrders) : 'GH₵0', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
        ].map((card, i) => (
          <div key={i} className={`stat-card ${['orange','green','blue'][i]}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Revenue Over Time</h3>
          </div>
          <div className="admin-card-body" style={{ padding: '20px 24px' }}>
            {report.sales.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.sales.slice(-15).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 72, fontSize: 11, color: '#9ca3af', textAlign: 'right', fontWeight: 500 }}>
                      {s._id}
                    </div>
                    <div style={{ flex: 1, height: 28, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{
                        width: `${(s.revenue / maxRevenue) * 100}%`, height: '100%',
                        background: 'linear-gradient(90deg, #e85d04, #f48c06)',
                        borderRadius: 6, transition: 'width 0.5s ease',
                        minWidth: s.revenue > 0 ? 4 : 0,
                      }} />
                    </div>
                    <div style={{ width: 80, fontSize: 13, fontWeight: 700, color: '#111827' }}>{formatCurrency(s.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No sales data for this period</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Sales by Category</h3>
          </div>
          <div className="admin-card-body" style={{ padding: '20px 24px' }}>
            {report.categorySales.length > 0 ? (
              report.categorySales.map((cat, i) => {
                const maxCat = Math.max(...report.categorySales.map(c => c.revenue), 1);
                const colors = ['#e85d04', '#2b9348', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];
                const color = colors[i % colors.length];
                return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{cat._id || 'Uncategorized'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(cat.revenue)}</span>
                    </div>
                    <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${(cat.revenue / maxCat) * 100}%`, height: '100%',
                        background: color, borderRadius: 4,
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{cat.itemsSold} items sold</div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No category data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
