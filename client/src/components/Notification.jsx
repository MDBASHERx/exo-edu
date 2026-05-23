import React, { useEffect, useState } from "react";
import "../styles/Notification.css";

const Notification = ({ show = false, type = "success", message = "", onClose }) => {
    const [disappearing, setDisappearing] = useState(false);

    useEffect(() => {
        if (show)
        {
            const hideTimer = setTimeout(() => {
                setDisappearing(true);
                setTimeout(() => {
                    onClose?.();
                    setDisappearing(false);
                }, 500);
            }, 3000);
            return () => clearTimeout(hideTimer);
        }
    }, [show, onClose]);
    

    if (!show)
    {
        return null;
    }

    return (
        <div className={`toast toast-fixed ${type} ${disappearing ? "fade-out" : ""}`}>
            <div className="toast-content">
                <span className="material-symbols-rounded check">{type === "success" ? "check" : type === "error" ? "priority_high" : "priority_high"}</span>
                <div className="message">
                    <span className="text">{message}</span>
                </div>
            </div>
            <span className="material-symbols-outlined close" onClick={onClose}>close</span>
        </div>
    );
};

export default Notification;