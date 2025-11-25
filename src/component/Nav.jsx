import React from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
    const navStyles = {
        navbar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: '#333',
            color: 'white',
        },
        navbarBrand: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
        },
        navbarLinks: {
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
        },
        link: {
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            margin: '0 0.5rem',
        }
    };

    return (
        <nav style={navStyles.navbar}>
            <div style={navStyles.navbarBrand}>
                <Link to="/" style={navStyles.link}>BrandName</Link>
            </div>
            <ul style={navStyles.navbarLinks}>
                <li><Link to="/" style={navStyles.link}>Home</Link></li>
                <li><Link to="/about" style={navStyles.link}>About</Link></li>
                <li><Link to="/services" style={navStyles.link}>Services</Link></li>
                <li><Link to="/contact" style={navStyles.link}>Contact</Link></li>
            </ul>
        </nav>
    );
};

export default Nav;