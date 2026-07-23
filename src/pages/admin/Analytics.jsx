import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import { PageHeader } from "./components/PageHeader";
import { StatCard } from "./components/StatCard";
import { SkeletonStatCards } from "./components/Skeletons";

const DATE_RANGES = ["Today", "Week", "Month", "Year"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const barVariants = {
  hidden: { width: 0 },
  visible: (width) => ({
    width,
    transition: { duration: 0.8, ease: "easeOut" },
  }),
};

const CATEGORY_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#4f46e5",
  "#7c3aed",
  "#818cf8",
  "#a855f7",
];

const HOUR_LABELS = [
  "12a",
  "1a",
  "2a",
  "3a",
  "4a",
  "5a",
  "6a",
  "7a",
  "8a",
  "9a",
  "10a",
  "11a",
  "12p",
  "1p",
  "2p",
  "3p",
  "4p",
  "5p",
  "6p",
  "7p",
  "8p",
  "9p",
  "10p",
  "11p",
];

function AdminCard({ title, children }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>{title}</h3>
      </div>
      <div className="admin-card-body">{children}</div>
    </div>
  );
}

function HorizontalBar({ label, value, maxValue, color, index }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="admin-chart-bar-row">
      <span className="admin-chart-bar-label">{label}</span>
      <div className="admin-chart-bar-track">
        <motion.div
          className="admin-chart-bar-fill"
          style={{ backgroundColor: color || "#6366f1" }}
          custom={`${Math.max(percentage, 2)}%`}
          variants={barVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.05 }}
        />
      </div>
      <span className="admin-chart-bar-value">{value}</span>
    </div>
  );
}

