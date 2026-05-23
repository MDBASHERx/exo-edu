import express from "express";
import rateLimit from "express-rate-limit";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 10 minutes
    max: 5,
    message: { msg: "Too many login attempts. Please try again later." }
});

router.post("/register", protect, authorize("admin"), register);
router.post("/login", loginLimiter, login);

export default router;
