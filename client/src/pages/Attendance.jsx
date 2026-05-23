import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { AttendanceContext } from "../context/AttendanceContext";
import { DataContext } from "../context/DataContext";
import "../styles/attendance.css";

const Attendance = () => {
    const [subjects, setSubjects] = useState([]);
    const { attendanceUpdated } = useContext(AttendanceContext);
    const { dataUpdated } = useContext(DataContext);
    const { lang } = useLanguage();
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
      
    const fetchSummary = () => {
        const endpoint =
            role === "teacher" ? "/attendance/teacher-courses" :
            role === "admin"   ? "/attendance/all-courses" :
                                 "/attendance/summary";
        API.get(endpoint)
            .then((res) => setSubjects(res.data))
            .catch(() => setSubjects([]));
    };

    useEffect(() => {
        fetchSummary();
    }, [attendanceUpdated, dataUpdated]);

    const handleCardClick = (courseId, courseName) => {
        localStorage.setItem("courseName", courseName);

        if (role === "student")
        {
            navigate(`/attendance/${courseId}/details`);
        }
        else
        {
            navigate(`/attendance/${courseId}/students`);
        }
    };

    return (
        <div className="attendance-container">
            {subjects.length === 0 ? (
                <div className="no-attendance">
                    {lang.attendance.emptyMessage}
                </div>
            ) : (
                subjects.map((subject, index) => (
                    <div key={index} className="attendance-card" onClick={() => handleCardClick(subject.courseId, subject.course)} >
                        <div className="subject-info">
                            <span className="subject-name">{subject.course}</span>
                            <span className="subject-label">{lang.attendance.name}</span>
                        </div>
                        <div className="attendance-count">
                            <span className="count">{subject.attendanceCount}</span>
                            <span className="attendance-label">
                                {role === "student" ? lang.attendance.count : lang.attendance.totalStudents}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Attendance;