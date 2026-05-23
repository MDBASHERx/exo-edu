import express from "express";
import { getStudentsWithAttendance, getStudentById } from "../controllers/studentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getStudentsWithAttendance);
router.get("/:id", protect, authorize("teacher", "admin"), getStudentById);

export default router;