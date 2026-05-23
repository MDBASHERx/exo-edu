import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import "../styles/courseStudents.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CourseStudents = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { lang, currentLang } = useLanguage();
    const [students, setStudents] = useState([]);

    const [courseName, setCourseName] = useState("");
    const [teacherName, setTeacherName] = useState("");
    const role = localStorage.getItem("role");

    const exportCourseStudentsExcel = (students, courseName, lang) => {
        const sheetData = [
            [courseName, lang.courseStudents.title || "Course Students"],
            [],
            [lang.courseStudents.name, lang.courseStudents.count],
            ...students.map((s) => [s.name, s.attendanceCount])
        ];
    
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    
        saveAs(blob, `course_students_${courseName}.xlsx`);
    };    

    const exportCourseStudentsPDF = (students, courseName, lang) => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4"
        });
    
        doc.setFont("helvetica");
        doc.setFontSize(14);
        doc.text(`${courseName} - ${lang.courseStudents.title || "Course Students"}`, 40, 40);
    
        const tableData = students.map((student) => [
            student.name,
            student.attendanceCount
        ]);
    
        autoTable(doc, {
            startY: 60,
            head: [[
                lang.courseStudents.name,
                lang.courseStudents.count
            ]],
            body: tableData,
            styles: {
                font: "helvetica",
                fontSize: 10
            },
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: [255, 255, 255]
            }
        });
    
        doc.save(`course_students_${courseName}.pdf`);
    };    

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await API.get(`/attendance/course/${courseId}/students`, {
                    headers: { "Accept-Language": currentLang }
                });
                setStudents(res.data);

                const courseRes = await API.get(`/courses/${courseId}`);
                setCourseName(courseRes.data.name || "Course");
                setTeacherName(courseRes.data.teacher?.name || "");               
            }
            catch (err)
            {
                console.error("[ERROR] fetching attendance details:", err);
            }
        };
        fetchStudents();
    }, [courseId, currentLang]);

    return (
        <div className="attendance-details-container">
            <div className="page-title">
                {role === "student" && <h2>{courseName} - {localStorage.getItem("username")}</h2>}
                {role === "teacher" && <h2>{courseName}</h2>}
                {role === "admin" && <h2>{courseName} - {teacherName}</h2>}
            </div>
            <div className="header-actions">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <span className="material-symbols-rounded">arrow_forward</span>
                    {lang.attendancedetails.back}
                </button>
            </div>
            <div className="export-buttons">
                <span className="material-symbols-rounded" onClick={() => exportCourseStudentsExcel(students, courseName, lang)}>
                    grid_on
                </span>
                <span className="divider">|</span>
                <span className="material-symbols-rounded" onClick={() => exportCourseStudentsPDF(students, courseName, lang)}>
                    draft
                </span>
            </div>
            {students.length === 0 ? (
                <p className="no-attendance-course">{lang.courseStudents.empty}</p>
            ) : (
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>{lang.courseStudents.name}</th>
                            <th>{lang.courseStudents.count}</th>
                        </tr>
                </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={index}>
                                <td
                                    style={{ fontFamily: "Assistant, sans-serif", cursor: "pointer" }}
                                    onClick={() => navigate(`/attendance/${courseId}/details/${student._id}`)} >
                                    {student.name}
                                </td>
                                <td>{student.attendanceCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CourseStudents;