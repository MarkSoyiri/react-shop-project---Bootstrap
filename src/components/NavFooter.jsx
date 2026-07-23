import zestylogo from '../images/zestylogo.png'
import xlogo from '../images/x.png'
import { IsLogout } from './IsAuth';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function HomeNav () {
    const { cartItems } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="fixed-top">
            <nav className="navbar navbar-expand-lg bg-body-tertiary my-nav">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        <img className='logo' src={zestylogo} alt="Zesty Cave" />
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarText" aria-controls="navbarText"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarText">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/menu">Menu</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/search">Search</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/storelocation">Store Location</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/contact">Contact</Link>
                            </li>
                            <li className="nav-item position-relative">
                                <Link className="nav-link" to="/cart">
                                    Cart
                                    {cartCount > 0 && (
                                        <span className="badge bg-danger ms-1" style={{ fontSize: '11px' }}>
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                            {user && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/wishlist">Wishlist</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/orders">Orders</Link>
                                    </li>
                                </>
                            )}
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
                            <li><Link to="/menu">Our Menu</Link></li>
                            <li><Link to="/storelocation">Store Locations</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                        </ul>
                    </div>
                    <div className="linkBox">
                        <ul>Account
                            <li><Link to="/userprofile">My Profile</Link></li>
                            <li><Link to="/orders">Order History</Link></li>
                            <li><Link to="/wishlist">Wishlist</Link></li>
                            <li><Link to="/cart">My Cart</Link></li>
                        </ul>
                    </div>
                    <div className="linkBox">
                        <ul>Contact
                            <li><Link to="/contact">Customer Support</Link></li>
                            <li><a href="mailto:info@zestycave.com">info@zestycave.com</a></li>
                            <li><a href="tel:+233507478237">+233 507 478 237</a></li>
                        </ul>
                    </div>
                    <div className="linkBox">
                        <ul>Legal
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footerBottom">
                    <div className="follow-us">
                        <p>Follow us:</p>
                        <div className="socialsLink">
                            <a href="https://twitter.com/zestycave" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><img className='sImage' src={xlogo} alt="twitter" /></a>
                            <a href="https://facebook.com/zestycave" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><img className='sImage' src={xlogo} alt="facebook" /></a>
                            <a href="https://instagram.com/zestycave" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img className='sImage' src={xlogo} alt="instagram" /></a>
                        </div>
                    </div>
                    <p>&copy; {new Date().getFullYear()} Zesty Cave Restaurant. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
