import { useState,createContext,useContext } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import { HomeNav,StoreLocationNav,Footer } from './components/NavFooter'
import Menu from './pages/Menu'
import Login from './pages/Login'
import StoreLocation from './pages/StoreLocation'
import Contact from './pages/Contact'
import UserProfile from './pages/Account'
import MenuNav from './components/MenuNav'
import Cart from './pages/Cart'
import { useLocation } from 'react-router-dom'
import { DontShowLoginRegister } from './components/IsAuth'
// import { AuthContext } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext.jsx'
import useAxiosLoader from './api/useAxiosLoader'




function Layout(){
  const location = useLocation();
  


  return(
    <>
      {location.pathname === "/menu" ? <MenuNav/> : <HomeNav/>}

      {/* ORDER SECTION */}
      <div class="offcanvas offcanvas-end" data-bs-scroll="true" tabindex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasWithBothOptionsLabel">ORDER SUMMARY</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <p>Looks like you have not placed an order yet. Do you want to <a href="/menu" style={{color:"black",fontWeight:500}}>place order</a>?</p>
          <div className='ordered-item-box'>

          </div>
          <div className='coupon-btn'>
            <input type='text' placeholder='Type coupon code here'/>
            <p>Apply</p>

          </div>
          <div className='checkout-btn'>
            <a href="#"><p>Checkout</p></a>
            <p>GHC 0.00</p>

          </div>
        </div>
      </div>
      {/* END */}

     
      {/* <LoadingScreen/> */}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/menu' element={<Menu/>}/>
        <Route path='/storelocation' element={<StoreLocation/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/userprofile' element={<UserProfile/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route element={<DontShowLoginRegister/>}>
          <Route path='/login' element={<Login/>}/>
        </Route>
      </Routes>
      <Footer/>
      
    </>
  )
}

export const ThemeContext = createContext();

function App(){

  const [Theme,SetTheme] = useState("Light");
  function toggleTheme(){
    const updated = Theme == "Light" ? SetTheme("Dark") : SetTheme("Light");
  }

  const { isLoading } = useContext(LoadingContext);

  useAxiosLoader();

  return(
    <div style={{backgroundColor:Theme == "Light" ? "white" : "black"}}>
    <ThemeContext.Provider value={{Theme,toggleTheme}}>
      {isLoading && <GlobalLoader />}
    <AuthProvider>
    <BrowserRouter>
      <Layout/>
    </BrowserRouter>
    </AuthProvider>
    
    </ThemeContext.Provider>
    </div>
  )
}

export default App