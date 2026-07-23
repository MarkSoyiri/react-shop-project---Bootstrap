import {
  useState,
  createContext,
  useContext,
  useEffect,
  lazy,
  Suspense,
} from "react";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "./App.css";
import "./css/Pages.css";
import "./css/Admin.css";

import { HomeNav, Footer } from "./components/NavFooter";
import { DontShowLoginRegister } from "./components/IsAuth";
import ProtectedRoute from "./components/ProtectedRoute";

import useAxiosLoader from "./api/useAxiosLoader";
import { LoadingContext } from "./context/LoadingContext";
import {
  PageLoaderContext,
  PageLoaderProvider
} from "./context/PageLoaderContext";
import { CartProvider, CartContext } from "./context/CartContext";

import GlobalLoader from "./components/GlobalLoader";
import { SkeletonPage } from "./components/ui/Skeleton";

function AdminLoader() {
  return (
    <div className="admin-layout">
      <div className="admin-sidebar" />
      <div className="admin-main">
        <div className="admin-topbar" />
        <div className="admin-content" style={{ padding: 28 }}>
          <div className="admin-skeleton admin-skeleton-heading" style={{ width: 200, height: 28, marginBottom: 24 }} />
          <div className="admin-stat-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="admin-skeleton-card">
                <div className="admin-skeleton admin-skeleton-text" style={{ width: 80, height: 12, marginBottom: 12 }} />
                <div className="admin-skeleton admin-skeleton-heading" style={{ width: 120, height: 24, marginBottom: 8 }} />
                <div className="admin-skeleton admin-skeleton-text" style={{ width: 60, height: 12 }} />
              </div>
            ))}
          </div>
          <div className="admin-card">
            <div className="admin-card-body no-pad">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="admin-skeleton-table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px' }}>
                  {[1,2,3,4,5].map(j => (
                    <div key={j} className="admin-skeleton admin-skeleton-text" style={{ height: 14, width: j === 1 ? '70%' : '50%' }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import StoreLocation from "./pages/StoreLocation";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Search = lazy(() => import("./pages/Search"));
const UserProfile = lazy(() => import("./pages/Account"));
const Cart = lazy(() => import("./pages/Cart"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Notifications = lazy(() => import("./pages/Notifications"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminCoupons = lazy(() => import("./pages/admin/Coupons"));
const AdminPromotions = lazy(() => import("./pages/admin/Promotions"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminInventory = lazy(() => import("./pages/admin/Inventory"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));

export const ThemeContext = createContext();

function Layout() {
  const location = useLocation();
  const { pageLoading } = useContext(PageLoaderContext);
  const { cartItems, getTotalPrice } = useContext(CartContext);
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const hideNav = location.pathname === "/login" || isAdmin;
  const hideFooter = location.pathname === "/login" || isAdmin;

  return (
    <>
      {!hideNav && <HomeNav />}

      {!isAdmin && (
        <div className="offcanvas offcanvas-end" data-bs-scroll="true" tabIndex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasWithBothOptionsLabel">ORDER SUMMARY</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            {cartItems.length === 0 ? (
              <p>Looks like you have not placed an order yet. Do you want to <a href="/menu" style={{ color: "black", fontWeight: 500 }}>place an order</a>?</p>
            ) : (
              <>
                <div className='ordered-item-box'>
                  {cartItems.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                      <h6>{item.name}</h6>
                      <p>x{item.quantity} - GH₵ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <hr />
                <div style={{ marginBottom: '20px' }}>
                  <h5>Total: GH₵ {getTotalPrice().toFixed(2)}</h5>
                </div>
              </>
            )}
            <div className='coupon-btn'>
              <input type='text' placeholder='Type coupon code here' />
              <p>Apply</p>
            </div>
            <div className='checkout-btn'>
              <a href="/checkout"><p>Checkout</p></a>
              <p>GH₵ {getTotalPrice().toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {pageLoading && <GlobalLoader />}

      <Suspense fallback={isAdmin ? <AdminLoader /> : <SkeletonPage />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/storelocation" element={<StoreLocation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/userprofile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />

          <Route element={<DontShowLoginRegister />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute role="admin"><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute role="admin"><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute role="admin"><AdminLayout><AdminCustomers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute role="admin"><AdminLayout><AdminReviews /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute role="admin"><AdminLayout><AdminCoupons /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/promotions" element={<ProtectedRoute role="admin"><AdminLayout><AdminPromotions /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminLayout><AdminAnalytics /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminLayout><AdminReports /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute role="admin"><AdminLayout><AdminInventory /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminLayout><AdminProfile /></AdminLayout></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  const [theme, setTheme] = useState("Light");
  const { isLoading } = useContext(LoadingContext);

  useAxiosLoader();

  const toggleTheme = () => {
    setTheme(prev => (prev === "Light" ? "Dark" : "Light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <PageLoaderProvider>
        <CartProvider>
          <div
            style={{
              backgroundColor: theme === "Light" ? "#fff" : "#000",
              minHeight: "100vh",
            }}
          >
            {isLoading && <GlobalLoader />}

            <BrowserRouter>
              <Layout />
            </BrowserRouter>
          </div>
        </CartProvider>
      </PageLoaderProvider>
    </ThemeContext.Provider>
  );
}

export default App;
