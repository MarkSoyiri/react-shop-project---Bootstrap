import logo from '../images/kfclogo.png'
import account from '../images/account.png'
import xlogo from '../images/x.png'
import zestylogo from '../images/zestylogo.png'
import { IsLoginSuccess,IsLogout } from '../components/IsAuth';




function MenuNav () {

    return (
        <>
        <div class="fixed-top">
            <nav class="navbar navbar-expand-lg bg-body-tertiary my-nav">
                <div class="container-fluid ">
                <a class="navbar-brand" href="/"><img className='logo' src={zestylogo} alt="" /></a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon resive-navbar-toggle-icon-resize"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarText">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="/menu">Menu</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/storelocation">Location</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/contact">Contact</a>
                    </li>
                    <IsLoginSuccess>
                   
                    </IsLoginSuccess>
                    </ul>
                    <span class="navbar-text">
                    <IsLogout>
                        {/* LOGOUT CONTENT */}
                    </IsLogout>

                    </span>
                </div>
                </div>

              
            </nav>

            

            <div class="mb-5">
                <nav id="navbar-example2" class="">
  
                    <div className=" my-view">
                        
                        <a class="" href="#scrollspyHeading1">PROMOTIONS</a>
                        
                        
                        <a class="" href="#scrollspyHeading2">MEALS</a>
                        
                        
                        <a class="" href="#scrollspyHeading3">BURGERS</a>
                        
                        
                        <a class="" href="#scrollspyHeading4">DESSERTS</a>
                        
                        
                        {/* <a class="" href="#scrollspyHeading5">DEALS</a> */}
                        
                        
                    </div>
                </nav>
            </div>
        </div>
        
           
            
        </>
    );
}

export default MenuNav