import { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { CartContext } from "../context/CartContext";
// eslint-disable-next-line no-unused-vars -- motion is used in JSX as <motion.div>
import { motion } from 'framer-motion';

export function Card({ products }) {
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <>
            {products.map((food) => (
                <motion.div
                    key={food._id}
                    className="zc-product-card-wrap"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={() => navigate(`/product/${food._id}`)}
                >
                    <div className="zc-product-card">
                        <div className="zc-product-card__img-wrap">
                            <img
                                src={food.image}
                                alt={food.name}
                                className="zc-product-card__img"
                                loading="lazy"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <div className="zc-product-card__badges">
                                {food.isPopular && (
                                    <span className="zc-product-card__badge zc-product-card__badge--popular">Popular</span>
                                )}
                                {food.isLimitedTime && (
                                    <span className="zc-product-card__badge zc-product-card__badge--limited">Limited</span>
                                )}
                            </div>
                        </div>

                        <div className="zc-product-card__body">
                            <h3 className="zc-product-card__title">{food.name}</h3>

                            {food.description && (
                                <p className="zc-product-card__desc">{food.description}</p>
                            )}

                            {food.averageRating > 0 && (
                                <div className="zc-product-card__rating">
                                    <span className="zc-product-card__stars">
                                        {'★'.repeat(Math.round(food.averageRating))}
                                        {'☆'.repeat(5 - Math.round(food.averageRating))}
                                    </span>
                                    <span className="zc-product-card__rating-count">({food.totalRatings})</span>
                                </div>
                            )}

                            <div className="zc-product-card__footer">
                                <span className="zc-product-card__price">GH₵ {Number(food.price).toFixed(2)}</span>
                                <button
                                    className="zc-product-card__add-btn"
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

export function MiniCard() {
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
                <a href={`/menu#${cat.key}`} className="miniCardLink" key={cat.id}>
                    <motion.div
                        className="miniCard"
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="miniCardImgWrap">
                            <img src={categoryImages[cat.key]} alt={cat.name} className="miniCardImg" loading="lazy" />
                            <div className="miniCardOverlay" />
                            <h3 className="miniCardTitle">{cat.name}</h3>
                        </div>
                    </motion.div>
                </a>
            ))}
        </div>
    );
}
