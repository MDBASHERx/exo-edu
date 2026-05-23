import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "../styles/layout.css";

const Layout = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(false);

    const toggleSidebar = () => {
        if (window.innerWidth <= 430)
        {
            setShowSidebar(prev => !prev);
        }
    };

    return (
        <div className="layout">
            <Header onAvatarClick={toggleSidebar} />
            <div className="main-container">
                <Sidebar isVisible={showSidebar} />
                <main className="content">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;