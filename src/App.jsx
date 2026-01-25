import {
  useState,
  createContext,
  useContext,
  useEffect
} from "react";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "./App.css";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import StoreLocation from "./pages/StoreLocation";
import Contact from "./pages/Contact";
import UserProfile from "./pages/Account";
import Cart from "./pages/Cart";

import { HomeNav, Footer } from "./components/NavFooter";
import MenuNav from "./components/MenuNav";
import { DontShowLoginRegister } from "./components/IsAuth";

import useAxiosLoader from "./api/useAxiosLoader";
import { LoadingContext } from "./context/LoadingContext";
import {
  PageLoaderContext,
  PageLoaderProvider
} from "./context/PageLoaderContext";
import { CartProvider, CartContext } from "./context/CartContext";

import GlobalLoader from "./components/GlobalLoader";

/* =====================
   THEME CONTEXT
===================== */
export const ThemeContext = createContext();

/* =====================
   LAYOUT
===================== */
function Layout() {
  const location = useLocation();
  const { pageLoading, setPageLoading } = useContext(PageLoaderContext);
  const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);

  useEffect(() => {
    setPageLoading(true);

    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {location.pathname === "/menu" ? <MenuNav /> : <HomeNav />}

      {/* PAGE LOADER */}
       {/* ORDER SECTION */}
      <div class="offcanvas offcanvas-end" data-bs-scroll="true" tabindex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasWithBothOptionsLabel">ORDER SUMMARY</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          {cartItems.length === 0 ? (
            <p>Looks like you have not placed an order yet. Do you want to <a href="/menu" style={{color:"black",fontWeight:500}}>place order</a>?</p>
          ) : (
            <>
              <div className='ordered-item-box'>
                {cartItems.map((item) => (
                  <div key={item._id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
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
            <input type='text' placeholder='Type coupon code here'/>
            <p>Apply</p>
          </div>
          <div className='checkout-btn'>
            <a href="/cart"><p>Checkout</p></a>
            <p>GHC {getTotalPrice().toFixed(2)}</p>
          </div>
        </div>
      </div>
      {/* END */}
      {pageLoading && <GlobalLoader />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/storelocation" element={<StoreLocation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/cart" element={<Cart />} />

        <Route element={<DontShowLoginRegister />}>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>

      <Footer />
    </>
  );
}

/* =====================
   APP
===================== */
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
