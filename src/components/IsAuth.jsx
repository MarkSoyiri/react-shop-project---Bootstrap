import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";
import account from '../images/account.png'
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";



export const IsUserAuthenticated = () => {

    try {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration > now) {


                return true;

            } else {

                return false;

            }
        } else {

            return false;
        }

    } catch (error) {

        return false;


    }
}


export const IsLoginSuccess = () => {

    try {



        if (IsUserAuthenticated()) {


            return <>
                <li class="nav-item">
                    <a class="nav-link" href="/userprofile">User Profile</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">My Order</a>
                </li>
            </>;

        } else {


            return <Navigate to="/login" replace />;



        }



    } catch (error) {

        return <Outlet />;

    }



}




export const DontShowLoginRegister = () => {

    try {



        if (!IsUserAuthenticated()) {


            return <Outlet></Outlet>

        } else {


            return <Navigate to="/" replace />;



        }



    } catch (error) {

        return <Outlet />;

    }



}



export const IsLogout = () => {


    const {logout} = useContext(AuthContext);
    try {



        if (IsUserAuthenticated()) {


            return <>
                <a style={{color:"black",textDecoration:"none"}} href="/login"><span className='signIn' onClick={logout}><img className='acc-img' src={account} alt="account image" /> SignOut</span></a>
            </>;

        } else {


            return <>
                <a style={{color:"black",textDecoration:"none"}} href="/login"><span className='signIn'><img className='acc-img' src={account} alt="account image" />Sign In</span></a>
                </>



        }



    } catch (error) {

        return <Outlet />;

    }



}