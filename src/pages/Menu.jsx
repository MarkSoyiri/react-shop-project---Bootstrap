
import banner from '../images/kfcbanner.jpeg'
import { HomeHeadingNL } from '../components/HomeHeading';
import { Card, MiniCard } from '../components/Card';

function Menu() {

    return (
        <>



            <div className="scroll-box" >

                <h4 id="scrollspyHeading1" class="scroll-view-repost" >

                    <HomeHeadingNL heading="PROMOTIONS" />
                    <div className="PageContainer">
                        <Card />
                    </div>

                </h4>
                <h4 id="scrollspyHeading2" class="scroll-view-repost">

                    <HomeHeadingNL heading="MEALS" />
                    <div className="PageContainer">
                        <Card />

                    </div>
                </h4>
                <h4 id="scrollspyHeading3" class="scroll-view-repost">

                    <HomeHeadingNL heading="BURGERS" />
                    <div className="PageContainer">
                        <Card />
                    </div>

                </h4>
                <h4 id="scrollspyHeading4" class="scroll-view-repost">

                    <HomeHeadingNL heading="DESSERTS" />
                    <div className="PageContainer">
                        <Card />
                    </div>

                </h4>

                {/* <h4 id="scrollspyHeading5" class="scroll-view-repost">
                   

                    <HomeHeadingNL heading="DEALS" />
                    <div className="PageContainer">
                        <Card />
                    </div>

                </h4> */}


            </div>

        </>
    );
}

export default Menu