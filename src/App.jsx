import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import { HomeNav,StoreLocationNav,Footer } from './components/NavFooter'
import Menu from './pages/Menu'
import Login from './pages/Login'
import StoreLocation from './pages/StoreLocation'
import Contact from './pages/Contact'

function App() {
  

  return (
    <>
      <HomeNav/>
        <Router>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/menu' element={<Menu/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/storelocation' element={<StoreLocation/>}/>
            <Route path='/contact' element={<Contact/>}/>
          </Routes>
        </Router>
      <Footer/>
    </>
  )
}

export default App
