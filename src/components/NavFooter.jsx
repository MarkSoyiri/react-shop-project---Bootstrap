import zestylogo from '../images/zestylogo.png'
import { IsLogout } from './IsAuth';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function HomeNav () {
    const { cartItems } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { to: '/menu', label: 'Menu' },
        { to: '/search', label: 'Search' },
        { to: '/storelocation', label: 'Store Location' },
        { to: '/contact', label: 'Contact' },
    ];

    return (
        <>
            <style>{responsiveNavCSS}</style>
            <nav className="zc-nav" style={styles.navbar}>
                <div style={styles.navInner}>
                    <Link to="/" style={styles.logoLink}>
                        <img style={styles.logo} src={zestylogo} alt="Zesty Cave" />
                    </Link>

                    <button
                        className="zc-nav-hamburger"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={styles.hamburger}
                        aria-label="Toggle navigation"
                    >
                        <span style={{ ...styles.hamburgerLine, transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
                        <span style={{ ...styles.hamburgerLine, opacity: mobileOpen ? 0 : 1 }} />
                        <span style={{ ...styles.hamburgerLine, transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
                    </button>

                    <div className="zc-nav-collapse" style={styles.navCollapse}>
                        <ul style={styles.navList}>
                            {navLinks.map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to} style={{
                                        ...styles.navLink,
                                        ...(isActive(link.to) ? styles.navLinkActive : {})
                                    }}>{link.label}</Link>
                                </li>
                            ))}
                            <li style={{ position: 'relative' }}>
                                <Link to="/cart" style={{
                                    ...styles.navLink,
                                    ...(isActive('/cart') ? styles.navLinkActive : {})
                                }}>
                                    Cart
                                    {cartCount > 0 && (
                                        <span style={styles.cartBadge}>{cartCount}</span>
                                    )}
                                </Link>
                            </li>
                            {user && (
                                <>
                                    <li><Link to="/wishlist" style={{
                                        ...styles.navLink,
                                        ...(isActive('/wishlist') ? styles.navLinkActive : {})
                                    }}>Wishlist</Link></li>
                                    <li><Link to="/orders" style={{
                                        ...styles.navLink,
                                        ...(isActive('/orders') ? styles.navLinkActive : {})
                                    }}>Orders</Link></li>
                                </>
                            )}
                            {user?.role === 'admin' && (
                                <li><Link to="/admin" style={{
                                    ...styles.adminLink,
                                    ...(isActive('/admin') ? styles.adminLinkActive : {})
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                                    </svg>
                                    Admin
                                </Link></li>
                            )}
                        </ul>
                        {user ? (
                            <Link to="/userprofile" style={styles.profileBtn}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span>Profile</span>
                            </Link>
                        ) : (
                            <span style={styles.authArea}>
                                <IsLogout />
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            {mobileOpen && (
                <div className="zc-mobile-menu" style={styles.mobileMenu}>
                    <div style={styles.mobileMenuInner}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    ...styles.mobileLink,
                                    ...(isActive(link.to) ? styles.mobileLinkActive : {})
                                }}
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link to="/cart" style={{
                            ...styles.mobileLink,
                            ...(isActive('/cart') ? styles.mobileLinkActive : {})
                        }} onClick={() => setMobileOpen(false)}>
                            Cart {cartCount > 0 && <span style={styles.cartBadgeMobile}>{cartCount}</span>}
                        </Link>
                        {user && (
                            <>
                                <Link to="/wishlist" style={{
                                    ...styles.mobileLink,
                                    ...(isActive('/wishlist') ? styles.mobileLinkActive : {})
                                }} onClick={() => setMobileOpen(false)}>Wishlist</Link>
                                <Link to="/orders" style={{
                                    ...styles.mobileLink,
                                    ...(isActive('/orders') ? styles.mobileLinkActive : {})
                                }} onClick={() => setMobileOpen(false)}>Orders</Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" style={{
                                        ...styles.mobileLink,
                                        ...(isActive('/admin') ? styles.mobileLinkActive : {})
                                    }} onClick={() => setMobileOpen(false)}>
                                        Admin Panel
                                    </Link>
                                )}
                                <Link to="/userprofile" style={{
                                    ...styles.mobileLink,
                                    ...(isActive('/userprofile') ? styles.mobileLinkActive : {})
                                }} onClick={() => setMobileOpen(false)}>Profile</Link>
                            </>
                        )}
                        {!user && (
                            <div style={{ marginTop: 8 }}>
                                <IsLogout />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export function Footer () {
    const [email, setEmail] = useState('');

    return (
        <>
            <style>{responsiveFooterCSS}</style>
            <footer style={styles.footer}>
                <div style={styles.footerInner}>
                    <div className="zc-footer-grid" style={styles.footerGrid}>
                        <div>
                            <h4 style={styles.footerHeading}>Zesty</h4>
                            <ul style={styles.footerLinks}>
                                <li><Link to="/menu" style={styles.footerLink}>Our Menu</Link></li>
                                <li><Link to="/storelocation" style={styles.footerLink}>Store Locations</Link></li>
                                <li><Link to="/contact" style={styles.footerLink}>Contact Us</Link></li>
                                <li><Link to="/faq" style={styles.footerLink}>FAQ</Link></li>
                            </ul>
                            <div style={{ marginTop: 20 }}>
                                <p style={{ fontSize: 13, marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Stay Updated</p>
                                <div style={{ display: 'flex' }}>
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={styles.newsletterInput}
                                    />
                                    <button style={styles.newsletterBtn}>Subscribe</button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={styles.footerHeading}>Account</h4>
                            <ul style={styles.footerLinks}>
                                <li><Link to="/userprofile" style={styles.footerLink}>My Profile</Link></li>
                                <li><Link to="/orders" style={styles.footerLink}>Order History</Link></li>
                                <li><Link to="/wishlist" style={styles.footerLink}>Wishlist</Link></li>
                                <li><Link to="/cart" style={styles.footerLink}>My Cart</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={styles.footerHeading}>Contact</h4>
                            <ul style={styles.footerLinks}>
                                <li><Link to="/contact" style={styles.footerLink}>Customer Support</Link></li>
                                <li><a href="mailto:info@zestycave.com" style={styles.footerLink}>info@zestycave.com</a></li>
                                <li><a href="tel:+233507478237" style={styles.footerLink}>+233 507 478 237</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={styles.footerHeading}>Legal</h4>
                            <ul style={styles.footerLinks}>
                                <li><Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link></li>
                                <li><Link to="/terms" style={styles.footerLink}>Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div style={styles.footerBottom}>
                        <p style={styles.copyright}>&copy; {new Date().getFullYear()} Zesty Cave Restaurant. All rights reserved.</p>
                        <div style={styles.socialRow}>
                            <a href="https://twitter.com/zestycave" target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={styles.socialIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                            <a href="https://facebook.com/zestycave" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={styles.socialIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a href="https://instagram.com/zestycave" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={styles.socialIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div style={styles.bottomGradient} />
            </footer>
        </>
    );
}

const responsiveNavCSS = `
  .zc-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
  .zc-nav-hamburger { display: none; }
  @media (max-width: 992px) {
    .zc-nav-hamburger { display: flex; }
    .zc-nav-collapse { display: none !important; }
    .zc-mobile-menu { display: block !important; }
  }
`;

const responsiveFooterCSS = `
  .zc-footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
  @media (max-width: 768px) { .zc-footer-grid { grid-template-columns: repeat(2, 1fr); gap: 28px; } }
  @media (max-width: 576px) { .zc-footer-grid { grid-template-columns: 1fr; } }
`;

const styles = {
    navbar: {
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '1px solid var(--color-border-light)',
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        transition: 'all var(--transition)',
    },
    navInner: {
        width: '100%',
        maxWidth: 'var(--container-xl)',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoLink: {
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
    },
    logo: {
        height: 42,
        width: 'auto',
        objectFit: 'contain',
        transition: 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    hamburger: {
        flexDirection: 'column',
        gap: 5,
        padding: 8,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        zIndex: 10,
    },
    hamburgerLine: {
        display: 'block',
        width: 22,
        height: 2,
        background: 'var(--color-text)',
        borderRadius: 2,
        transition: 'all var(--transition)',
    },
    navCollapse: {
        display: 'flex',
        alignItems: 'center',
        gap: 32,
    },
    navList: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        listStyle: 'none',
        margin: 0,
        padding: 0,
    },
    navLink: {
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--color-text)',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        textDecoration: 'none',
        transition: 'all var(--transition)',
        whiteSpace: 'nowrap',
        position: 'relative',
        display: 'inline-block',
    },
    navLinkActive: {
        background: 'rgba(232, 93, 4, 0.12)',
        color: 'var(--color-brand)',
        fontWeight: 600,
    },
    profileBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 20px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-brand)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'all var(--transition)',
        whiteSpace: 'nowrap',
    },
    cartBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        background: 'var(--color-brand)',
        color: 'white',
        fontSize: 10,
        fontWeight: 700,
        minWidth: 18,
        height: 18,
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px',
        lineHeight: 1,
    },
    authArea: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    mobileMenu: {
        position: 'fixed',
        top: 'var(--navbar-height)',
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 999,
        animation: 'fadeDown 0.3s ease-out',
    },
    mobileMenuInner: {
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
    },
    mobileLink: {
        display: 'block',
        padding: '12px 16px',
        fontSize: 15,
        fontWeight: 500,
        color: 'var(--color-text)',
        textDecoration: 'none',
        borderRadius: 'var(--radius-sm)',
        transition: 'all var(--transition)',
    },
    mobileLinkActive: {
        background: 'rgba(232, 93, 4, 0.12)',
        color: 'var(--color-brand)',
        fontWeight: 600,
    },
    cartBadgeMobile: {
        background: 'var(--color-brand)',
        color: 'white',
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        marginLeft: 8,
    },
    adminLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 13,
        fontWeight: 600,
        color: '#fff',
        background: 'var(--color-brand)',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        textDecoration: 'none',
        transition: 'all var(--transition)',
        whiteSpace: 'nowrap',
    },
    adminLinkActive: {
        background: 'var(--color-brand-dark)',
    },
    footer: {
        background: '#111827',
        color: 'rgba(255,255,255,0.6)',
        marginTop: 80,
        position: 'relative',
    },
    footerInner: {
        maxWidth: 'var(--container-xl)',
        margin: '0 auto',
        padding: '60px 24px 32px',
    },
    footerHeading: {
        color: 'white',
        fontSize: 15,
        fontWeight: 700,
        marginBottom: 16,
    },
    footerLinks: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    footerLink: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        textDecoration: 'none',
        transition: 'color var(--transition)',
    },
    footerBottom: {
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
    },
    copyright: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
        margin: 0,
    },
    socialRow: {
        display: 'flex',
        gap: 12,
    },
    socialIcon: {
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-full)',
        background: 'rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)',
        transition: 'all var(--transition)',
        textDecoration: 'none',
    },
    bottomGradient: {
        height: 3,
        background: 'linear-gradient(90deg, var(--color-brand-dark), var(--color-brand), var(--color-brand-light), var(--color-brand), var(--color-brand-dark))',
    },
    newsletterInput: {
        flex: 1,
        padding: '8px 12px',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRight: 'none',
        borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
        background: 'rgba(255,255,255,0.06)',
        color: 'white',
        fontSize: 13,
        outline: 'none',
        minWidth: 0,
    },
    newsletterBtn: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
        background: 'var(--color-brand)',
        color: 'white',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background var(--transition)',
    },
};
