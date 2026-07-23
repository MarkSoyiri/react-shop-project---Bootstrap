import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { PageHeader } from './components/PageHeader';
import { StatCard } from './components/StatCard';
import { SkeletonStatCards } from './components/Skeletons';

const COLORS = [
  '#0d6efd',
  '#198754',
  '#ffc107',
  '#dc3545',
  '#6f42c1',
  '#fd7e14',
  '#20c997',
  '#d63384',
  '#0dcaf0',
  '#6610f2',
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
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function BarChart({ data, maxEntries = 15, labelKey, valueKey, colorFn }) {
  if (!data || data.length === 0) {
    return <p className="admin-chart-empty">No data available</p>;
  }

  const displayData = data.slice(0, maxEntries);
  const maxVal = Math.max(...displayData.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="admin-bar-chart">
      {displayData.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = (val / maxVal) * 100;
        const fill = colorFn ? colorFn(i) : COLORS[i % COLORS.length];

        return (
          <div key={i} className="admin-bar-row">
            <span className="admin-bar-label" title={String(item[labelKey])}>
              {item[labelKey]}
            </span>
            <div className="admin-bar-track">
              <motion.div
                className="admin-bar-fill"
                style={{ backgroundColor: fill }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
              />
            </div>
            <span className="admin-bar-value">{formatCurrency(val)}</span>
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
        setData(result);
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
  const categoryData = data?.categories || [];
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
    <div className="admin-reports">
      <PageHeader title="Sales Reports" />

      <div className="admin-reports-filters">
        <div className="admin-reports-filter-group">
          <label className="admin-reports-label" htmlFor="report-start">
            Start Date
          </label>
          <input
            id="report-start"
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="admin-reports-filter-group">
          <label className="admin-reports-label" htmlFor="report-end">
            End Date
          </label>
          <input
            id="report-end"
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="admin-reports-filter-group">
          <label className="admin-reports-label" htmlFor="report-group">
            Group By
          </label>
          <select
            id="report-group"
            className="form-select"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="admin-reports-filter-group admin-reports-apply">
          <button
            className="btn btn-primary"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>

        <div className="admin-reports-export-btns">
          <button className="btn btn-outline-danger" onClick={handleExportPDF}>
            Export PDF
          </button>
          <button className="btn btn-outline-success" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonStatCards />
      ) : error ? (
        <div className="admin-reports-error">Failed to load report data.</div>
      ) : (
        <>
          <div className="admin-reports-stats">
            <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} />
            <StatCard title="Total Orders" value={totalOrders.toLocaleString()} />
            <StatCard title="Avg Order Value" value={formatCurrency(avgOrderValue)} />
          </div>

          <div className="admin-reports-charts">
            <motion.div
              className="admin-reports-chart-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="admin-reports-chart-title">Revenue Over Time</h3>
              <BarChart
                data={salesData}
                labelKey="date"
                valueKey="revenue"
                maxEntries={15}
              />
            </motion.div>

            <motion.div
              className="admin-reports-chart-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h3 className="admin-reports-chart-title">Sales by Category</h3>
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
    </div>
  );
}
