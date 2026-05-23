import React, { createContext, useContext, useState, useEffect } from "react";
import { getLocale } from "../locales/locale";

const LanguageContext = createContext();``

export const LanguageProvider = ({ children }) => {
    const [currentLang, setCurrentLang] = useState(localStorage.getItem("lang") || "he");
    const [lang, setLang] = useState(getLocale(currentLang));

    const toggleLang = () => {
        const newLang = currentLang === "he" ? "ar" : "he";
        setCurrentLang(newLang);
        localStorage.setItem("lang", newLang);
    };

    useEffect(() => {
        setLang(getLocale(currentLang));
    }, [currentLang]);

    return (
        <LanguageContext.Provider value={{ lang, currentLang, toggleLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);