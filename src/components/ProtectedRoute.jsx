import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute ({children, role}) {
    const {user} = useContext(AuthContext);

    if(!user) return <Navigate to="/login" replace/>;
    // if(user) return <Navigate to="/userprofile" replace/>

    if(role && user.role !== role) return <Navigate to="/" replace/>

    return children;
};

export default ProtectedRoute;