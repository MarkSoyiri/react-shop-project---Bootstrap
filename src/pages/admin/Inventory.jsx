import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import { PageHeader } from "./components/PageHeader";
import { SkeletonTable } from "./components/Skeletons";
import { EmptyState } from "./components/EmptyState";
import { StatCard } from "./components/StatCard";

const iconBoxSeam = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const iconCheckCircle = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const iconXCircle = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const iconAlertTriangle = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const iconEyeSlash = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const iconEye = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const iconSearch = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-search-icon">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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
    {
      key: "available",
      label: "Available",
      count: products.filter((p) => p.isAvailable !== false).length,
    },
    {
      key: "unavailable",
      label: "Unavailable",
      count: products.filter((p) => p.isAvailable === false).length,
    },
  ];

  const statCards = [
    {
      label: "Total Items",
      value: stats.totalItems ?? products.length ?? 0,
      icon: iconBoxSeam,
      color: "primary",
    },
    {
      label: "Available",
      value:
        stats.available ??
        products.filter((p) => p.isAvailable !== false).length ??
        0,
      icon: iconCheckCircle,
      color: "success",
    },
    {
      label: "Unavailable",
      value:
        stats.unavailable ??
        products.filter((p) => p.isAvailable === false).length ??
        0,
      icon: iconXCircle,
      color: "danger",
    },
    {
      label: "Low Stock",
      value: stats.lowStock ?? 0,
      icon: iconAlertTriangle,
      color: "warning",
    },
  ];

  return (
    <div className="admin-inventory-page">
      <PageHeader
        title="Inventory Management"
        subtitle="Manage product availability and stock status"
      />

      <div className="row g-3 mb-4">
        {statCards.map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-3">
            <StatCard
              label={card.label}
              value={statsLoading ? "—" : card.value}
              icon={card.icon}
              color={card.color}
              loading={statsLoading}
            />
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="admin-filter-pills d-flex flex-wrap gap-2">
            {filterPills.map((pill) => (
              <button
                key={pill.key}
                className={`admin-pill ${
                  activeFilter === pill.key ? "active" : ""
                }`}
                onClick={() => setActiveFilter(pill.key)}
              >
                {pill.label}
                <span className="admin-pill-count">{pill.count}</span>
              </button>
            ))}
          </div>

          <div className="admin-search-box">
            {iconSearch}
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-card-body p-0">
          {productsLoading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={iconBoxSeam}
              title="No products found"
              description={
                search
                  ? "Try a different search term."
                  : "No inventory data available."
              }
            />
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <td>
                          <div className="admin-product-cell d-flex align-items-center gap-3">
                            <img
                              src={product.image || "/placeholder.png"}
                              alt={product.name}
                              className="admin-product-thumb"
                            />
                            <span className="admin-product-name fw-medium">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="admin-category-badge">
                            {product.category || "—"}
                          </span>
                        </td>
                        <td>
                          <label className="admin-toggle">
                            <input
                              type="checkbox"
                              checked={product.isAvailable !== false}
                              disabled={togglingId === product._id}
                              onChange={() => toggleAvailability(product)}
                            />
                            <span className="admin-toggle-slider" />
                          </label>
                        </td>
                        <td className="text-center">
                          <span className="admin-order-count">
                            {product.orderCount ?? 0}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="admin-action-btn"
                            onClick={() => toggleAvailability(product)}
                            disabled={togglingId === product._id}
                            title={
                              product.isAvailable !== false
                                ? "Mark unavailable"
                                : "Mark available"
                            }
                          >
                            {togglingId === product._id ? (
                              <span className="admin-spinner-sm" />
                            ) : (
                              product.isAvailable !== false
                                ? iconEyeSlash
                                : iconEye
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
        </div>
      </div>
    </div>
  );
};

export default Inventory;
