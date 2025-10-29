import logo from '../images/kfclogo.png'
import account from '../images/account.png'
import xlogo from '../images/x.png'
import zestylogo from '../images/zestylogo.png'



//NAVBAR//
// export function HomeNav () {

//     return (
//         <>
//             <div className='fullNav'>
//                 <div className="NavFooterContainer">
//                     <div className="nav-top">
//                         <ul>
//                             <a href="/"><img className='logo' src={zestylogo} alt="logo image"  /></a>
//                             <li>
//                                 <a href="/menu" className='OM'>OUR MENU</a>
//                                 <a href="/storelocation" className='SL'>STORE LOCATION</a>
//                                 <a href="/contact" className='CW'>COUPON WALLET</a>
//                             </li>
//                         </ul>

//                         <a style={{color:"black",textDecoration:"none"}} href="/login"><span className='signIn'><img className='acc-img' src={account} alt="account image" />Sign In</span></a>

//                     </div>
//                     <div className="nav-bottom">
//                         <div className='leftSide'>
//                             <h1><span style={{color:"red"}}>TASTE THE</span> <span style={{color:"gold"}}>FIRE, FEEL</span> <span style={{color:"green"}}>THE RYTHM!!!</span></h1>
//                             <p>Delivery & Pick up now available!</p>
//                         </div>

//                         <div className="rightSide">
//                             <h1>CALL 0507478237 TO ORDER NOW!!!</h1>
//                             <div className='stripeBox'>
//                                 <div className='stripe' style={{background:"red"}}/>
//                                 <div className='stripe'style={{background:"yellow"}}/>
//                                 <div className='stripe' style={{background:"green"}}/>
//                             </div>
                            
//                         </div>

//                     </div>

//                 </div>
            
//             </div>
            
//         </>
//     );
// }


export function HomeNav () {

    return (
        <>
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
                        <a class="nav-link" href="/storelocation">Store Location</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/contact">Contact</a>
                    </li>
                    </ul>
                    <span class="navbar-text">
                    <a style={{color:"black",textDecoration:"none"}} href="/login"><span className='signIn'><img className='acc-img' src={account} alt="account image" />Sign In</span></a>

                    </span>
                </div>
                </div>
            </nav>

            
            
        </>
    );
}


export function StoreLocationNav () {

    return (
        <>
            <div className='fullNav'>
                <div className="NavFooterContainer">
                    <div className="nav-top">
                        <ul>
                            <a href="/"><img className='logo' src={logo} alt="logo image"  /></a>
                            <li>
                                <a href="/menu">OUR MENU</a>
                                <a href="">STORE LOCATION</a>
                                <a href="">COUPON WALLET</a>
                            </li>
                        </ul>

                        <a style={{color:"black",textDecoration:"none"}} href="/login"><span className='signIn'><img className='acc-img' src={account} alt="account image" />Sign In</span></a>

                    </div>

                </div>
            
            </div>
            
        </>
    );
}




//FOOTER//
export function Footer () {

    return (
        <>
            <div className="footer">
                <div className="NavFooterContainer">
                    <div className="footerTop">
                        <div className="linkBox">
                            <a href="/"><img className='footerLogo' src={zestylogo} alt="logo" /></a>
                        </div>
                        <div className="linkBox">
                            <ul>Zesty
                                <li><a href="/menu">Our Menu</a></li>
                                
                            </ul>
                        </div>
                        <div className="linkBox">
                            <ul>Contact Zesty 
                                <li><a href="">Contact Us</a></li>
                                
                                
                            </ul>
                        </div>
                        <div className="linkBox">
                            <ul>Legal
                                <li><a href="">Terms of Use</a></li>
                                
                            </ul>
                        </div>
                        <div className="linkBox">
                            <ul>Store Locations
                                <li><a href="">Find a Zesty</a></li>
                                
                            </ul>
                        </div>
                        <div className="linkBox" style={{textAlign:"center"}}>
                            <p>Follow us:</p>
                            <div className="socialsLink">
                                <a href=""><img className='sImage' src={xlogo} alt="xlogo" /></a>
                                <a href=""><img className='sImage' src={xlogo} alt="xlogo" /></a>
                                <a href=""><img className='sImage' src={xlogo} alt="xlogo" /></a>
                                <a href=""><img className='sImage' src={xlogo} alt="xlogo" /></a>
                            </div>
                        </div>
                        
                    </div>
                    <div className="footerBottom">
                        <p>Copyright &copy; Zesty Cave Restaurant 2025</p>
                        
                    </div>
                </div>
            </div>
        </>
    );
}