import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getAttendanceSummary, markAttendance, getAllCoursesForAdmin, manualAttendanceBulk,
        generateAbsences, getCourseStudentsWithAttendance, getCourseAttendanceForStudent,
        getTeacherCourses, getManualAttendance, getTodayCourses } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/", protect, authorize("student"), markAttendance);
router.get("/summary", protect, getAttendanceSummary);
router.post("/generate-absences", generateAbsences);
router.get("/course/:courseId", protect, getCourseAttendanceForStudent);
router.get("/teacher-courses", protect, authorize("teacher"), getTeacherCourses);
router.get("/all-courses", protect, authorize("admin"), getAllCoursesForAdmin);
router.get("/today-courses", protect, authorize("admin", "teacher"), getTodayCourses);
router.post("/manual", protect, authorize("admin", "teacher"), manualAttendanceBulk);
router.get("/manual/:courseId", protect, authorize("admin", "teacher"), getManualAttendance);
router.get("/course/:courseId/students", protect, authorize("teacher", "admin"), getCourseStudentsWithAttendance);

export default router;
