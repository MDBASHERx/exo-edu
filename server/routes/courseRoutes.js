import express from "express";
import { createCourse, getUserCourses, addStudentToCourse, createZoomCourse, getAllCourses,
        getCourseById, copyStudentsToCourse } from "../controllers/courseController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createCourse);
router.get("/my", protect, getUserCourses);
router.get("/all", protect, authorize("admin"), getAllCourses);
router.get("/:id", protect, getCourseById);
router.post("/add-student", protect, authorize("admin"), addStudentToCourse);
router.post("/copy-students", protect, authorize("admin", "teacher"), copyStudentsToCourse);
router.post("/zoom", protect, authorize("teacher", "admin"), createZoomCourse);

export default router;
