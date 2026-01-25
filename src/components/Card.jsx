
import loadedfries from '../images/kfcloadedfries.jpeg'
import wings from '../images/hdw.jpeg'
import meal from '../images/hdtmeal.png'
import twister from '../images/hdt.png'
import promo from '../images/promo.jpeg'
import menumeal from '../images/menumeal.jpeg'
import valuedeals from '../images/valuedeals.jpeg'
import desserts from '../images/desserts.jpeg'
import burgers from '../images/burgers.jpeg'
import browsecat from '../images/browsecat.png'
import { useEffect,useState,useContext } from 'react'
import axiosFetch from '../api/axiosFetchAPI'
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";



export function Card ({ products }) {
      const { addToCart } = useContext(CartContext);
      const { token } = useContext(AuthContext);

      const handleAddToCart = (product) => {
        try {
            addToCart(product);
            alert("Added to cart!");
        } catch (err) {
            console.log(err);
            alert("Failed to add to cart");
        }           
    };
    
    
    
    

        
    

    



  


    return(
        <>
            
                {products.map((food)=>(
                    <div className='' key={food._id}>

                        <div className="card">
                            <img  src={food.image} alt="" />
                            <h3>{food.name}</h3>
                            {/* <h2>{food.description}</h2> */}
                            <p>{food.price}</p>
                            <button onClick={() => handleAddToCart(food)}>Order</button>
                        </div>

                    </div>
                ))}
            
            
        </>
    );
}




export function MiniCard () {


    const Menus = [
        {
            pic:promo,
            name:"PROMOTIONS",
            id:1
        },
        {
            pic:menumeal,
            name:"MEALS",
            id:2
        },
        {
            pic:burgers,
            name:"BURGERS",
            id:3
        },
        {
            pic:desserts,
            name:"DESSERTS",
            id:4
        },
        {
            pic:valuedeals,
            name:"VALUE DEALS",
            id:5
        },
        {
            pic:browsecat,
            name:"BROWSE CATEGORIES",
            id:6
        }
    ]

    return (
        <>
            <div className="MenuBox">
                {Menus.map((menu)=>(
                    <div className='' key={menu.id}>

                        <div className="miniCard">
                            <img src={menu.pic} alt="" />
                            <h3>{menu.name}</h3>
                        </div>

                    </div>
                ))}
            </div>
        </>
    );
}