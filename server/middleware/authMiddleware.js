import jwt from "jsonwebtoken";
import User from "../schemas/User.js";

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
    {
        return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.LOGIN_TOKEN);
        const user = await User.findById(decoded.id).select("-password");

        if (!user)
        {
            return res.status(401).json({ msg: "Invalid token. User does not exist." });
        }

        req.user = user;
        next();
    }
    catch (err)
    {
        console.error("[AUTH ERROR]:", err.message);
        return res.status(401).json({ msg: "Invalid or expired token." });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role))
        {
            return res.status(403).json({ msg: "Forbidden. You do not have access to this resource." });
        }
        next();
    };
};