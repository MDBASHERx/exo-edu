import React, { useState, useEffect, useContext } from "react";
import "../styles/panel.css";
import API from "../api/axios";
import Notification from "../components/Notification";
import { useLanguage } from "../context/LanguageContext";
import { DataContext } from "../context/DataContext";

const Panel = () => {
    const { lang } = useLanguage();
    
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");  
    const [sourceCourseId, setSourceCourseId] = useState("");
    const [targetCourseId, setTargetCourseId] = useState("");

    const { dataUpdated, triggerDataUpdate } = useContext(DataContext);

    //msg
    const [toast, setToast] = useState({ show: false, type: "", message: "" });
    
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    // register
    const [fullName, setFullName] = useState("");
    const [gender, setGender] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        API.get("/users?role=student").then((res) => setStudents(res.data)).catch(() => setStudents([]));
        API.get("/courses/all").then((res) => setCourses(res.data)).catch(() => setCourses([]));
    }, [dataUpdated]);
    
    const handleAssignStudent = async (e) => {
        e.preventDefault();
    
        if (!selectedStudent || !selectedCourse)
        {
            showToast("error", lang.all.fillAll);
            return;
        }

        try {
            const res = await API.post("/courses/add-student", {
                studentId: selectedStudent,
                courseId: selectedCourse,
            });
    
            showToast("success", lang.panel.successAddStudentToCourse);
            setSelectedStudent("");
            setSelectedCourse("");
            triggerDataUpdate();
        }
        catch (err)
        {
            showToast("error", lang.all.error);
        }
    };    

    const handleAddStudent = async (e) => {
        e.preventDefault();
    
        if (!fullName || !gender || !username || !password)
        {
            showToast("error", lang.all.fillAll);
            return;
        }

        try {
            const res = await API.post("/auth/register", {
                name: fullName,
                gender,
                username,
                password,
                role: "student",
            });
    
            showToast("success", lang.panel.successAddStudent);
            setFullName("");
            setGender("");
            setUsername("");
            setPassword("");
            triggerDataUpdate();
        }
        catch (err)
        {
            showToast("error", lang.all.error);
        }
    };

    const handleCopyStudents = async (e) => {
        e.preventDefault();
        if (!sourceCourseId || !targetCourseId)
        {
            showToast("error", lang.all.fillAll);
            return;
        }
        try {
            await API.post("/courses/copy-students", { fromCourseId: sourceCourseId, toCourseId: targetCourseId });
            showToast("success", lang.panel.successcopyStudents);
            setSourceCourseId("");
            setTargetCourseId("");
            triggerDataUpdate();
        }
        catch
        {
            showToast("error", lang.all.error);
        }
    };

    return (
        <div className="panel-container">
            <Notification show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: "", message: "" })} />
            <div className="panel-section">
                <h2>{lang.panel.titleAddStudent}</h2>
                <form className="form-group-panel" onSubmit={handleAddStudent}>
                    <div className="form-row-panel">
                        <div className="form-field-panel">
                            <label>{lang.panel.fullname}</label>
                            <input type="text" placeholder={lang.panel.setFullName} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div className="form-field-panel">
                            <label>{lang.panel.gender}</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)}>
                                <option value="">{lang.panel.selectgender}</option>
                                <option value="male">{lang.panel.man}</option>
                                <option value="female">{lang.panel.female}</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row-panel">
                        <div className="form-field-panel">
                            <label>{lang.panel.username}</label>
                            <input type="text" placeholder={lang.panel.setUsername} value={username} onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                        <div className="form-field-panel">
                            <label>{lang.panel.password}</label>
                            <input type="password" placeholder="*********" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit">{lang.panel.buttonadduser}</button>
                </form>
            </div>
            <div className="panel-section">
                <h2>{lang.panel.titleAddStudentToCourse}</h2>
                <form className="form-group-panel" onSubmit={handleAssignStudent}>
                    <div className="form-row-panel">
                        <div className="form-field-panel">
                            <label>{lang.panel.selectstudent}</label>
                            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                                <option value="">{lang.panel.selectstudent}</option>
                                {students.map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field-panel">
                            <label>{lang.panel.selectCourse}</label>
                            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                <option value="">{lang.panel.selectCourse}</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button type="submit">{lang.panel.buttonaddstudenttocourse}</button>
                </form>
            </div>
            <div className="panel-section">
                <h2>{lang.panel.copyStudentsTitle}</h2>
                <form className="form-group-panel" onSubmit={handleCopyStudents}>
                    <div className="form-row-panel">
                        <div className="form-field-panel">
                            <label>{lang.panel.copyFromCourse}</label>
                            <select value={sourceCourseId} onChange={(e) => setSourceCourseId(e.target.value)}>
                                <option value="">{lang.panel.selectCourse}</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-field-panel">
                            <label>{lang.panel.copyToCourse}</label>
                            <select value={targetCourseId} onChange={(e) => setTargetCourseId(e.target.value)}>
                                <option value="">{lang.panel.selectCourse}</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <button type="submit">{lang.panel.copyStudentsButton}</button>
                </form>
            </div>
        </div>
    );
};

export default Panel;