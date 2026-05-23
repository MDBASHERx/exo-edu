import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/login.css";
import { useLanguage } from "../context/LanguageContext";
import Notification from "../components/Notification";

const Login = () => {
    const { lang, currentLang, toggleLang } = useLanguage();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    
    const [toast, setToast] = useState({ show: false, type: "", message: "" });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password)
        {
            showToast("error", lang.all.fillAll);
            return;
        }

        setLoading(true);

        try {
            const res = await API.post("/auth/login", { username, password });

            const now = Date.now();
            const expiresAt = now + 60 * 60 * 1000;
            sessionStorage.setItem("token", res.data.token);
            sessionStorage.setItem("expiresAt", expiresAt.toString());
            sessionStorage.setItem("lastActive", now.toString());

            localStorage.setItem("role", res.data.user.role);
            localStorage.setItem("username", res.data.user.name);
            localStorage.setItem("gender", res.data.user.gender);
            
            showToast("success", lang.login.success);

            setTimeout(() => {
                setLoading(false);
                navigate("/");
            }, 1200);     
        }
        catch (err)
        {
            setUsername("");
            setPassword("");
            setLoading(false);
            const status = err.response?.status;

            if (status === 429)
            {
                showToast("error", lang.login.tooMany);
            }
            else if (status === 401)
            {
                showToast("error", lang.login.invalid);
            }
            else
            {
                showToast("error", lang.all.error);
            }
        }
    };
    
    return (
        <div className="login-container">
            <Notification show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: "", message: "" })} />
            <div className="left-section">
                <img src="/img/logo.jpg" alt="logo" />
                <p>{lang.login.title}</p>
            </div>
            <div className="right-section">
                <div className={`switch-lang ${currentLang === "ar" ? "switch-active" : ""}`} onClick={toggleLang}>
                    <div className={`lang-item ${currentLang === "he" ? "active" : ""}`} style={{ fontFamily: "Assistant, sans-serif" }}>{lang.Header.hebrow}</div>
                    <div className={`lang-item ${currentLang === "ar" ? "active" : ""}`} style={{ fontFamily: "Cairo, sans-serif" }}>{lang.Header.arabic}</div>
                </div>
                <h2>{lang.login.title2}</h2>
                <p>{lang.login.subtitle2}</p>
                <form onSubmit={handleLogin}>
                    <label htmlFor="username">{lang.login.username}</label>
                    <input type="text" id="username" placeholder={lang.panel.setUsername} value={username} onChange={(e) => setUsername(e.target.value)} />

                    <label htmlFor="password" className="password-label">
                        <span className="password-icon material-symbols-rounded" onClick={() => setShowPassword(!showPassword)} > {showPassword ? "visibility" : "visibility_off"} </span>
                        {lang.login.password}
                    </label>
                        <input type={showPassword ? "text" : "password"} id="password" placeholder="*********" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? lang.login.loggingIn : lang.login.button}
                        </button>
                    </form>
            </div>
        </div>
    );
};

export default Login;