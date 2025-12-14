
import banner from '../images/kfcbanner.jpeg'
import { HomeHeadingNL } from '../components/HomeHeading';
import { Card } from '../components/Card';
import { useEffect,useState } from 'react';
import axiosFetch from '../api/axiosFetchAPI';


function Menu() {

     const [products,setProducts]=useState([])


    useEffect(()=>{

        axiosFetch.get('/menu').then((res)=>{
            setProducts(res.data);
            console.log(products);
        }).catch((err)=>{
            console.error(err.message);
        })


    },[])

    return (
        <>



            <div className="scroll-box" >

                <h4 id="scrollspyHeading1" class="scroll-view-repost" >

                    <HomeHeadingNL heading="PROMOTIONS" />
                    <div className="container-lg menu-container">
                        <Card />
                    </div>

                </h4>
                <h4 id="scrollspyHeading2" class="scroll-view-repost">

                    <HomeHeadingNL heading="MEALS" />
                    <div className="container-lg menu-container">
                        <Card products={products}/>

                    </div>
                </h4>
                <h4 id="scrollspyHeading3" class="scroll-view-repost">

                    <HomeHeadingNL heading="BURGERS" />
                    <div className="container-lg menu-container">
                        <Card products={products}/>
                    </div>

                </h4>
                <h4 id="scrollspyHeading4" class="scroll-view-repost">

                    <HomeHeadingNL heading="DESSERTS" />
                    <div className="container-lg menu-container">
                        <Card products={products}/>
                    </div>

                </h4>


            </div>

        </>
    );
}

export default Menu