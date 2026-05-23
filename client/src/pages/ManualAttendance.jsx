import React, { useState, useEffect } from "react";
import API from "../api/axios";
import "../styles/manualAttendance.css";
import Notification from "../components/Notification";
import { useLanguage } from "../context/LanguageContext";

const ManualAttendance = () => {
    const { lang } = useLanguage();
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [toast, setToast] = useState({ show: false, type: "", message: "" });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) fetchStudents(selectedCourseId);
    }, [selectedCourseId]);

    const fetchCourses = async () => {
        try {
            const res = await API.get("/attendance/today-courses");
            setCourses(res.data);
        } catch (err) {
            showToast("error", lang.manualAttendance.loadCoursesError);
        }
    };

    const fetchStudents = async (courseId) => {
        try {
            const res = await API.get(`/attendance/manual/${courseId}`);
            setStudents(res.data);
        } catch (err) {
            showToast("error", lang.manualAttendance.loadStudentsError);
        }
    };

    const handleStatusChange = (studentId, newStatus) => {
        setStudents((prev) => prev.map((s) => (s._id === studentId ? { ...s, status: newStatus } : s)));
    };

    const handleBulkUpdate = async () => {
        try {
            const attendances = students.map(s => ({
                studentId: s._id,
                courseId: selectedCourseId,
                status: s.status
            }));

            await API.post("/attendance/manual", {
                date: new Date(),
                attendances
            });

            showToast("success", lang.manualAttendance.submitSuccess);
        } catch (err) {
            showToast("error", lang.manualAttendance.submitError);
        }
    };

    const statuses = [
        { value: "present", label: lang.manualAttendance.present },
        { value: "late", label: lang.manualAttendance.late },
        { value: "absent", label: lang.manualAttendance.absent },
    ];

    return (
        <div className="manual-container">
            <Notification show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: "", message: "" })} />
            <div className="manual-section">
                <h2>{lang.manualAttendance.title}</h2>
                <div className="form-group-manual">
                    <div className="form-row-manual">
                        <div className="form-field-manual">
                            <label>{lang.manualAttendance.selectCourse}</label>
                            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                                <option value="">{lang.manualAttendance.selectCourse}</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>{course.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                {students.length > 0 ? (
                    <>
                        <div className="table-spacing" />
                        <table className="manualattendance-table">
                            <thead>
                                <tr>
                                    <th>{lang.manualAttendance.studentName}</th>
                                    <th>{lang.manualAttendance.status}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id}>
                                        <td data-label={lang.manualAttendance.studentName}>{student.name}</td>
                                        <td data-label={lang.manualAttendance.status}>
                                            <select value={student.status} onChange={(e) => handleStatusChange(student._id, e.target.value)}>
                                                {statuses.map(status => (
                                                    <option key={status.value} value={status.value}>{status.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="form-group-manual">
                            <button onClick={handleBulkUpdate}>{lang.manualAttendance.submit}</button>
                        </div>
                    </>
                ) : (
                    selectedCourseId && <p>{lang.manualAttendance.noStudents}</p>
                )}
            </div>
        </div>
    );
};

export default ManualAttendance;