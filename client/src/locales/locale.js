import ar from "./ar";
import he from "./he";

const languages = {
    ar,
    he
};

export const getLocale = () => {
    const lang = localStorage.getItem("lang") || "he";
    return languages[lang] || he;
};