import React from "react";
import { useLanguage } from "../context/LanguageContext";

const Header = ({ onAvatarClick }) => {
    const { lang, currentLang, toggleLang } = useLanguage();

    const getGreeting = () => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12)
        {
            return lang.Header.morning;
        }
        else if (hour >= 12 && hour < 15)
        {
            return lang.Header.afternoon;
        }
        else if (hour >= 15 && hour < 20)
        {
            return lang.Header.evening;
        }
        else
        {
            return lang.Header.night;
        }
    };

    const username = localStorage.getItem("username") || "משתמש";
    const gender = localStorage.getItem("gender") || "male";
    const role = localStorage.getItem("role") || "student";

    const getProfileImage = (role, gender) => {
        if (role === "admin")
        {
            return gender === "female"
                ? "/avatars/female/admin.png"
                : "/avatars/male/admin.png";
        }
        else if (role === "teacher")
        {
            return gender === "female"
                ? "/avatars/female/teacher.png"
                : "/avatars/male/teacher.png";
        } 
        else
        {
            return gender === "female"
                ? "/avatars/female/student.png"
                : "/avatars/male/student.png";
        }
    };

    const avatarPath = getProfileImage(role, gender);
    
    return (
        <header className="header">
            <div className={`switch-lang ${currentLang === "ar" ? "switch-active" : ""}`} onClick={toggleLang}>
                <div className={`lang-item ${currentLang === "he" ? "active" : ""}`} style={{ fontFamily: "Assistant, sans-serif" }}>{lang.Header.hebrow}</div>
                <div className={`lang-item ${currentLang === "ar" ? "active" : ""}`} style={{ fontFamily: "Cairo, sans-serif" }}>{lang.Header.arabic}</div>
            </div>
            <div className="user-info">
                <img src={avatarPath} alt="User" className="user-avatar" onClick={onAvatarClick} />
                <div className="text-container">
                    <span className="welcome-text">{getGreeting()}</span>
                    <span className="username" style={{ fontFamily: "Assistant, sans-serif" }}>{username}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;