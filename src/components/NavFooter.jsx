import zestylogo from '../images/zestylogo.png'
import xlogo from '../images/x.png'
import { IsLoginSuccess, IsLogout } from './IsAuth';
import { CartContext } from '../context/CartContext';
import { useContext } from 'react';

export function HomeNav () {
    const { cartItems } = useContext(CartContext);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="fixed-top">
            <nav className="navbar navbar-expand-lg bg-body-tertiary my-nav">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img className='logo' src={zestylogo} alt="Zesty Cave" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarText" aria-controls="navbarText"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarText">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" href="/menu">Menu</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/storelocation">Store Location</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/contact">Contact</a>
                            </li>
                            <li className="nav-item position-relative">
                                <a className="nav-link" href="/cart">
                                    Cart
                                    {cartCount > 0 && (
                                        <span className="badge bg-danger ms-1" style={{ fontSize: '11px' }}>
                                            {cartCount}
                                        </span>
                                    )}
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" type="button" data-bs-toggle="offcanvas"
                                    data-bs-target="#offcanvasWithBothOptions"
                                    aria-controls="offcanvasWithBothOptions">
                                    My Order
                                </a>
                            </li>
                            <IsLoginSuccess />
                        </ul>
                        <span className="navbar-text">
                            <IsLogout />
                        </span>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export function Footer () {
    return (
        <div className="footer">
            <div className="container-lg">
                <div className="footerTop">
                    <div className="linkBox">
                        <ul>Zesty
                            <li><a href="/menu">Our Menu</a></li>
                            <li><a href="/storelocation">Store Locations</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                        </ul>
                    </div>
                    <div className="linkBox">
                        <ul>Contact
                            <li><a href="/contact">Customer Support</a></li>
                            <li><a href="mailto:info@zestycave.com">info@zestycave.com</a></li>
                        </ul>
                    </div>
                    <div className="linkBox">
                        <ul>Legal
                            <li><a href="">Privacy Policy</a></li>
                            <li><a href="">Terms of Use</a></li>
                        </ul>
                    </div>
                    <div className="linkBox">
                        <ul>Location
                            <li><a href="/storelocation">Find a Zesty</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footerBottom">
                    <div className="follow-us">
                        <p>Follow us:</p>
                        <div className="socialsLink">
                            <a href="" aria-label="Twitter"><img className='sImage' src={xlogo} alt="twitter" /></a>
                            <a href="" aria-label="Facebook"><img className='sImage' src={xlogo} alt="facebook" /></a>
                            <a href="" aria-label="Instagram"><img className='sImage' src={xlogo} alt="instagram" /></a>
                        </div>
                    </div>
                    <p>&copy; {new Date().getFullYear()} Zesty Cave Restaurant. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
