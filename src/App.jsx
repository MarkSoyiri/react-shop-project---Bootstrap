import React from 'react'
import "./Custom.css"
import Nav from './component/Nav'
import Home from './pages/Home'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import NotFound from './pages/NotFound'
import Contact from './pages/Contact'
import About from './pages/About'
import Login from './pages/Login'
import Footer from './component/Footer'
import Register from './pages/Register'
import AmazonSecondaryNav from './component/AmazonSecondaryNav'
import { IsUserAuthenticated,LoginVerified,LogoutVerified } from './component/AuthenticatedRoute'


function App() {


 

 

  return (
    <>
   <Router>

  
   <Nav/>
   <AmazonSecondaryNav/>


    <Routes>
      
      <Route element={<LoginVerified/>}>
      <Route path='/'  element={<Home/>} />
      </Route>

      <Route path='/contact'  element={<Contact/>} />
      <Route path='/about'  element={<About/>} />

      <Route element={<LogoutVerified/>}>
        <Route path='/login'  element={<Login/>} />
        <Route path='/register'  element={<Register/>} />
      </Route>

      <Route path='*'  element={<NotFound></NotFound>} />
    


    </Routes>
    
    <Footer/>
   </Router>
    </>
  )
}

export default App
