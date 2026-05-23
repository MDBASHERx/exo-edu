    import express from "express";
    import { getAllUsers } from "../controllers/userController.js";
    import { protect, authorize } from "../middleware/authMiddleware.js";

    const router = express.Router();

    router.get("/", protect, authorize("admin"), getAllUsers);

    export default router;