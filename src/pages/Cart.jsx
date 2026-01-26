//create cart page that shows items added to cart with total price and checkout button
import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";  
import { HomeHeadingNL } from "../components/HomeHeading";
import "./Cart.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);

  return (
    <div className="container-lg cart-container">
      <HomeHeadingNL heading="Your Cart" />
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>  
      ) : (
        <div>
          <ul className="list-group mb-3">
            {cartItems.map((item) => (  
              <li key={item._id} className="list-group-item cart-item">
                <div className="cart-item-wrapper">
                  <div className="cart-item-info">
                    <h6 className="my-0 cart-item-name">{item.name}</h6>
                    <small className="text-muted cart-item-description">{item.description}</small>
                  </div>
                  
                  <div className="cart-item-controls">
                    <div className="quantity-control">
                      <button 
                        className="btn btn-sm btn-outline-secondary" 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="btn btn-sm btn-outline-secondary" 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    
                    <span className="cart-item-price">
                      GH₵ {(item.price * item.quantity).toFixed(2)}
                    </span>
                    
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="cart-total mb-3">
            <h5>Total:</h5>
            <h5>GH₵ {getTotalPrice().toFixed(2)}</h5>
          </div>
          
          <div className="cart-actions">
            <button className="btn btn-primary">Proceed to Checkout</button>
            <button className="btn btn-outline-danger" onClick={clearCart}>Clear Cart</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Cart;

