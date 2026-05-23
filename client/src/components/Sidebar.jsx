import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Sidebar = ({ isVisible }) => {
    const { lang } = useLanguage();

    const isMobile = window.innerWidth <= 430;
    const shouldShow = isMobile ? isVisible : true;

    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem("role");

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path ? "active" : "";
    const sidebarClasses = `sidebar ${isMobile ? (isVisible ? "show" : "hide") : ""}`;

    return (
        <aside className={sidebarClasses}>
            <nav className="sidebar-nav">
                <ul className="nav-list primary-nav">
                <li className={`nav-item ${isActive("/dashboard")}`}>
                        <Link to="/dashboard" className="nav-link">
                            <span className="nav-icon material-symbols-rounded">school</span>
                            <span className="nav-label">{lang.sidebar.dashboard}</span>
                        </Link>
                    </li>
                    <li className={`nav-item ${isActive("/attendance")}`}>
                        <Link to="/attendance" className="nav-link">
                            <span className="nav-icon material-symbols-rounded">bar_chart</span>
                            <span className="nav-label">{lang.sidebar.attendance}</span>
                        </Link>
                    </li>
                    {(role === "admin" || role === "teacher") && (
                        <li className={`nav-item ${isActive("/add-zoom-course")}`}>
                            <Link to="/add-zoom-course" className="nav-link">
                                <span className="nav-icon material-symbols-rounded">video_call</span>
                                <span className="nav-label">{lang.sidebar.zoomcourse}</span> 
                            </Link>
                        </li>
                    )}
                    {(role === "admin" || role === "teacher") && (
                        <li className={`nav-item ${isActive("/manual-attendance")}`}>
                            <Link to="/manual-attendance" className="nav-link">
                                <span className="nav-icon material-symbols-rounded">edit_document</span>
                                <span className="nav-label">{lang.sidebar.manualAttendance}</span>
                            </Link>
                        </li>
                    )}
                    {role === "admin" && (
                        <li className={`nav-item ${isActive("/students")}`}>
                            <Link to="/students" className="nav-link">
                                <span className="nav-icon material-symbols-rounded">library_add_check</span>
                                <span className="nav-label">{lang.sidebar.students}</span>
                            </Link>
                        </li>
                    )}
                </ul>
                <ul className="nav-list secondary-nav">
                    {role === "admin" && (
                        <li className={`nav-item ${isActive("/panel")}`}>
                            <Link to="/panel" className="nav-link">
                                <span className="nav-icon material-symbols-rounded">shield_person</span>
                                <span className="nav-label">{lang.sidebar.panel}</span>
                            </Link>
                        </li>
                    )}
                    <li className="nav-item">
                        <a className="nav-link" onClick={handleLogout}>
                            <span className="material-symbols-rounded">logout</span>
                            <span className="nav-label">{lang.sidebar.logout}</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;