import { Card, MiniCard } from '../components/Card';
import About from '../components/About';
import zestybanner from '../images/zestybanner.jpg';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosFetch from '../api/axiosFetchAPI';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

function Home() {
    const [featured, setFeatured] = useState([]);
    const [popular, setPopular] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            axiosFetch.get('/api/menu?featured=true&limit=4').catch(() => ({ data: { items: [] } })),
            axiosFetch.get('/api/menu?popular=true&limit=4').catch(() => ({ data: { items: [] } })),
            axiosFetch.get('/api/menu?limit=8').catch(() => ({ data: { items: [] } }))
        ]).then(([featuredRes, popularRes, allRes]) => {
            const fItems = featuredRes.data.items || featuredRes.data || [];
            const pItems = popularRes.data.items || popularRes.data || [];
            const allItems = allRes.data.items || allRes.data || [];
            setFeatured(fItems.length > 0 ? fItems : allItems.slice(0, 4));
            setPopular(pItems.length > 0 ? pItems : allItems.slice(0, 4));
            setReviews([]);
        }).finally(() => setLoading(false));
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) { setSubscribed(true); setEmail(''); }
    };

    return (
        <>
            <div className="hero-section">
                <div className="hero-overlay"></div>
                <img className="hero-banner" src={zestybanner} alt="Zesty Cave" />
                <div className="hero-content">
                    <span className="hero-tag">Welcome to Zesty Cave</span>
                    <h1 className="hero-title">Crave it.<br/>Order it.<br/>Love it.</h1>
                    <p className="hero-subtitle">Premium fast food crafted with bold flavors and fresh ingredients. Order online for delivery or pickup.</p>
                    <div className="hero-actions">
                        <button className="hero-btn hero-btn-primary" onClick={() => navigate('/menu')}>Order Now</button>
                        <button className="hero-btn hero-btn-outline" onClick={() => navigate('/menu')}>View Menu</button>
                    </div>
                </div>
            </div>

            <div className="container-lg">
                <div className="section-header">
                    <h2>Featured Items</h2>
                    <a href="/menu" className="section-link">View All →</a>
                </div>
                {loading ? <Loader /> : (
                    <div className="foodBox">
                        <Card products={featured} />
                    </div>
                )}
            </div>

            <div className="container-lg">
                <div className="section-header">
                    <h2>Most Popular</h2>
                    <a href="/menu" className="section-link">View All →</a>
                </div>
                {loading ? <Loader /> : (
                    <div className="foodBox">
                        <Card products={popular} />
                    </div>
                )}
            </div>

            <div className="container-lg">
                <div className="section-header">
                    <h2>Explore Our Menu</h2>
                </div>
                <MiniCard />
            </div>

            <div className="cta-section">
                <div className="container-lg">
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2>Get 20% Off Your First Order</h2>
                            <p>Use code <strong>ZESTY20</strong> at checkout. New customers only.</p>
                            <button className="hero-btn hero-btn-primary" onClick={() => navigate('/menu')}>Order Now</button>
                        </div>
                        <div className="cta-visual">
                            <span className="cta-emoji">🍔</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-lg">
                <About />
            </div>

            <div className="newsletter-section">
                <div className="container-lg">
                    <div className="newsletter-content">
                        <h3>Stay in the Loop</h3>
                        <p>Get exclusive deals, new menu drops, and seasonal specials straight to your inbox.</p>
                        {subscribed ? (
                            <div className="newsletter-success">Thanks for subscribing!</div>
                        ) : (
                            <form className="newsletter-form" onSubmit={handleSubscribe}>
                                <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                                <button type="submit">Subscribe</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
