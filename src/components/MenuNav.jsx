import zestylogo from '../images/zestylogo.png'
import { IsLoginSuccess, IsLogout } from './IsAuth';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

function MenuNav() {
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
                                <a className="nav-link" href="/search">Search</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/storelocation">Location</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/contact">Contact</a>
                            </li>
                            <li className="nav-item">
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

export default MenuNav;
