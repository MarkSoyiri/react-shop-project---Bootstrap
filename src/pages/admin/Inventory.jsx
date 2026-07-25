import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useApi from "../../hooks/useApi";
import { PageHeader } from "./components/PageHeader";
import { EmptyState } from "./components/EmptyState";
import { SkeletonTable } from "./components/Skeletons";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [togglingId, setTogglingId] = useState(null);

  const { get, put, loading: statsLoading } = useApi();
  const [statsData, setStatsData] = useState(null);

  const { get: getProducts, loading: productsLoading } = useApi();
  const [productsData, setProductsData] = useState(null);

  const refetchProducts = async () => {
    try {
      const result = await getProducts("/menu?limit=100");
      setProductsData(result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [stats, products] = await Promise.all([
          get("/admin/reports/inventory"),
          getProducts("/menu?limit=100"),
        ]);
        setStatsData(stats.data || stats);
        setProductsData(products.data || products);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [get, getProducts]);

  const products = useMemo(() => {
    if (!productsData) return [];
    const items = productsData.data?.items || productsData.items || productsData.data || productsData;
    return Array.isArray(items) ? items : [];
  }, [productsData]);
  const stats = statsData || {};

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeFilter === "available") {
      result = result.filter((p) => p.isAvailable !== false);
    } else if (activeFilter === "unavailable") {
      result = result.filter((p) => p.isAvailable === false);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name?.toLowerCase().includes(q));
    }

    return result;
  }, [products, activeFilter, search]);

  const toggleAvailability = async (product) => {
    setTogglingId(product._id);
    try {
      await put(`/menu/${product._id}`, { isAvailable: product.isAvailable === false });
      refetchProducts();
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const filterPills = [
    { key: "all", label: "All", count: products.length },
    { key: "available", label: "Available", count: products.filter((p) => p.isAvailable !== false).length },
    { key: "unavailable", label: "Unavailable", count: products.filter((p) => p.isAvailable === false).length },
  ];

  const statCards = [
    {
      label: "Total Items",
      value: stats.totalItems ?? products.length ?? 0,
      icon: "📦",
      color: "var(--admin-brand)",
      bg: "rgba(232,93,4,0.08)",
    },
    {
      label: "Available",
      value: stats.available ?? products.filter((p) => p.isAvailable !== false).length ?? 0,
      icon: "✅",
      color: "var(--admin-success)",
      bg: "rgba(34,197,94,0.08)",
    },
    {
      label: "Unavailable",
      value: stats.unavailable ?? products.filter((p) => p.isAvailable === false).length ?? 0,
      icon: "⏸️",
      color: "var(--admin-danger)",
      bg: "rgba(239,68,68,0.08)",
    },
    {
      label: "Low Stock",
      value: stats.lowStock ?? 0,
      icon: "⚠️",
      color: "var(--admin-warning)",
      bg: "rgba(234,179,8,0.08)",
    },
  ];

  return (
    <motion.div
      className="admin-inventory-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Inventory Management"
        subtitle="Manage product availability and stock status"
      />

      {/* ── Stats Cards ── */}
      <div className="admin-inventory__stats">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="admin-inventory__stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <div className="admin-inventory__stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="admin-inventory__stat-info">
              <span className="admin-inventory__stat-value">{statsLoading ? "—" : s.value}</span>
              <span className="admin-inventory__stat-label">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="admin-inventory__toolbar">
        <div className="admin-inventory__pills">
          {filterPills.map((pill) => (
            <button
              key={pill.key}
              className={`admin-pill ${activeFilter === pill.key ? "active" : ""}`}
              onClick={() => setActiveFilter(pill.key)}
            >
              {pill.label}
              <span className="admin-pill-count">{pill.count}</span>
            </button>
          ))}
        </div>

        <div className="admin-inventory__search">
          <svg className="admin-inventory__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-inventory__search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="admin-inventory__search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {productsLoading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No products found"
          description={search ? "Try a different search term." : "No inventory data available."}
        />
      ) : (
        <div className="admin-inventory__table-wrap">
          <table className="admin-inventory__table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th className="text-center">Orders</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    className="admin-inventory__row"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                  >
                    <td>
                      <div className="admin-inventory__cell-product">
                        <div className="admin-inventory__cell-img">
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <div className="admin-inventory__cell-img-placeholder">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="admin-inventory__cell-name">{product.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-inventory__category-tag">
                        {product.category || "—"}
                      </span>
                    </td>
                    <td>
                      <label className="admin-products__toggle">
                        <input
                          type="checkbox"
                          checked={product.isAvailable !== false}
                          disabled={togglingId === product._id}
                          onChange={() => toggleAvailability(product)}
                        />
                        <span className="admin-products__toggle-track" />
                      </label>
                    </td>
                    <td className="text-center">
                      <span className="admin-inventory__order-count">
                        {product.orderCount ?? 0}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="admin-inventory__action-btn"
                        onClick={() => toggleAvailability(product)}
                        disabled={togglingId === product._id}
                        title={product.isAvailable !== false ? "Mark unavailable" : "Mark available"}
                        aria-label={product.isAvailable !== false ? `Mark ${product.name} unavailable` : `Mark ${product.name} available`}
                      >
                        {togglingId === product._id ? (
                          <span className="admin-spinner-sm" />
                        ) : product.isAvailable !== false ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default Inventory;
