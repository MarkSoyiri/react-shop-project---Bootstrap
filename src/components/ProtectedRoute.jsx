import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute ({children, role}) {
    const {user} = useContext(AuthContext);

    if(!user) return <Navigate to="/login" replace/>;

    if(role && user.role !== role) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, fontFamily: 'Inter, sans-serif' }}>
                <h2 style={{ color: '#e85d04', margin: 0 }}>Access Denied</h2>
                <p style={{ color: '#6b7280', margin: 0 }}>You do not have permission to access this page.</p>
                <a href="/" style={{ color: '#e85d04', fontWeight: 600, textDecoration: 'none' }}>Back to Home</a>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;