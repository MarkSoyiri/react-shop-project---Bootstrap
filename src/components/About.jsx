import { HomeHeadingWL } from "./HomeHeading";

function About (){

    return(
        <>
            <HomeHeadingWL heading="ABOUT US"/>
            <div className="about">
                <div className="container-lg">
                    <div className="aboutContent">
                        <h1>Welcome to ZESTY CAVE </h1>
                        <h2>Ghana’s ultimate destination for bold flavors, quick bites, and a touch of local flair!</h2>

                        <p>
                        At <b>Zesty Cave</b>, we believe fast food should never be ordinary. 
                        That’s why every meal we serve is crafted with passion, made fresh, and seasoned with the rich, vibrant tastes of Africa. 
                        From our juicy grilled burgers to our crispy fries and spicy wings, every bite takes you on a flavorful journey that’s uniquely Ghanaian.
                        </p>

                        <p>
                        We started <b>Zesty Cave</b> with a simple mission: to bring people together through good food, great vibes, and unforgettable taste. 
                        Whether you’re grabbing lunch on the go, hanging out with friends, or craving a late-night snack, Zesty Cave is your spot for fresh, zesty satisfaction — fast!
                        </p>
                        <p>
                        Come hungry. Leave happy. 
                        <b> Zesty Cave</b> — <span style={{color:"red"}}>Taste the</span> <span style={{color:"gold"}}>fire, feel</span> <span style={{color:"green"}}>the rythm!!!</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default About