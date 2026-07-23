import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
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

    } catch {
        return false;
    }
}


export const IsLoginSuccess = () => {

    try {
        if (IsUserAuthenticated()) {
            return <>   
                <li class="nav-item">
                    <a class="nav-link" href="/userprofile">Profile</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/cart">Cart</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">My Order</a>
                </li>
            </>;
        } else {
            return null;
        }

    } catch {
        return null;
    }
}


export const DontShowLoginRegister = () => {

    try {
        if (!IsUserAuthenticated()) {
            return <Outlet></Outlet>
        } else {
            return <Navigate to="/" replace />;
        }

    } catch {
        return <Outlet />;
    }
}


export const IsLogout = () => {

    const {logout} = useContext(AuthContext);
    const navigate = useNavigate();

    try {
        if (IsUserAuthenticated()) {

            const handleLogout = () => {
                logout();
                navigate("/login");
            };

            return <>
                <span className='signIn' onClick={handleLogout} style={{cursor:"pointer"}}>
                    <img className='acc-img' src={account} alt="account image" /> SignOut
                </span>
            </>;

        } else {

            return <>
                <a style={{color:"black",textDecoration:"none"}} href="/login">
                    <span className='signIn'>
                        <img className='acc-img' src={account} alt="account image" /> Sign In
                    </span>
                </a>
            </>

        }

    } catch {
        return null;
    }
}
