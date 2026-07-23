import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import { PageHeader } from "./components/PageHeader";
import { SkeletonTable } from "./components/Skeletons";
import { EmptyState } from "./components/EmptyState";
import { StatCard } from "./components/StatCard";

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
        setStatsData(stats);
        setProductsData(products);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [get, getProducts]);

  const products = useMemo(() => productsData?.products || [], [productsData]);
  const stats = statsData || {};

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeFilter === "available") {
      result = result.filter((p) => p.available);
    } else if (activeFilter === "unavailable") {
      result = result.filter((p) => !p.available);
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
      await put(`/menu/${product._id}`, { available: !product.available });
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
      count: products.filter((p) => p.available).length,
    },
    {
      key: "unavailable",
      label: "Unavailable",
      count: products.filter((p) => !p.available).length,
    },
  ];

  const statCards = [
    {
      title: "Total Items",
      value: stats.totalItems ?? products.length ?? 0,
      icon: "bi-box-seam",
      color: "primary",
    },
    {
      title: "Available",
      value:
        stats.available ??
        products.filter((p) => p.available).length ??
        0,
      icon: "bi-check-circle",
      color: "success",
    },
    {
      title: "Unavailable",
      value:
        stats.unavailable ??
        products.filter((p) => !p.available).length ??
        0,
      icon: "bi-x-circle",
      color: "danger",
    },
    {
      title: "Low Stock",
      value: stats.lowStock ?? 0,
      icon: "bi-exclamation-triangle",
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
              title={card.title}
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
            <i className="bi bi-search admin-search-icon" />
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
              icon="bi-box-seam"
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
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                objectFit: "cover",
                              }}
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
                              checked={!!product.available}
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
                              product.available
                                ? "Mark unavailable"
                                : "Mark available"
                            }
                          >
                            {togglingId === product._id ? (
                              <span className="admin-spinner-sm" />
                            ) : (
                              <i
                                className={`bi ${
                                  product.available
                                    ? "bi-eye-slash"
                                    : "bi-eye"
                                }`}
                              />
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
