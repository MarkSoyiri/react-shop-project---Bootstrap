import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { PageHeader } from './components/PageHeader';
import { StatCard } from './components/StatCard';
import { SkeletonStatCards } from './components/Skeletons';

const COLORS = [
  '#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1',
  '#fd7e14', '#20c997', '#d63384', '#0dcaf0', '#6610f2',
];

function getDefaultStartDate() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

function getDefaultEndDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(val) {
  return `GH₵${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function BarChart({ data, maxEntries = 15, labelKey, valueKey, colorFn }) {
  if (!data || data.length === 0) {
    return <p className="admin-reports__chart-empty">No data available</p>;
  }

  const displayData = data.slice(0, maxEntries);
  const maxVal = Math.max(...displayData.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="admin-reports__bar-chart">
      {displayData.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = (val / maxVal) * 100;
        const fill = colorFn ? colorFn(i) : COLORS[i % COLORS.length];

        return (
          <div key={i} className="admin-reports__bar-row">
            <span className="admin-reports__bar-label" title={String(item[labelKey])}>
              {item[labelKey]}
            </span>
            <div className="admin-reports__bar-track">
              <motion.div
                className="admin-reports__bar-fill"
                style={{ backgroundColor: fill }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
              />
            </div>
            <span className="admin-reports__bar-value">{formatCurrency(val)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Reports() {
  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(getDefaultEndDate);
  const [groupBy, setGroupBy] = useState('daily');
  const [params, setParams] = useState({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    groupBy: 'daily',
  });
  const { get, loading, error } = useApi();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await get(`/admin/reports/sales?startDate=${params.startDate}&endDate=${params.endDate}&groupBy=${params.groupBy}`);
        setData(result.data || result);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [get, params.startDate, params.endDate, params.groupBy]);

  useEffect(() => {
    setParams({ startDate, endDate, groupBy });
  }, []);

  const handleApply = () => {
    setParams({ startDate, endDate, groupBy });
  };

  const salesData = data?.sales || [];
  const categoryData = data?.categorySales || data?.categories || [];
  const totalRevenue = data?.totalRevenue ?? 0;
  const totalOrders = data?.totalOrders ?? 0;
  const avgOrderValue = data?.avgOrderValue ?? (totalOrders > 0 ? totalRevenue / totalOrders : 0);

  const handleExportPDF = () => {
    window.alert('PDF export coming soon!');
  };

  const handleExportCSV = () => {
    window.alert('CSV export coming soon!');
  };

  return (
    <motion.div
      className="admin-reports-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader title="Sales Reports" subtitle="Analyze your sales data over time" />

      {/* ── Filter Toolbar ── */}
      <div className="admin-reports__toolbar">
        <div className="admin-reports__filter-group">
          <label className="admin-reports__label" htmlFor="report-start">Start Date</label>
          <input
            id="report-start"
            type="date"
            className="admin-form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="admin-reports__filter-group">
          <label className="admin-reports__label" htmlFor="report-end">End Date</label>
          <input
            id="report-end"
            type="date"
            className="admin-form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="admin-reports__filter-group">
          <label className="admin-reports__label" htmlFor="report-group">Group By</label>
          <select
            id="report-group"
            className="admin-form-select"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <button className="admin-btn admin-btn-primary" onClick={handleApply}>
          Apply
        </button>

        <div className="admin-reports__export-btns">
          <button className="admin-btn admin-btn-outline" onClick={handleExportPDF}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            PDF
          </button>
          <button className="admin-btn admin-btn-outline" onClick={handleExportCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            CSV
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonStatCards />
      ) : error ? (
        <div className="admin-reports__error">Failed to load report data.</div>
      ) : (
        <>
          {/* ── Stats Cards ── */}
          <div className="admin-reports__stats">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <StatCard
                label="Total Revenue"
                value={formatCurrency(totalRevenue)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 }}>
              <StatCard
                label="Total Orders"
                value={totalOrders.toLocaleString()}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                }
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12 }}>
              <StatCard
                label="Avg Order Value"
                value={formatCurrency(avgOrderValue)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                }
              />
            </motion.div>
          </div>

          {/* ── Charts ── */}
          <div className="admin-reports__charts">
            <motion.div
              className="admin-reports__chart-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h3 className="admin-reports__chart-title">Revenue Over Time</h3>
              <BarChart data={salesData} labelKey="date" valueKey="revenue" maxEntries={15} />
            </motion.div>

            <motion.div
              className="admin-reports__chart-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h3 className="admin-reports__chart-title">Sales by Category</h3>
              <BarChart
                data={categoryData}
                labelKey="category"
                valueKey="revenue"
                colorFn={(i) => COLORS[i % COLORS.length]}
              />
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
