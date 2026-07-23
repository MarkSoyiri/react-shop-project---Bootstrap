import { useContext } from 'react'
import axiosFetch from '../api/axiosFetchAPI'
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

export function Card ({ products }) {
      const { addToCart } = useContext(CartContext);
      const { token } = useContext(AuthContext);

      const handleAddToCart = (product) => {
        addToCart(product);
      };

    return(
        <>
            {products.map((food)=>(
                <div className='' key={food._id}>
                    <div className="card menu-card">
                        <div className="card-img-wrapper">
                          <img src={food.image} alt={food.name} onError={(e) => { e.target.style.display='none' }} />
                        </div>
                        <h3>{food.name}</h3>
                        {food.description && <p className="card-desc">{food.description}</p>}
                        <p className="card-price">GH₵ {Number(food.price).toFixed(2)}</p>
                        <button className="card-order-btn" onClick={() => handleAddToCart(food)}>Add to Order</button>
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
  "value deals": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop"
};

export function MiniCard () {
    const categories = [
        { key: 'promotions', name: "PROMOTIONS", id: 1 },
        { key: 'meals', name: "MEALS", id: 2 },
        { key: 'burgers', name: "BURGERS", id: 3 },
        { key: 'desserts', name: "DESSERTS", id: 4 },
        { key: 'value deals', name: "VALUE DEALS", id: 5 }
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
