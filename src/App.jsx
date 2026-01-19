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
      </PageLoaderProvider>
    </ThemeContext.Provider>
  );
}

export default App;
