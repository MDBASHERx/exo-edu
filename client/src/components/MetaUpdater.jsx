import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

const MetaUpdater = () => {
    const { currentLang, lang } = useLanguage();

    useEffect(() => {
        document.title = lang.meta.title;

        const description = document.querySelector('meta[name="description"]');
        if (description) 
        {
            description.setAttribute("content", lang.meta.desc);
        }

        const keywords = document.querySelector('meta[name="keywords"]');
        if (keywords)
        {
            keywords.setAttribute("content", lang.meta.keywords);
        }

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) 
        {
            ogTitle.setAttribute("content", lang.meta.ogTitle);
        }

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) 
        {
            ogDesc.setAttribute("content", lang.meta.ogDesc);
        }

        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale)
        {
            ogLocale.setAttribute("content", lang.meta.ogLocale);
        }

    }, [currentLang, lang]);

    return null;
};

export default MetaUpdater;