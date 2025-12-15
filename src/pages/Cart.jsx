//create cart page that shows items added to cart with total price and checkout button
import React, { useEffect, useState } from "react";
import axiosFetch from "../api/axiosFetchAPI";  
import { HomeHeadingNL } from "../components/HomeHeading";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        axiosFetch.get('/cart/add')
            .then((res) => {
                setCartItems(res.data.items);
                const total = res.data.items.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
                setTotalPrice(total);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err.message);
                setIsLoading(false);
            }); 
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="container-lg">
            <HomeHeadingNL heading="Your Cart" />
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>  
            ) : (
                <div>
                    <ul className="list-group mb-3">
                        {cartItems.map((item) => (  
                            <li key={item._id} className="list-group-item d-flex justify-content-between lh-sm">
                                <div>
                                    <h6 className="my-0">{item.menuItem.name} (x{item.quantity})</h6>
                                    <small className="text-muted">{item.menuItem.description}</small>
                                </div>
                                <span className="text-muted">GH₵ {(item.menuItem.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="d-flex justify-content-between">
                        <h5>Total:</h5>
                        <h5>GH₵ {totalPrice.toFixed(2)}</h5>
                    </div>
                    <button className="btn btn-primary mt-3">Proceed to Checkout</button>
                </div>
            )}
        </div>
    );
}
export default Cart;

