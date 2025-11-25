import React from 'react';

const Coverpage = () => {
    const styles = {
        coverContainer: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            padding: '20px'
        },
        coverContent: {
            textAlign: 'center',
            color: 'white',
            maxWidth: '1200px',
            padding: '40px'
        },
        coverTitle: {
            fontSize: '3.5rem',
            marginBottom: '1rem'
        },
        coverSubtitle: {
            fontSize: '1.5rem',
            marginBottom: '3rem'
        },
        coverFeatures: {
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '3rem'
        },
        featureItem: {
            flex: '1',
            minWidth: '250px',
            padding: '20px'
        },
        coverCta: {
            padding: '15px 30px',
            fontSize: '1.2rem',
            backgroundColor: 'white',
            color: '#6366f1',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            ':hover': {
                transform: 'scale(1.05)'
            }
        }
    };

    return (
        <div style={styles.coverContainer}>
            <div style={styles.coverContent}>
                <h1 style={styles.coverTitle}>Welcome to Our App</h1>
                <p style={styles.coverSubtitle}>Your One-Stop Solution for Digital Payments</p>
                <div style={styles.coverFeatures}>
                    <div style={styles.featureItem}>
                        <i className="fas fa-shield-alt"></i>
                        <h3>Secure Payments</h3>
                        <p>End-to-end encrypted transactions</p>
                    </div>
                    <div style={styles.featureItem}>
                        <i className="fas fa-bolt"></i>
                        <h3>Instant Transfer</h3>
                        <p>Quick and hassle-free payments</p>
                    </div>
                    <div style={styles.featureItem}>
                        <i className="fas fa-users"></i>
                        <h3>User Friendly</h3>
                        <p>Simple and intuitive interface</p>
                    </div>
                </div>
                <button style={styles.coverCta}>Get Started</button>
            </div>
        </div>
    );
};

export default Coverpage;