import React, { useState, useEffect, useContext } from "react";
import "../styles/zoomCourse.css";
import API from "../api/axios";
import Notification from "../components/Notification";
import { useLanguage } from "../context/LanguageContext";
import { DataContext } from "../context/DataContext";

const AddZoomCourse = () => {
    const { lang } = useLanguage();
    const [courseName, setCourseName] = useState("");
    const [zoomLink, setZoomLink] = useState("");
    const [courseDate, setCourseDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [teacherId, setTeacherId] = useState("");

    const [toast, setToast] = useState({ show: false, type: "", message: "" });
    const showToast = (type, message) => setToast({ show: true, type, message });

    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    
    const [sourceMyCourseId, setSourceMyCourseId] = useState("");
    const [targetMyCourseId, setTargetMyCourseId] = useState("");    

    const { dataUpdated, triggerDataUpdate } = useContext(DataContext);
  
    useEffect(() => {
        if (role === "admin")
        {
            API.get("/users?role=teacher")
                .then((res) => setTeachers(res.data))
                .catch(() => setTeachers([]));
        }
        else if (role === "teacher")
        {
            setTeacherId(userId);
        }
    }, [role, userId, dataUpdated]);

    const handleAddZoomCourse = async (e) => {
        e.preventDefault();

        if (!courseName || !zoomLink || !courseDate || !startTime || !endTime || (role === "admin" && !teacherId))
        {
            showToast("error", lang.all.fillAll);
            return;
        }

        if (startTime >= endTime)
        {
            showToast("error", lang.all.invalidTime);
            return;
        }        
        
        const selectedTeacherId = role === "admin" ? teacherId : userId;

        try {
            await API.post("/courses/zoom", {
                name: courseName,
                zoomLink,
                date: courseDate,
                startTime,
                endTime,
                teacherId: selectedTeacherId,
                isZoom: true
            });

            showToast("success", lang.zoom.successAddCourse);
            setCourseName("");
            setZoomLink("");
            setCourseDate("");
            setStartTime("");
            setEndTime("");
            setTeacherId("");
        }
        catch (err)
        {
            showToast("error", lang.all.error);
        }
    };

    const handleCopyMyCourses = async (e) => {
        e.preventDefault();
    
        if (!sourceMyCourseId || !targetMyCourseId)
        {
            showToast("error", lang.all.fillAll);
            return;
        }

        if (sourceMyCourseId === targetMyCourseId)
        {
            showToast("error", lang.zoom.sameCourseError);
            return;
        }
    
        try {
            await API.post("/courses/copy-students", {
                fromCourseId: sourceMyCourseId,
                toCourseId: targetMyCourseId
            });
    
            showToast("success", lang.zoom.successCopyStudents);
            setSourceMyCourseId("");
            setTargetMyCourseId("");
            triggerDataUpdate();
        }
        catch (err)
        {
            showToast("error", lang.all.error);
        }
    };    

    return (
        <div className="zoom-container">
            <Notification show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: "", message: "" })} />
            <div className="zoom-section">
                <h2>{lang.sidebar.zoomcourse}</h2>
                <form className="form-group-zoom" onSubmit={handleAddZoomCourse}>
                    <div className="form-row-zoom">
                        <div className="form-field-zoom">
                            <label>{lang.zoom.courseName}</label>
                            <input type="text" placeholder={lang.zoom.setCourseName} value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                        </div>
                        {role === "admin" && (
                            <div className="form-field-zoom">
                                <label>{lang.zoom.teacher}</label>
                                <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                                    <option value="">{lang.zoom.selectteacher}</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="form-row-zoom">
                        <div className="form-field-zoom">
                            <label>{lang.zoom.zoomLink}</label>
                            <input type="url" placeholder="https://zoom.us/..." value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} />
                        </div>
                        <div className="form-field-zoom">
                            <label>{lang.zoom.dayDate}</label>
                            <input type="date" value={courseDate} onChange={(e) => setCourseDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row-zoom">
                        <div className="form-field-zoom">
                            <label>{lang.zoom.startTime}</label>
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </div>
                        <div className="form-field-zoom">
                            <label>{lang.zoom.endTime}</label>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit">{lang.zoom.buttonaddcourse}</button>
                </form>
            </div>
        </div>
    );
};

export default AddZoomCourse;