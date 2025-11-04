
import banner from '../images/kfcbanner.jpeg'
import { HomeHeadingNL,HomeHeadingWL } from '../components/HomeHeading';
import { Card,MiniCard} from '../components/Card';
import About from '../components/About';
import zestybanner from '../images/zestybanner.png'


function Home () {

    return(
            <>
            <div className="bannerContainer">
                <img className='banner' src={zestybanner} alt="banner" />
            </div>
                

                <HomeHeadingWL heading="LIMITED TIME OFFER" className="red" />
                <div class="container-lg">
                    <div className="foodBox">
                    <Card/>
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