import { Card } from '../components/Card';
import HeroTitle from '../components/HeroTitle';
import zestybanner from '../images/zestybanner.jpg';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import axiosFetch from '../api/axiosFetchAPI';
import Loader from '../components/Loader';
import './Home.css';

const categories = [
    { key: 'burgers', name: 'Burgers', emoji: '🍔' },
    { key: 'meals', name: 'Meals', emoji: '🍛' },
    { key: 'combos', name: 'Combos', emoji: '🍱' },
    { key: 'sides', name: 'Sides', emoji: '🍟' },
    { key: 'desserts', name: 'Desserts', emoji: '🍰' },
    { key: 'drinks', name: 'Drinks', emoji: '🥤' },
    { key: 'value deals', name: 'Value Deals', emoji: '🏷️' },
    { key: 'promotions', name: 'Promotions', emoji: '🔥' },
];

const testimonials = [
    {
        name: 'Kofi A.',
        role: 'Foodie & Regular',
        text: 'Zesty Cave never misses! The burgers are always fresh and the delivery is super fast. My go-to spot for late-night cravings.',
        rating: 5,
    },
    {
        name: 'Ama D.',
        role: 'Happy Customer',
        text: 'Best value deals in town. The combo meals are generous and the flavors are on another level. Highly recommend the shawarma!',
        rating: 5,
    },
    {
        name: 'Kwame M.',
        role: 'Loyal Fan',
        text: 'I order from Zesty Cave at least twice a week. Consistent quality, great prices, and the app is so easy to use. 10/10!',
        rating: 4,
    },
];

const features = [
    { emoji: '🌿', title: 'Fresh Ingredients', desc: 'We source the freshest local ingredients to craft every meal with care and quality.' },
    { emoji: '🚀', title: 'Fast Delivery', desc: 'Lightning-fast delivery to your doorstep. Hot food, every time.' },
    { emoji: '💰', title: 'Best Prices', desc: 'Premium taste without breaking the bank. Unbeatable value deals daily.' },
    { emoji: '📞', title: '24/7 Support', desc: 'Got questions? Our friendly team is here around the clock to help you.' },
];

const steps = [
    { num: '01', emoji: '🍽️', title: 'Choose Your Meal', desc: 'Browse our wide selection of burgers, meals, combos, and more.' },
    { num: '02', emoji: '🛒', title: 'Customize & Order', desc: 'Add your favorites to the cart, customize toppings, and checkout in seconds.' },
    { num: '03', emoji: '😋', title: 'Enjoy Your Food', desc: 'Sit back and relax while we prepare and deliver your order hot and fresh.' },
];

function AnimatedSection({ children, className = '', delay = 0 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
        >
            {children}
        </motion.div>
    );
}

