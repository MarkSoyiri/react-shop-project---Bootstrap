import { createContext,useState,useEffect } from "react";
import { Navigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({children}) {

    //CHECKS IF USER + TOKEN EXIST UPON APP START UP
    const [user,setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

    const [token,setToken] = useState(localStorage.getItem("token") || null);

    //WHEN LOGIN IS SUCCESSFUL, "SAVES USER + TOKEN TO REACT STATE AND LOCAL STORAGE"
    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);

        localStorage.setItem("user",JSON.stringify(userData));
        localStorage.setItem("token", tokenData);
        
    };

    //CLEARS THE STORED USER + TOKEN WHEN USER LOGS OUT 
    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{user, token, login, logout}}>
            { children}
        </AuthContext.Provider>
    )
}