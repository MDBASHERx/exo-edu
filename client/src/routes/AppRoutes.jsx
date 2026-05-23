import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Attendance from "../pages/Attendance";
import AttendanceDetails from "../pages/AttendanceDetails";
import CourseStudents from "../pages/CourseStudents";
import Students from "../pages/Student";
import NotFound from "../pages/NotFound";
import PrivateRoute from "../routes/PrivateRoute";
import Panel from "../pages/Panel";
import AddZoomCourse from "../pages/AddZoomCourse";
import ManualAttendance from "../pages/ManualAttendance";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/attendance" element={<PrivateRoute><Layout><Attendance /></Layout></PrivateRoute>} />
            <Route path="/attendance/:courseId/students" element={<PrivateRoute><Layout><CourseStudents /></Layout></PrivateRoute>} />
            <Route path="/attendance/:courseId/details" element={<PrivateRoute allowedRoles={["student"]}><Layout><AttendanceDetails /></Layout></PrivateRoute>} />
            <Route path="/attendance/:courseId/details/:studentId" element={<PrivateRoute allowedRoles={["teacher", "admin"]}><Layout><AttendanceDetails /></Layout></PrivateRoute>} />
            <Route path="/students" element={<PrivateRoute allowedRoles={["admin"]}><Layout><Students /></Layout></PrivateRoute>} />
            <Route path="/manual-attendance" element={<PrivateRoute allowedRoles={["admin", "teacher"]}><Layout><ManualAttendance /></Layout></PrivateRoute>} />
            <Route path="/panel" element={<PrivateRoute allowedRoles={["admin", "teacher"]}><Layout><Panel /></Layout></PrivateRoute>} />
            <Route path="/add-zoom-course" element={<PrivateRoute allowedRoles={["admin", "teacher"]}><Layout><AddZoomCourse /></Layout></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;