function Home() {
    const [featured, setFeatured] = useState([]);
    const [popular, setPopular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            axiosFetch.get('/api/menu?featured=true&limit=8').catch(() => ({ data: { items: [] } })),
            axiosFetch.get('/api/menu?popular=true&limit=8').catch(() => ({ data: { items: [] } })),
            axiosFetch.get('/api/menu?limit=8').catch(() => ({ data: { items: [] } })),
        ])
            .then(([featuredRes, popularRes, allRes]) => {
                const fItems = featuredRes.data.items || featuredRes.data || [];
                const pItems = popularRes.data.items || popularRes.data || [];
                const allItems = allRes.data.items || allRes.data || [];
                setFeatured(fItems.length > 0 ? fItems : allItems.slice(0, 8));
                setPopular(pItems.length > 0 ? pItems : allItems.slice(0, 8));
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
        }
    };

    return (
        <>
            {/* Ambient floating glass orbs */}
            <div className="glass-orb glass-orb--1" aria-hidden="true" />
            <div className="glass-orb glass-orb--2" aria-hidden="true" />
            <div className="glass-orb glass-orb--3" aria-hidden="true" />

            {/* ===== HERO SECTION ===== */}
            <section className="hero-section">
                <div className="hero-overlay" />
                <img className="hero-banner" src={zestybanner} alt="Zesty Cave" />
                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="hero-tag">Welcome to Zesty Cave</span>
                    </motion.div>

                    <HeroTitle />

                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Ghana's ultimate destination for bold flavors and quick bites.
                    </motion.p>

                    <motion.div
                        className="hero-actions"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <button className="hero-btn hero-btn-primary" onClick={() => navigate('/menu')}>
                            Order Now
                        </button>
                        <button className="hero-btn hero-btn-outline" onClick={() => navigate('/menu')}>
                            View Menu
                        </button>
                    </motion.div>

                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="hero-stat">
                            <span className="hero-stat-value">8+</span>
                            <span className="hero-stat-label">Menu Items</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">30min</span>
                            <span className="hero-stat-label">Delivery</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">4.8★</span>
                            <span className="hero-stat-label">Rating</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== CATEGORY SHOWCASE ===== */}
            <AnimatedSection className="container-lg">
                <div className="zc-section-header">
                    <div>
                        <h2 className="zc-section-title">Explore Our Categories</h2>
                        <div className="zc-section-accent" />
                    </div>
                </div>
                <div className="zc-category-grid">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.key}
                            className="zc-category-card"
                            onClick={() => navigate('/menu')}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
                        >
                            <span className="zc-category-emoji">{cat.emoji}</span>
                            <span className="zc-category-name">{cat.name}</span>
                        </motion.div>
                    ))}
                </div>
            </AnimatedSection>

            {/* ===== FEATURED MEALS ===== */}
            <AnimatedSection className="container-lg">
                <div className="zc-section-header">
                    <div>
                        <h2 className="zc-section-title">Featured Meals</h2>
                        <div className="zc-section-accent" />
                    </div>
                    <button className="zc-section-link" onClick={() => navigate('/menu')}>
                        View All Menu →
                    </button>
                </div>
                {loading ? (
                    <Loader />
                ) : (
                    <div className="foodBox">
                        <Card products={featured} />
                    </div>
                )}
            </AnimatedSection>

            {/* ===== BEST SELLERS ===== */}
            <AnimatedSection className="container-lg">
                <div className="zc-section-header">
                    <div>
                        <h2 className="zc-section-title">Best Sellers 🔥</h2>
                        <p className="zc-section-subtitle">Most ordered items by our customers</p>
                        <div className="zc-section-accent" />
                    </div>
                </div>
                {loading ? (
                    <Loader />
                ) : (
                    <div className="foodBox">
                        <Card products={popular} />
                    </div>
                )}
            </AnimatedSection>

            {/* ===== WHY CHOOSE ZESTY CAVE ===== */}
            <section className="zc-features-section">
                <div className="container-lg">
                    <AnimatedSection>
                        <div className="zc-section-header zc-section-header--center">
                            <div>
                                <h2 className="zc-section-title">Why Choose Zesty Cave</h2>
                                <div className="zc-section-accent zc-section-accent--center" />
                            </div>
                        </div>
                    </AnimatedSection>
                    <div className="zc-features-grid">
                        {features.map((feat, i) => (
                            <motion.div
                                key={feat.title}
                                className="zc-feature-card"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -4 }}
                            >
                                <span className="zc-feature-emoji">{feat.emoji}</span>
                                <h3 className="zc-feature-title">{feat.title}</h3>
                                <p className="zc-feature-desc">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SPECIAL OFFER BANNER ===== */}
            <section className="zc-offer-section">
                <div className="zc-offer-decor zc-offer-decor--1" />
                <div className="zc-offer-decor zc-offer-decor--2" />
                <div className="container-lg">
                    <AnimatedSection>
                        <div className="zc-offer-content">
                            <span className="zc-offer-badge">Special Offer</span>
                            <h2 className="zc-offer-title">Get 20% Off Your First Order</h2>
                            <p className="zc-offer-subtitle">
                                Use code <strong>WELCOME20</strong> at checkout
                            </p>
                            <button className="hero-btn hero-btn-primary" onClick={() => navigate('/menu')}>
                                Order Now
                            </button>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="container-lg">
                <AnimatedSection>
                    <div className="zc-section-header zc-section-header--center">
                        <div>
                            <h2 className="zc-section-title">How It Works</h2>
                            <div className="zc-section-accent zc-section-accent--center" />
                        </div>
                    </div>
                </AnimatedSection>
                <div className="zc-steps-grid">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.num}
                            className="zc-step-card"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="zc-step-num">{step.num}</div>
                            <span className="zc-step-emoji">{step.emoji}</span>
                            <h3 className="zc-step-title">{step.title}</h3>
                            <p className="zc-step-desc">{step.desc}</p>
                        </motion.div>
                    ))}
                    <div className="zc-steps-line" />
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="zc-testimonials-section">
                <div className="container-lg">
                    <AnimatedSection>
                        <div className="zc-section-header zc-section-header--center">
                            <div>
                                <h2 className="zc-section-title">What Our Customers Say</h2>
                                <div className="zc-section-accent zc-section-accent--center" />
                            </div>
                        </div>
                    </AnimatedSection>
                    <div className="zc-testimonials-grid">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={t.name}
                                className="zc-testimonial-card"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="zc-testimonial-stars">
                                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                                </div>
                                <p className="zc-testimonial-text">"{t.text}"</p>
                                <div className="zc-testimonial-author">
                                    <div className="zc-testimonial-avatar">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="zc-testimonial-name">{t.name}</div>
                                        <div className="zc-testimonial-role">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== NEWSLETTER CTA ===== */}
            <section className="zc-newsletter-section">
                <div className="container-lg">
                    <AnimatedSection>
                        <div className="zc-newsletter-content">
                            <h2 className="zc-newsletter-title">Stay in the Loop</h2>
                            <p className="zc-newsletter-desc">
                                Subscribe for exclusive deals and new menu alerts
                            </p>
                            {subscribed ? (
                                <div className="newsletter-success">
                                    Thanks for subscribing! Check your inbox soon 🎉
                                </div>
                            ) : (
                                <form className="zc-newsletter-form" onSubmit={handleSubscribe}>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit">Subscribe</button>
                                </form>
                            )}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ===== INSTAGRAM GALLERY ===== */}
            <section className="container-lg">
                <AnimatedSection>
                    <div className="zc-section-header zc-section-header--center">
                        <div>
                            <h2 className="zc-section-title">Follow Us @ZestyCave</h2>
                            <div className="zc-section-accent zc-section-accent--center" />
                        </div>
                    </div>
                </AnimatedSection>
                <div className="zc-instagram-grid">
                    {[1, 2, 3, 4, 5, 6].map((num, i) => (
                        <motion.div
                            key={num}
                            className="zc-instagram-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ scale: 1.03 }}
                        >
                            <div
                                className="zc-instagram-img"
                                style={{
                                    background: `linear-gradient(135deg, ${['#e85d04', '#dc2f02', '#f48c06', '#2b9348', '#e85d04', '#dc2f02'][i]}, ${['#f48c06', '#e85d04', '#dc2f02', '#55a630', '#dc2f02', '#f48c06'][i]})`,
                                }}
                            >
                                <span style={{ fontSize: '32px', opacity: 0.4 }}>
                                    {['🍔', '🍛', '🍟', '🍰', '🥤', '🍱'][i]}
                                </span>
                            </div>
                            <div className="zc-instagram-overlay">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default Home;
