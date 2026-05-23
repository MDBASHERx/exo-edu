import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = sessionStorage.getItem("token");
    const role = localStorage.getItem("role");

    const isTokenValid = token && token !== "null" && token !== "undefined";

    if (!isTokenValid)
    {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(role))
    {
        return <Navigate to={`/`} />;
    }

    return children;
};

export default PrivateRoute;
