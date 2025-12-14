
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
import { useEffect,useState } from 'react'
import axiosFetch from '../api/axiosFetchAPI'



export function Card ({ products }) {

       
        
    
        
    



  
    const Foods = [
        {
            pic:loadedfries,
            name:"LOADED FRIES",
            price:"GH₵78.00",
            id:1
        },
        {
            pic:wings,
            name:"HONEY WINGS",
            price:"GH₵87.00",
            id:2
        },
        {
            pic:meal,
            name:"HONEY DUNKED TWISTERS ",
            price:"GH₵102.00",
            id:3
        },
        {
            pic:twister,
            name:"HONEY  TWISTER",
            price:"GH₵61.00",
            id:4
        },
        {
            pic:loadedfries,
            name:"LOADED FRIES",
            price:"GH₵78.00",
            id:1
        },
        {
            pic:wings,
            name:"HONEY  WINGS",
            price:"GH₵87.00",
            id:2
        },
        {
            pic:meal,
            name:"HONEY DUNKED TWISTERS ",
            price:"GH₵102.00",
            id:3
        },
        {
            pic:twister,
            name:"HONEY  TWISTER",
            price:"GH₵61.00",
            id:4
        }
    ]

    return(
        <>
            
                {products.map((food)=>(
                    <div className='' key={food.id}>

                        <div className="card">
                            <img  src={food.image} alt="" />
                            <h3>{food.name}</h3>
                            <p>{food.price}</p>
                            <button>Order</button>
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