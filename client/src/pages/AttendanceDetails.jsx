import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import "../styles/attendanceDetails.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AttendanceDetails = () => {
    const { courseId, studentId } = useParams();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const { currentLang, lang } = useLanguage()

    const [teacherName, setTeacherName] = useState("");
    const [courseName, setCourseName] = useState("");

    const [studentName, setStudentName] = useState(localStorage.getItem("username") || "Student");
    const role = localStorage.getItem("role");

    const exportToExcel = () => {
    
        const sheetData = [
            [`${courseName}`, `${studentName}`],
            [],
            [lang.attendancedetails.day, lang.attendancedetails.date, lang.attendancedetails.time, lang.attendancedetails.status],
            ...records.map(rec => [
                rec.day,
                rec.date,
                rec.time,
                lang.attendancedetails[rec.status]
            ])
        ];
    
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    
        saveAs(blob, `attendance_${courseId}.xlsx`);
    };     

    const exportToPDF = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4"
        });
    
        doc.setFont("helvetica");
        doc.setFontSize(14);
        doc.text(`${courseName} - ${studentName}`, 40, 40);
    
        const tableData = records.map(rec => [
            rec.day,
            rec.date,
            rec.time,
            lang.attendancedetails[rec.status]
        ]);
    
        autoTable(doc, {
            startY: 60,
            head: [[
                lang.attendancedetails.day,
                lang.attendancedetails.date,
                lang.attendancedetails.time,
                lang.attendancedetails.status
            ]],
            body: tableData,
            styles: {
                font: "helvetica",
                fontSize: 10
            },
            headStyles: {
                fillColor: [44, 62, 80],
                textColor: [255, 255, 255]
            }
        });
    
        doc.save(`attendance_${courseId}.pdf`);
    };     
          
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await API.get(`/attendance/course/${courseId}${studentId ? `?student=${studentId}` : ""}`, {
                    headers: { "Accept-Language": currentLang }
                });
                setRecords(res.data);

                const courseRes = await API.get(`/courses/${courseId}`);
                setCourseName(courseRes.data.name || "Course");
                setTeacherName(courseRes.data.teacher?.name || "");

                if (studentId)
                {
                    const studentRes = await API.get(`/students/${studentId}`);
                    setStudentName(studentRes.data.name);
                }
            }
            catch (err)
            {
                console.error("[ERROR] fetching attendance details:", err);
            }
        };
        fetchDetails();
    }, [courseId, studentId, currentLang]);

    return (
        <div className="attendance-details-container">
            <div className="page-title">
                {role === "student" && <h2>{courseName} - {studentName}</h2>}
                {(role === "teacher" || role === "admin") && (
                    <h2>
                        {courseName}
                        {teacherName && ` - ${teacherName}`}
                        {studentId && ` - ${studentName}`}
                    </h2>
                )}
            </div>
            <div className="header-actions">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <span className="material-symbols-rounded">arrow_forward</span>
                    {lang.attendancedetails.back}
                </button>
            </div>
            <div className="export-buttons">
                <span className="material-symbols-rounded" onClick={exportToExcel}>
                    grid_on
                </span>
                <span className="divider">|</span>
                <span className="material-symbols-rounded" onClick={exportToPDF}>
                    draft
                </span>
            </div>
            {records.length === 0 ? (
                <p className="no-attendance-details">{lang.attendancedetails.empty}</p>
            ) : (
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>{lang.attendancedetails.day}</th>
                            <th>{lang.attendancedetails.date}</th>
                            <th>{lang.attendancedetails.time}</th>
                            <th>{lang.attendancedetails.status}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record, index) => (
                            <tr key={index}>
                                <td>{record.day}</td>
                                <td>{record.date}</td>
                                <td>{record.time}</td>
                                <td className={record.status}>
                                    {lang.attendancedetails[record.status]}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AttendanceDetails;