import React, { useState, useMemo, useEffect, useContext } from "react";
import API from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { DataContext } from "../context/DataContext";
import "../styles/students.css";

const Student = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState([]);
    const { dataUpdated } = useContext(DataContext);
    const { lang } = useLanguage();

    useEffect(() => {
        API.get("/students")
            .then((res) => setStudents(res.data))
            .catch((err) => console.error("[ERROR] loading students:", err));
    }, [dataUpdated]);

    const filter = useMemo(() => {
        return students
            .filter((student) =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.course?.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => b.attendance - a.attendance);
    }, [searchTerm, students]);

    return (
        <div className="students-container">
            <div className="search-bar">
                <input type="text" placeholder={lang.Student.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button>
                    <span className="material-symbols-rounded">search</span>
                </button>
            </div>
            <div className="students-list">
                {filter.map((student, index) => (
                    <div key={index} className={`student-card ${index % 2 === 1 ? "highlight" : ""}`}>
                        <img src={student.image || (student.gender === "female" ? "/avatars/female/student.png" : "/avatars/male/student.png")} alt="Student" className="student-image" />
                        <div className="student-info">
                            <span className="student-name" style={{ fontFamily: "Assistant, sans-serif" }}>{student.name}</span>
                        </div>
                        <div className="attendance-info">
                            <span className="attendance-count">{student.attendance}</span>
                            <span className="attendance-label">{lang.Student.attendanceCount}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Student;
