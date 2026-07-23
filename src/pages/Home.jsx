import { HomeHeadingWL } from '../components/HomeHeading';
import { Card, MiniCard} from '../components/Card';
import About from '../components/About';
import zestybanner from '../images/zestybanner.jpg'
import { useEffect,useState } from 'react';
import axiosFetch from '../api/axiosFetchAPI';
import Loader from '../components/Loader';

function Home () {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        axiosFetch.get('/menu')
          .then((res) => setProducts(res.data))
          .catch((err) => setError(err.response?.data?.message || err.message))
          .finally(() => setLoading(false));
    },[]);

    return(
        <>
            <div className="bannerContainer">
                <img className='banner' src={zestybanner} alt="Zesty Cave banner" />
            </div>
            <HomeHeadingWL heading="Limited Time Offer" className="red" />
            <div className="container-lg">
              {loading ? <Loader /> : error ? (
                <p className="text-center text-muted py-4">{error}</p>
              ) : (
                <div className="foodBox">
                    <Card products={products.slice(0, 4)} />
                </div>
              )}
            </div>
            <HomeHeadingWL heading="Explore Our Menu"/>
            <div className="container-lg"> 
                <MiniCard />
            </div>
            <div className="container-lg">
                <About/>
            </div>
        </>
    );
}

export default Home
