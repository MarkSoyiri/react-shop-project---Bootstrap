import { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { CartContext } from "../context/CartContext";

export function Card ({ products }) {
      const { addToCart } = useContext(CartContext);
      const navigate = useNavigate();

      const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart(product);
      };

    return(
        <>
            {products.map((food)=>(
                <div className='' key={food._id} onClick={() => navigate(`/product/${food._id}`)} style={{ cursor: 'pointer' }}>
                    <div className="card menu-card">
                        <div className="card-img-wrapper">
                          <img src={food.image} alt={food.name} onError={(e) => { e.target.style.display='none' }} />
                          {food.isPopular && <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--color-brand)', color: 'white', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>Popular</span>}
                          {food.isLimitedTime && <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#e53e3e', color: 'white', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>Limited</span>}
                        </div>
                        <h3>{food.name}</h3>
                        {food.averageRating > 0 && (
                          <div style={{ padding: '0 16px', fontSize: '13px', color: '#f59e0b' }}>
                            {'★'.repeat(Math.round(food.averageRating))}{'☆'.repeat(5 - Math.round(food.averageRating))}
                            <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>({food.totalRatings})</span>
                          </div>
                        )}
                        {food.description && <p className="card-desc">{food.description}</p>}
                        <p className="card-price">GH₵ {Number(food.price).toFixed(2)}</p>
                        <button className="card-order-btn" onClick={(e) => handleAddToCart(e, food)}>Add to Order</button>
                    </div>
                </div>
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
                <a href={`/menu#${cat.key}`} className="miniCardLink" key={cat.id}>
                    <div className="miniCard">
                        <img src={categoryImages[cat.key]} alt={cat.name} />
                        <h3>{cat.name}</h3>
                    </div>
                </a>
            ))}
        </div>
    );
}
