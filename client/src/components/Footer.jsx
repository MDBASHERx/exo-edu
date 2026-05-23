import React from "react";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
    const { lang } = useLanguage();
    return (
        <footer className="footer">
            <p>{lang.Footer.rights} &copy; {new Date().getFullYear()}</p>
        </footer>
    );
};

export default Footer;