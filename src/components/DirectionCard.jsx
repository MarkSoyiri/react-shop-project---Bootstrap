
import locationIcon from '../images/location.png'
import phone from '../images/redphone.png'
import direction from '../images/direction.png'
import clock from '../images/clock.png'

function DirectionCard (props){

    const LocationDetails = [
        {
            city:"ZESTY CAVE KUMASI",
            address:"Tech Area",
            phone: "0507478237"
        },
        // {
        //     city:"ZESTY CAVE ACCRA",
        //     address:"Tech Area",
        //     phone: "0507478237"
        // },
        // {
        //     city:"ZESTY CAVE TAKORADI",
        //     address:"Tech Area",
        //     phone: "0507478237"
        // },
        // {
        //     city:"ZESTY CAVE TECHIMAN",
        //     address:"Tech Area",
        //     phone: "0507478237"
        // },
        // {
        //     city:"ZESTY CAVE TECHIMAN",
        //     address:"Tech Area",
        //     phone: "0507478237"
        // },
        // {
        //     city:"ZESTY CAVE TECHIMAN",
        //     address:"Tech Area",
        //     phone: "0507478237"
        // },
        // {
        //     city:"ZESTY CAVE TECHIMAN",
        //     address:"Tech Area",
        //     phone: "0507478237"
        // },
        
    ]

    return(
         <>
           {LocationDetails.map((location)=>(
                <div className="directionCard">
                <div className="locationRow">
                    <img src={locationIcon} alt="" />
                    <h1>{location.city}</h1>
                </div>
                <h2>{location.address}</h2>
                <div className="locationRow" style={{columnGap:"20px"}}>
                    <div className="locationRow">
                        <img src={phone} alt="" />
                        <a href=''>{location.phone}</a>
                    </div>
                    <div className="locationRow" >
                        <img src={direction} alt="" />
                        <a href=''>Direction</a>
                    </div>
                </div>
                <div className="locationRow">
                    <img src={clock} alt="" />
                    <h3>Closed - Opens 10:00</h3>
                </div>
                <div className="locationRow" style={{justifyContent:"space-between"}}>
                    <p>Delivery</p>
                    <p>Opens 10:00</p>
                </div>
                <div className="locationRow" style={{justifyContent:"space-between"}}>
                    <p>In store</p>
                    <p>Opens 10:00</p>
                </div>
                <button className='BMbutton'>BROWSE MENU</button>
            </div>
           ))} 
            
         </>
    );
}

export default DirectionCard