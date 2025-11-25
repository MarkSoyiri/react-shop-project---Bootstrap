
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

const Authenticated = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN);
            if (accessToken) {
                try {
                    const decoded = jwtDecode(accessToken);
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp > currentTime) {
                        setIsAuthenticated(true);
                    } else {
                        await refreshAccessToken();
                    }
                } catch (error) {
                    console.error("Token is invalid", error);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (refreshToken) {
            try {
                const response = await api.post('/refresh-token', { token: refreshToken });
                localStorage.setItem(ACCESS_TOKEN, response.data.accessToken);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to refresh token", error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};


export default Authenticated;


// Usage example
// <Authenticated>
//     <YourProtectedComponent />
// </Authenticated>
