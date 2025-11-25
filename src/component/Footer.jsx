import React from 'react';

const Footer = () => {
    const footerStyles = {
        backgroundColor: '#333',
        color: 'white',
        padding: '2rem 0',
    };

    const footerContentStyles = {
        display: 'flex',
        justifyContent: 'space-around',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap',
    };

    const footerSectionStyles = {
        flex: '1',
        margin: '1rem',
        minWidth: '250px',
    };

    const socialLinksStyles = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    };

    const linkStyles = {
        color: 'white',
        textDecoration: 'none',
    };

    const footerBottomStyles = {
        textAlign: 'center',
        marginTop: '2rem',
        padding: '1rem 0',
        borderTop: '1px solid #555',
    };

    return (
        <footer style={footerStyles}>
            <div style={footerContentStyles}>
                <div style={footerSectionStyles}>
                    <h4>About Us</h4>
                    <p>Your trusted payment solution partner</p>
                </div>
                <div style={footerSectionStyles}>
                    <h4>Contact</h4>
                    <p>Email: support@example.com</p>
                    <p>Phone: +1 234 567 890</p>
                </div>
                <div style={footerSectionStyles}>
                    <h4>Follow Us</h4>
                    <div style={socialLinksStyles}>
                        <a href="https://facebook.com" style={linkStyles}>Facebook</a>
                        <a href="https://twitter.com" style={linkStyles}>Twitter</a>
                        <a href="https://linkedin.com" style={linkStyles}>LinkedIn</a>
                    </div>
                </div>
            </div>
            <div style={footerBottomStyles}>
                <p>&copy; {new Date().getFullYear()} UPI React. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;