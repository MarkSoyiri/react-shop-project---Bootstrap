
import { HomeHeadingNL } from '../components/HomeHeading';
import DirectionCard from '../components/DirectionCard';

function StoreLocation (){

    
    

    return(
        <>
            <div className="mapNdirection">
                    <div className="MapContainer">
                    
                        <div className="direction">
                            <h1 className='findBranch'>FIND YOUR NEAREST BRANCH. </h1>
                            <input type="address" className='addressInput' placeholder='type your address'/>
                            <DirectionCard />
                        </div>

                        <div className="map">

                        </div>
                    </div>
            </div>

            <div className="PageContainer">
                <div className="directionRow">
                    <DirectionCard />
                </div>
            </div>
        </>
    );
}

export default StoreLocation