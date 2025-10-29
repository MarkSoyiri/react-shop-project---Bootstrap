
import banner from '../images/kfcbanner.jpeg'
import { HomeHeadingNL } from '../components/HomeHeading';
import { Card,MiniCard} from '../components/Card';

function Menu () {

    return(
            <>
                

                <nav id="navbar-example2" class="">
  
  <div className=" my-view">
    
      <a class="" href="#scrollspyHeading1">PROMOTIONS</a>
    
    
      <a class="" href="#scrollspyHeading2">MEALS</a>
    
    
      <a class="" href="#scrollspyHeading3">BURGERS</a>
    
    
      <a class="" href="#scrollspyHeading4">DESSERTS</a>
    
    
      <a class="" href="#scrollspyHeading5">DEALS</a>
    
    
  </div>
</nav>
<div data-bs-spy="scroll" data-bs-target="#navbar-example2" data-bs-root-margin="0px 0px 40%" data-bs-smooth-scroll="true" class="scrollspy-example bg-body-tertiary p-3 rounded-2  my-container-margin" tabindex="50px">
  <h4 id="scrollspyHeading1">
        
            <HomeHeadingNL heading="PROMOTIONS"/>
            <div className="PageContainer"> 
                <Card/>
            </div>
        
  </h4>
  <h4 id="scrollspyHeading2">
        
            <HomeHeadingNL heading="MEALS"/>
            <div className="PageContainer"> 
                <Card/>
            
        </div>
  </h4>
  <h4 id="scrollspyHeading3">
        
            <HomeHeadingNL heading="BURGERS"/>
            <div className="PageContainer"> 
                <Card/>
            </div>
        
  </h4>
  <h4 id="scrollspyHeading4">
        
            <HomeHeadingNL heading="DESSERTS"/>
            <div className="PageContainer"> 
                <Card/>
            </div>
        
  </h4>
  
  <h4 id="scrollspyHeading5">
         
            <HomeHeadingNL heading="DEALS"/>
            <div className="PageContainer"> 
                <Card/>
            </div>
        
  </h4>
  
</div>
                

                <HomeHeadingNL heading="PROMOTIONS"/>
                <div className="PageContainer"> 
                    <Card/>
                </div>
                
                <HomeHeadingNL heading="MEALS"/>
                <div className="PageContainer"> 
                    <Card/>
                </div>

                <HomeHeadingNL heading="BURGERS"/>
                <div className="PageContainer"> 
                    <Card/>
                </div>

                <HomeHeadingNL heading="DESSERTS"/>
                <div className="PageContainer"> 
                    <Card/>
                </div>

                <HomeHeadingNL heading="VALUE DEALS"/>
                <div className="PageContainer"> 
                    <Card/>
                </div>

                <HomeHeadingNL heading="TOASTED"/>
                <div className="PageContainer"> 
                    <Card/>
                </div>

                <HomeHeadingNL heading="DRINKS"/>
                <div className="PageContainer"> 
                    <Card/>
                </div>

                <HomeHeadingNL heading="SNACKS"/>
                <div className="PageContainer"> 
                    <Card/>
                </div>
            </>
    );
}

export default Menu