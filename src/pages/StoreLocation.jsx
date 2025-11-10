
import { HomeHeadingNL } from '../components/HomeHeading';
import DirectionCard from '../components/DirectionCard';
import { useState } from 'react';
import { APIProvider,Map,AdvancedMarker,Pin,InfoWindow } from '@vis.gl/react-google-maps';




function StoreLocation (){

    
    const position = { lat: 53.54, lng: 10}

    return(
        <>
            
                    <div className="container-lg height-centered">
                    
                        <div className="direction">
                            <h1 className='findBranch'>OUR STORE LOCATION </h1>
                            <DirectionCard />
                        </div>
                        {/* <APIProvider>
                        <div className="map">

                        </div>
                        </APIProvider> */}
                    </div>
            

            {/* <div className="PageContainer">
                <div className="directionRow">
                    <DirectionCard />
                </div>
            </div> */}
        </>
    );
}

export default StoreLocation