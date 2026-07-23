import { createContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({children}) {

    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");
            if (storedUser && token) {
                const decoded = jwtDecode(token);
                if (decoded.exp > Date.now() / 1000) {
                    return JSON.parse(storedUser);
                } else {
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    return null;
                }
            }
            return null;
        } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        try {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                const decoded = jwtDecode(storedToken);
                if (decoded.exp > Date.now() / 1000) {
                    return storedToken;
                }
                localStorage.removeItem("token");
            }
            return null;
        } catch {
            localStorage.removeItem("token");
            return null;
        }
    });

    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenData);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{user, token, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
