//create cart page that shows items added to cart with total price and checkout button
import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";  
import { HomeHeadingNL } from "../components/HomeHeading";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);

  return (
    <div className="container-lg">
      <HomeHeadingNL heading="Your Cart" />
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>  
      ) : (
        <div>
          <ul className="list-group mb-3">
            {cartItems.map((item) => (  
              <li key={item._id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="my-0">{item.name}</h6>
                    <small className="text-muted">{item.description}</small>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <button 
                        className="btn btn-sm btn-outline-secondary" 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button 
                        className="btn btn-sm btn-outline-secondary" 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-muted" style={{ minWidth: "80px", textAlign: "right" }}>
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
          <div className="d-flex justify-content-between mb-3">
            <h5>Total:</h5>
            <h5>GH₵ {getTotalPrice().toFixed(2)}</h5>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary flex-grow-1 mb-s">Proceed to Checkout</button>
            <button className="btn btn-outline-danger" onClick={clearCart}>Clear Cart</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Cart;

