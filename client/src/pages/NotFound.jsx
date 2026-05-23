import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/404.css";

const NotFound = () => {
    const navigate = useNavigate();
    const { lang } = useLanguage();

    return (
        <div className="body404">
            <div className="content">
                <h1>404</h1>
                <img src="/gif/error.gif" alt="Error" />
                <div className="text">
                    <h2>{lang.notFound.title}</h2>
                    <p>{lang.notFound.subtitle}</p>
                    <button className="home-btn" onClick={() => navigate("/")}>{lang.notFound.back}</button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;