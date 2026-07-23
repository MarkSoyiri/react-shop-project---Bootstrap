import { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { CartContext } from "../context/CartContext";
// eslint-disable-next-line no-unused-vars -- motion is used in JSX as <motion.div>
import { motion } from 'framer-motion';

export function Card ({ products }) {
      const { addToCart } = useContext(CartContext);
      const navigate = useNavigate();

      const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart(product);
      };

    return(
        <>
            {products.map((food) => (
                <motion.div
                    key={food._id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={() => navigate(`/product/${food._id}`)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="menu-card" style={styles.card}>
                        <div style={styles.imageWrapper}>
                            <img
                                src={food.image}
                                alt={food.name}
                                style={styles.image}
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                            {food.isPopular && (
                                <span style={{ ...styles.badge, ...styles.badgePopular }}>Popular</span>
                            )}
                            {food.isLimitedTime && (
                                <span style={{ ...styles.badge, ...styles.badgeLimited, right: 12, left: 'auto' }}>Limited</span>
                            )}
                        </div>

                        <div style={styles.content}>
                            <h3 style={styles.title}>{food.name}</h3>

                            {food.description && (
                                <p style={styles.desc}>{food.description}</p>
                            )}

                            {food.averageRating > 0 && (
                                <div style={styles.rating}>
                                    <span style={styles.stars}>
                                        {'★'.repeat(Math.round(food.averageRating))}
                                        {'☆'.repeat(5 - Math.round(food.averageRating))}
                                    </span>
                                    <span style={styles.ratingCount}>({food.totalRatings})</span>
                                </div>
                            )}

                            <div style={styles.footer}>
                                <span style={styles.price}>GH₵ {Number(food.price).toFixed(2)}</span>
                                <button
                                    className="zc-btn zc-btn--primary zc-btn--sm"
                                    style={styles.addBtn}
                                    onClick={(e) => handleAddToCart(e, food)}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </>
    );
}

const categoryImages = {
  promotions: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
  meals: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
  burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
  desserts: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop",
  "value deals": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
  drinks: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop",
  sides: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop",
  combos: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop"
};

export function MiniCard () {
    const categories = [
        { key: 'promotions', name: "PROMOTIONS", id: 1 },
        { key: 'meals', name: "MEALS", id: 2 },
        { key: 'burgers', name: "BURGERS", id: 3 },
        { key: 'desserts', name: "DESSERTS", id: 4 },
        { key: 'value deals', name: "VALUE DEALS", id: 5 },
        { key: 'drinks', name: "DRINKS", id: 6 },
        { key: 'sides', name: "SIDES", id: 7 },
        { key: 'combos', name: "COMBOS", id: 8 }
    ];

    return (
        <div className="MenuBox">
            {categories.map((cat) => (
                <a href={`/menu#${cat.key}`} style={styles.miniCardLink} key={cat.id}>
                    <motion.div
                        style={styles.miniCard}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div style={styles.miniCardImgWrap}>
                            <img src={categoryImages[cat.key]} alt={cat.name} style={styles.miniCardImg} />
                            <div style={styles.miniCardOverlay} />
                            <h3 style={styles.miniCardTitle}>{cat.name}</h3>
                        </div>
                    </motion.div>
                </a>
            ))}
        </div>
    );
}

const styles = {
    card: {
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-border-light)',
        transition: 'box-shadow var(--transition)',
    },
    imageWrapper: {
        height: 200,
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--color-bg-alt)',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 500ms ease',
    },
    badge: {
        position: 'absolute',
        top: 12,
        left: 12,
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.02em',
    },
    badgePopular: {
        background: 'var(--color-brand)',
        color: 'white',
    },
    badgeLimited: {
        background: '#e53e3e',
        color: 'white',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--color-text)',
        marginBottom: 4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    desc: {
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        marginBottom: 8,
    },
    rating: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    stars: {
        color: '#f59e0b',
        fontSize: 14,
    },
    ratingCount: {
        color: 'var(--color-text-muted)',
        fontSize: 12,
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--color-brand)',
    },
    addBtn: {
        borderRadius: 'var(--radius-sm)',
        padding: '6px 16px',
        fontSize: 12,
    },
    miniCardLink: {
        display: 'block',
        color: 'inherit',
        textDecoration: 'none',
    },
    miniCard: {
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-light)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow var(--transition)',
        cursor: 'pointer',
    },
    miniCardImgWrap: {
        position: 'relative',
        aspectRatio: '4/3',
        overflow: 'hidden',
    },
    miniCardImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 500ms ease',
    },
    miniCardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
        pointerEvents: 'none',
    },
    miniCardTitle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 14px',
        fontSize: 14,
        fontWeight: 700,
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
};
