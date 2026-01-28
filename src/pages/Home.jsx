
import banner from '../images/kfcbanner.jpeg'
import { HomeHeadingNL,HomeHeadingWL } from '../components/HomeHeading';
import { Card, MiniCard} from '../components/Card';
import About from '../components/About';
import zestybanner from '../images/zestybanner.png'
import { useEffect,useState } from 'react';
import axiosFetch from '../api/axiosFetchAPI';


function Home () {


    const [products,setProducts]=useState([])
    const [loading, setLoading] = useState(true)


    useEffect(()=>{

        axiosFetch.get('/menu').then((res)=>{
            setProducts(res.data);
            setLoading(false);
            console.log(res.data);
        }).catch((err)=>{
            console.error(err.message);
            setLoading(false);
        })


    },[])

    

    return(
            <>
            <div className="bannerContainer">
                <img className='banner' src={zestybanner} alt="banner" />
            </div>
                

                <HomeHeadingWL heading="LIMITED TIME OFFER" className="red" />
                <div class="container-lg">
                    <div className="foodBox">
                    {loading ? (
                        <p>Loading products...</p>
                    ) : products.length === 0 ? (
                        <p>No products available</p>
                    ) : (
                        <Card products={products}/>
                    )}
                    </div>
                </div>
                
                <HomeHeadingWL heading="EXPLORE OUR MENU"/>
                <div class="container-lg"> 
                    <a href="/menu" style={{textDecoration:"none",color:"black"}}><MiniCard/></a>
                </div>

                <div class="container-lg">
                    <About/>
                </div>
                    
                
            </>
    );
}

export default Home