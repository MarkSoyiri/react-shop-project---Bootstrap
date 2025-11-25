import { Navigate ,Outlet} from "react-router-dom";
import {ACCESS_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode";




export  const IsUserAuthenticated = ()=>{

  try {
   const token = localStorage.getItem(ACCESS_TOKEN);
   if (token) {
   const decoded = jwtDecode(token);
   const tokenExpiration = decoded.exp;
   const now = Date.now() / 1000;

   if (tokenExpiration > now) {
   
   
    return true;

   } else{

    return false;

   }
}else{

  return false;
}
   
  } catch (error) {
    
    return false;
   
    
  }
}




export const LoginVerified = ()=>{
 
   try {
    
    

    if (IsUserAuthenticated()) {
     
      
return  <Outlet /> ; 

    } else {

      
return  <Navigate to="/login" replace /> ;

    
      
    }


    
   } catch (error) {
    
    return  <Outlet /> ;  
   
   }

   

}
      
export const LogoutVerified = ()=>{
 
  try {
    
  

    if (!IsUserAuthenticated()) {

      
      return  <Outlet/>

    } else {
   
      return <Navigate to="/" replace /> ;
    }


    
   } catch (error) {
    
    return <Outlet />;
   
   
   }

  

}



export const LoginButton = ()=>{
    
    try {
        
        if (!IsUserAuthenticated()) {
        
            return <>
              <ol>
                 <li >
                 <li>
                    <a href="/login" >
                        <i className="fa fa-lock myhover  ">
                          <span className="m-1">Login</span></i>
                      </a>
                    </li>
                 </li>
                 <li >
                 <li>
                    <a href="/register#Register" >
                        <i className="fa fa-lock myhover  ">
                          <span className="m-1">Register</span></i>
                      </a>
                    </li>
                 </li>
                 </ol> 
            </>
        } else {
    
            return < > 
             <li>
             <li>   
               <a href="/user" >
                        <i className="fa fa-user myhover  ">
                          <span className="m-1">Profile</span></i>
                      </a>
              </li>  
             </li>

                 <li>
                 <li>
                  <a href="/password/changes" >
                        <i className="fa fa-lock myhover  ">
                          <span className="m-1">Change Password</span></i>
                      </a>
                 </li>
                 </li>

                 <li>
                 <li>
                  <a href="/email/changes" >
                        <i className="fa fa-lock myhover  ">
                          <span className="m-1">Change Email</span></i>
                      </a>
                 </li>
                 </li>


              
                   
                 <li>
                   
                    <li >
                      <a href="/logout" >
                        <i className="fa fa-lock myhover  ">
                          <span className="m-1">Logout </span></i>
                      </a>
                </li>
                 </li>
                  
            </>
            
        }
    } catch (error) {

        // console.log
        
    }
}


export const UserButton = ()=>{


    try {

        if (IsUserAuthenticated()) {

            return < > 
             <li>
             <li>   
               <a href="/" >
                        <i className="fa fa-user myhover  ">
                          <span className="m-1">Settings</span></i>
                      </a>
              </li>  
             </li>

                 <li>
                 <li>
                  <a href="/" >
                        <i className="fa fa-lock myhover  ">
                          <span className="m-1">Profile</span></i>
                      </a>
                 </li>
                 </li>

              
                   
                 <li>
                   
                    <li >
                      <a href="/" >
                        <i className="fa fa-lock myhover  ">
                          <span className="m-1">Orders</span></i>
                      </a>
                </li>
                 </li>
                  
            </>
        }
        
    } catch (error) {
        
        // console.log
    }


}