function EmptyState({ message = "No data yet" }) {
  return (
    <div className="admin-chart-empty">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
      <p>{message}</p>
    </div>
  );
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState("Month");

  const { get, loading: salesLoading } = useApi();
  const [salesData, setSalesData] = useState(null);

  const { get: getInventory, loading: inventoryLoading } = useApi();
  const [inventoryData, setInventoryData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams({ range: dateRange.toLowerCase() });
        const [sales, inv] = await Promise.all([
          get(`/admin/reports/sales?${params}`),
          getInventory(`/admin/reports/inventory?${params}`),
        ]);
        setSalesData(sales);
        setInventoryData(inv);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [dateRange, get, getInventory]);

  const stats = useMemo(() => {
    if (!salesData) {
      return {
        revenue: 0,
        orders: 0,
        avgOrderValue: 0,
        returningCustomers: 0,
      };
    }
    return {
      revenue: salesData.totalRevenue ?? 0,
      orders: salesData.totalOrders ?? 0,
      avgOrderValue: salesData.avgOrderValue ?? 0,
      returningCustomers: salesData.returningCustomers ?? 0,
    };
  }, [salesData]);

  const revenueByDay = useMemo(() => {
    if (!salesData?.revenueByDay) return [];
    return salesData.revenueByDay;
  }, [salesData]);

  const salesByCategory = useMemo(() => {
    if (!inventoryData?.categoryBreakdown) return [];
    return inventoryData.categoryBreakdown;
  }, [inventoryData]);

  const popularProducts = useMemo(() => {
    if (!salesData?.popularProducts) return [];
    return salesData.popularProducts.slice(0, 5);
  }, [salesData]);

  const peakHours = useMemo(() => {
    if (!salesData?.peakHours) return Array(24).fill(0);
    return salesData.peakHours;
  }, [salesData]);

  const revenueMax = useMemo(
    () => Math.max(...revenueByDay.map((d) => d.value), 1),
    [revenueByDay]
  );

  const categoryMax = useMemo(
    () => Math.max(...salesByCategory.map((c) => c.value), 1),
    [salesByCategory]
  );

  const productMax = useMemo(
    () => Math.max(...popularProducts.map((p) => p.orders), 1),
    [popularProducts]
  );

  const hoursMax = useMemo(() => Math.max(...peakHours, 1), [peakHours]);

  const isLoading = salesLoading || inventoryLoading;

  return (
    <div className="admin-page">
      <PageHeader
        title="Analytics"
        subtitle="Track your store performance and key metrics"
      />

      <div className="admin-date-range-filter">
        {DATE_RANGES.map((range) => (
          <button
            key={range}
            className={`admin-date-range-btn${dateRange === range ? " active" : ""}`}
            onClick={() => setDateRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonStatCards />
      ) : (
        <motion.div
          className="admin-stat-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Revenue"
              value={`$${stats.revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              trend={salesData?.revenueTrend}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Orders"
              value={stats.orders.toLocaleString()}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              }
              trend={salesData?.ordersTrend}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Avg Order Value"
              value={`$${stats.avgOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              }
              trend={salesData?.aovTrend}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Returning Customers"
              value={stats.returningCustomers.toLocaleString()}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              trend={salesData?.returningTrend}
            />
          </motion.div>
        </motion.div>
      )}

      <motion.div
        className="admin-charts-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="admin-chart-col">
          <AdminCard title="Revenue Over Time">
            {revenueByDay.length > 0 ? (
              <div className="admin-chart-bars">
                {revenueByDay.map((item, i) => (
                  <HorizontalBar
                    key={item.label}
                    label={item.label}
                    value={`$${item.value.toLocaleString()}`}
                    maxValue={revenueMax}
                    color="#6366f1"
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </AdminCard>
        </motion.div>

        <motion.div variants={itemVariants} className="admin-chart-col">
          <AdminCard title="Sales by Category">
            {salesByCategory.length > 0 ? (
              <div className="admin-chart-bars">
                {salesByCategory.map((item, i) => (
                  <HorizontalBar
                    key={item.name}
                    label={item.name}
                    value={`$${item.value.toLocaleString()}`}
                    maxValue={categoryMax}
                    color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </AdminCard>
        </motion.div>

        <motion.div variants={itemVariants} className="admin-chart-col">
          <AdminCard title="Popular Products">
            {popularProducts.length > 0 ? (
              <div className="admin-chart-bars">
                {popularProducts.map((item, i) => (
                  <HorizontalBar
                    key={item.name}
                    label={item.name}
                    value={`${item.orders} orders`}
                    maxValue={productMax}
                    color="#8b5cf6"
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </AdminCard>
        </motion.div>

        <motion.div variants={itemVariants} className="admin-chart-col">
          <AdminCard title="Peak Hours">
            {peakHours.some((h) => h > 0) ? (
              <div className="admin-chart-bars admin-chart-bars-vertical">
                <div className="admin-chart-vertical-bars">
                  {peakHours.map((count, i) => {
                    const pct = hoursMax > 0 ? (count / hoursMax) * 100 : 0;
                    return (
                      <div
                        key={i}
                        className="admin-chart-vertical-col"
                        title={`${HOUR_LABELS[i]}: ${count} orders`}
                      >
                        <motion.div
                          className="admin-chart-vertical-bar"
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(pct, 2)}%` }}
                          transition={{
                            duration: 0.6,
                            delay: i * 0.03,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="admin-chart-vertical-labels">
                  {HOUR_LABELS.map((label, i) => (
                    <span
                      key={i}
                      className={`admin-chart-vertical-label${i % 3 === 0 ? "" : " hidden"}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </AdminCard>
        </motion.div>
      </motion.div>

      <style>{`
        .admin-date-range-filter {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .admin-date-range-btn {
          padding: 0.5rem 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: #fff;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-date-range-btn:hover {
          border-color: #6366f1;
          color: #6366f1;
        }

        .admin-date-range-btn.active {
          background: #6366f1;
          border-color: #6366f1;
          color: #fff;
        }

        .admin-charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .admin-charts-grid {
            grid-template-columns: 1fr;
          }
        }

        .admin-chart-bars {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .admin-chart-bar-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .admin-chart-bar-label {
          min-width: 100px;
          max-width: 120px;
          font-size: 0.8125rem;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-shrink: 0;
        }

        .admin-chart-bar-track {
          flex: 1;
          height: 28px;
          background: #f1f5f9;
          border-radius: 0.375rem;
          overflow: hidden;
        }

        .admin-chart-bar-fill {
          height: 100%;
          border-radius: 0.375rem;
          min-width: 2px;
        }

        .admin-chart-bar-value {
          min-width: 60px;
          text-align: right;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1e293b;
          flex-shrink: 0;
        }

        .admin-chart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: #94a3b8;
          gap: 0.75rem;
        }

        .admin-chart-empty p {
          margin: 0;
          font-size: 0.9375rem;
        }

        .admin-chart-bars-vertical {
          gap: 0;
        }

        .admin-chart-vertical-bars {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 160px;
          padding-bottom: 0.25rem;
        }

        .admin-chart-vertical-col {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: flex-end;
          position: relative;
        }

        .admin-chart-vertical-col:hover::after {
          content: attr(title);
          position: absolute;
          bottom: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: #fff;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.6875rem;
          white-space: nowrap;
          z-index: 10;
        }

        .admin-chart-vertical-bar {
          width: 100%;
          background: linear-gradient(to top, #6366f1, #a78bfa);
          border-radius: 0.25rem 0.25rem 0 0;
        }

        .admin-chart-vertical-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
        }

        .admin-chart-vertical-label {
          font-size: 0.625rem;
          color: #94a3b8;
          text-align: center;
          flex: 1;
        }

        .admin-chart-vertical-label.hidden {
          visibility: hidden;
        }
      `}</style>
    </div>
  );
}
