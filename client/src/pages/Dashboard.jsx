import React, { useEffect, useState, useMemo, useContext } from "react";
import API from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { AttendanceContext } from "../context/AttendanceContext";
import { DataContext } from "../context/DataContext";
import Notification from "../components/Notification";
import "../styles/dashboard.css";

const Dashboard = () => {
    const { triggerUpdate } = useContext(AttendanceContext);
    const { dataUpdated, triggerDataUpdate } = useContext(DataContext);  
    
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseName, setCourseName] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const role = localStorage.getItem("role");
    const { lang } = useLanguage();

    const daysEnglish = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
    const today = new Date();
    const currentDayIndex = today.getDay() - 1 < 0 ? 0 : today.getDay() - 1;

    const [toast, setToast] = useState({ show: false, type: "", message: "" });
    const [attendanceState, setAttendanceState] = useState({});

    const [timer, setTimer] = useState(0);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") setIsPopupOpen(false);
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);    

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        API.get("/courses/my")
            .then((res) => setCourses(res.data))
            .catch((err) => console.error("[ERROR] fetching courses:", err));
    }, [dataUpdated]);

    useEffect(() => {
        API.get("/users?role=teacher").then((res) => setTeachers(res.data)).catch(() => setTeachers([]));
    }, [dataUpdated]);

    const groupedCourses = useMemo(() => {
        const map = new Map();

        courses.forEach(course => {
            const dayKey = course.dayOfWeek;
            const index = daysEnglish.indexOf(dayKey);
            if (index === -1 || index < currentDayIndex)
            {
                return;
            }

            const nextDate = new Date();
            nextDate.setDate(today.getDate() + (index - currentDayIndex));

            const formattedDate = `${String(nextDate.getDate()).padStart(2, '0')} - ${String(nextDate.getMonth() + 1).padStart(2, '0')} - ${nextDate.getFullYear() % 100}`;

            if (!map.has(course.dayOfWeek))
            {
                map.set(course.dayOfWeek, { date: formattedDate, list: [] });
            }

            map.get(course.dayOfWeek).list.push(course);
        });

        return Array.from(map.entries());
    }, [courses]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371000;
        const toRad = (value) => (value * Math.PI) / 180;
    
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };    

    const markAttendance = async (courseId) => {
        const collegeLat = 31.8029181;
        const collegeLng = 35.2383402;
        const maxDistanceMeters = 50;
    
        if (!navigator.geolocation)
        {
            showToast("error", lang.dashboard.locationDenied);
            setAttendanceState(prev => ({
                ...prev,
                [courseId]: {
                    icon: "location_off",
                    label: lang.dashboard.outsideCampus,
                    color: "#E70E3C"
                }
            }));
            return;
        }
    
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const distance = calculateDistance(latitude, longitude, collegeLat, collegeLng);
    
                if (distance > maxDistanceMeters)
                {
                    showToast("error", lang.dashboard.outsideCampus);
                    setAttendanceState(prev => ({
                        ...prev,
                        [courseId]: {
                            icon: "location_off",
                            label: lang.dashboard.outsideCampus,
                            color: "#E70E3C"
                        }
                    }));
                    return;
                }
    
                try {
                    const res = await API.post("/attendance",
                    {
                        courseId,
                        location: { latitude, longitude }
                    });
    
                    setTimeout(() => triggerUpdate(), 500);
    
                    const message = res.data.msg;
    
                    if (message.includes("Try not to be late"))
                    {
                        showToast("warning", lang.dashboard.lateAttendance);
                        setAttendanceState(prev => ({
                            ...prev,
                            [courseId]: {
                                icon: "block",
                                label: lang.dashboard.lateAttendance,
                                color: "#FFA500"
                            }
                        }));
                    }
                    else
                    {
                        showToast("success", lang.dashboard.successAttendance);
                        setAttendanceState(prev => ({
                            ...prev,
                            [courseId]: {
                                icon: "task_alt",
                                label: lang.dashboard.successAttendance,
                                color: "#176448"
                            }
                        }));
                    }
                }
                catch (err)
                {
                    const status = err.response?.status;
                    const msg = err.response?.data?.msg;
    
                    if (status === 409)
                    {
                        showToast("warning", lang.dashboard.alreadyMarked);
                        setAttendanceState(prev => ({
                            ...prev,
                            [courseId]: {
                                icon: "block",
                                label: lang.dashboard.alreadyMarked,
                                color: "#3A3A3A"
                            }
                        }));
                    }
                    else if (status === 403 && msg?.includes("too late"))
                    {
                        showToast("error", lang.dashboard.tooLate);
                        setAttendanceState(prev => ({
                            ...prev,
                            [courseId]: {
                                icon: "cancel",
                                label: lang.dashboard.tooLate,
                                color: "#E70E3C"
                            }
                        }));
                    }
                    else if (status === 403 && msg?.includes("hasn't started"))
                    {
                        showToast("error", lang.dashboard.tooEarly);
                        setAttendanceState(prev => ({
                            ...prev,
                            [courseId]: {
                                icon: "schedule",
                                label: lang.dashboard.tooEarly,
                                color: "#999"
                            }
                        }));
                    }
                    else
                    {
                        showToast("error", lang.all.error);
                        setAttendanceState(prev => ({
                            ...prev,
                            [courseId]: {
                                icon: "error",
                                label: lang.all.error,
                                color: "#E70E3C"
                            }
                        }));
                    }
    
                    console.error("[ERROR] Attendance:", err.response?.data || err.message);
                }
            },
            (error) => {
                console.error("[ERROR] getting location:", error.message);
                showToast("error", lang.dashboard.locationDenied);
                setAttendanceState(prev => ({
                    ...prev,
                    [courseId]: {
                        icon: "location_off",
                        label: lang.dashboard.locationDenied,
                        color: "#E70E3C"
                    }
                }));
            }
        );
    };    

    const getButtonColor = (startTime) => {
        const now = new Date();
        const [startHour, startMin] = startTime.split(":").map(Number);
      
        const start = new Date();
        start.setHours(startHour, startMin, 0, 0);
      
        const diff = Math.floor((now - start) / 60000);
      
        if (now < start)
        {
            return "#DBDBDB";  
        }
        if (diff <= 5)
        {
            return "#176448";
        }
        if (diff <= 15)
        {
            return "#FFA500";
        }
        return "#E70E3C";
      };
      
      const isDisabled = (startTime) => {
        const now = new Date();
        const [startHour, startMin] = startTime.split(":").map(Number);
      
        const start = new Date();
        start.setHours(startHour, startMin, 0, 0);
      
        const diff = Math.floor((now - start) / 60000);
        return diff > 15 || now < start;
      };   
      
      const getRemainingTime = (startTime, endTime, lang) => {
        const now = new Date();
    
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);
    
        const start = new Date(now);
        start.setHours(startHour, startMin, 0, 0);
    
        const end = new Date(now);
        end.setHours(endHour, endMin, 0, 0);
    
        if (now < start)
        {
            const diff = Math.floor((start - now) / 60000);
    
            if (diff <= 60)
            {
                return {
                    text: `${lang.dashboard.RemainingOpen} [${diff}:00] ${lang.dashboard.minute}`,
                    color: "#176448"
                };
            }
            else
            {
                return { text: lang.dashboard.Ended, color: "#E70E3C" };
            }
        }
        else if (now >= start && now < end)
        {
            const diff = Math.floor((end - now) / 60000);
            return { text: `${lang.dashboard.RemainingClose} [${diff}:00] ${lang.dashboard.minute}`, color: "#E29500" };
        }
        else
        {
            return { text: lang.dashboard.Ended, color: "#E70E3C" };
        }
    };   
    
    const handleAddCourse = async (e) => {
        e.preventDefault();
    
        if (!courseName || !teacherId || !dayOfWeek || !startTime || !endTime) 
        {
            showToast("error", lang.all.fillAll);
            return;
        }

        try {
            const res = await API.post("/courses", {
                name: courseName,
                teacherId,
                dayOfWeek,
                startTime,
                endTime,
            });
    
            showToast("success", lang.panel.successAddCourse);     
            setCourseName("");
            setTeacherId("");
            setDayOfWeek("");
            setStartTime("");
            setEndTime("");
            triggerDataUpdate();
        }
        catch (err)
        {
            showToast("error", lang.all.error);
        }
    };

    return (
        <div className="dashboard-container">
            <Notification show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: "", message: "" })} />
            {role === "admin" && (
                <button className="add-curse" onClick={() => setIsPopupOpen(true)}>
                      <span className="material-symbols-rounded">add</span>
                </button>
            )}
            {courses.filter(course => course.isZoom && new Date(course.date).toDateString() === new Date().toDateString())
            .length > 0 && (
                <div className="day-container">
                    <div className="card-days zoom-card-title">
                        <span className="material-symbols-rounded">videocam</span>
                        <span className="day">{lang.zoom.todayZoomCourses}</span>
                    </div>
                    <div className="courses-list">
                        {courses.filter(course => course.isZoom && new Date(course.date).toDateString() === new Date().toDateString() )
                        .map((course, index) => (
                            <div key={index} className="card-course">
                                <span className="course-name">{course.name}</span>
                                <span className="course-time">
                                    {lang.dashboard.startTime} <span className="highlight-time">[{course.startTime}] </span> 
                                    {lang.dashboard.endTime} <span className="highlight-time">[{course.endTime}]</span>
                                </span>
                                <a href={course.zoomLink} target="_blank" rel="noopener noreferrer" className="join-link">{lang.zoom.joinZoom}</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {groupedCourses.map(([dayName, { date, list }]) => {
                    return (
                        <div key={dayName} className="day-container">
                            <div className="card-days">
                                <span className="material-symbols-rounded">calendar_month</span>
                                <span className="day">{lang.all.days[dayName]}</span>
                                <span className="date" style={{ fontFamily: "Assistant, sans-serif" }}>{date}</span>
                            </div>
                        <div className="courses-list">
                            {list.map((course, index) => (
                                <div key={index} className="card-course">
                                    <span className="course-name">{course.name}</span>
                                    <span className="course-time">
                                        {lang.dashboard.startTime} <span className="highlight-time">[{course.startTime}]  </span> 
                                        {lang.dashboard.endTime} <span className="highlight-time">[{course.endTime}]</span>
                                    </span>
                                    {role !== "teacher" && (
                                        <span className="course-teacher">
                                            <span>{lang.dashboard.teacher}</span> {course.teacher?.name}
                                        </span>
                                    )}
                                    <span className="course-time">
                                    {(() => {
                                        const { text, color } = getRemainingTime(course.startTime, course.endTime, lang);
                                        return text ? (
                                            <span style={{ color, fontWeight: "bold" }}>{text}</span>
                                        ) : null;
                                    })()}
                                    </span>
                                    <button
                                        className={`attendance-btn ${isDisabled(course.startTime) || role !== "student" ? "disabled" : ""}`}
                                        style={{ backgroundColor: getButtonColor(course.startTime) }}
                                        onClick={() => {
                                            if (role === "student" && !isDisabled(course.startTime))
                                            {
                                                markAttendance(course._id);
                                            }
                                        }}
                                        disabled={isDisabled(course.startTime) || role !== "student"}
                                    >
                                    <span className="material-symbols-rounded check-icon">
                                        {attendanceState[course._id]?.icon || "task_alt"}
                                    </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            {isPopupOpen && (
                <div className="popup active">
                    <div className="overlay" onClick={() => setIsPopupOpen(false)}></div>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <h2>{lang.panel.titleAddCourse}</h2>
                                <form className="form-group-popup" onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAddCourse(e);
                                    setIsPopupOpen(false);
                                }}>
                                <div className="form-row-popup">
                                    <div className="form-field-popup">
                                        <label>{lang.panel.courseName}</label>
                                        <input type="text" placeholder={lang.panel.setCourseName} value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                                    </div>
                                    <div className="form-field-popup">
                                        <label>{lang.panel.teacher}</label>
                                        <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                                            <option value="">{lang.panel.selectteacher}</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row-popup">
                                    <div className="form-field-popup">
                                        <label>{lang.panel.dayOfWeek}</label>
                                        <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                                            <option value="">{lang.panel.selectdayofweek}</option>
                                            {Object.entries(lang.all.days).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-field-popup">
                                        <label>{lang.panel.startTime}</label>
                                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                    </div>
                                    <div className="form-field-popup">
                                        <label>{lang.panel.endTime}</label>
                                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                    </div>
                                </div>
                                        <button type="submit">{lang.panel.buttonaddcourse}</button>
                                </form>
                        </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;