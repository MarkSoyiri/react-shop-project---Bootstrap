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
import { PageLoaderContext } from "./context/PageLoaderContext";
import GlobalLoader from "./components/GlobalLoader";

/* =======================
   THEME CONTEXT
======================= */
export const ThemeContext = createContext();

/* =======================
   LAYOUT
======================= */
function Layout() {
  const location = useLocation();
  const { pageLoading, setPageLoading } = useContext(PageLoaderContext);

  useEffect(() => {
    setPageLoading(true);

    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location.pathname, setPageLoading]);

  return (
    <>
      {/* NAV */}
      {location.pathname === "/menu" ? <MenuNav /> : <HomeNav />}

      {/* ORDER OFFCANVAS */}
      <div
        className="offcanvas offcanvas-end"
        data-bs-scroll="true"
        tabIndex="-1"
        id="offcanvasWithBothOptions"
        aria-labelledby="offcanvasWithBothOptionsLabel"
      >
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title"
            id="offcanvasWithBothOptionsLabel"
          >
            ORDER SUMMARY
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body">
          <p>
            Looks like you have not placed an order yet. Do you want to{" "}
            <a href="/menu" style={{ color: "black", fontWeight: 500 }}>
              place order
            </a>
            ?
          </p>

          <div className="ordered-item-box"></div>

          <div className="coupon-btn">
            <input type="text" placeholder="Type coupon code here" />
            <p>Apply</p>
          </div>

          <div className="checkout-btn">
            <a href="#">
              <p>Checkout</p>
            </a>
            <p>GHC 0.00</p>
          </div>
        </div>
      </div>

      {/* PAGE LOADER */}
      {pageLoading && <GlobalLoader />}

      {/* ROUTES */}
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

/* =======================
   APP
======================= */
function App() {
  const [theme, setTheme] = useState("Light");

  const toggleTheme = () => {
    setTheme(prev => (prev === "Light" ? "Dark" : "Light"));
  };

  const { isLoading } = useContext(LoadingContext);

  useAxiosLoader();

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        style={{
          backgroundColor: theme === "Light" ? "#fff" : "#000",
          minHeight: "100vh",
        }}
      >
        {/* API LOADER */}
        {isLoading && <GlobalLoader />}

        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;