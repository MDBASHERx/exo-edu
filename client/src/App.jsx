import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useLanguage } from "./context/LanguageContext";
import MetaUpdater from "./components/MetaUpdater";
import Notification from "./components/Notification";
import UserActivityTracker from "./components/UserActivityTracker";
import "./styles/responsive.css";
import "./styles/App.css";

function App() {
    const { currentLang, lang } = useLanguage();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [toast, setToast] = useState({ show: false, type: "", message: "" });

    useEffect(() => {
        const root = document.getElementById("root");
        root.classList.remove("lang-ar", "lang-he");
        root.classList.add(`lang-${currentLang}`);
    }, [currentLang]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setToast({ show: true, type: "success", message: lang.all.offline });
        };

        const handleOffline = () => {
            setIsOnline(false);
            setToast({ show: true, type: "error", message: lang.all.online });
        };

        const updateLastActive = () => {
            sessionStorage.setItem("lastActive", Date.now().toString());
        };

        window.addEventListener("mousemove", updateLastActive);
        window.addEventListener("keydown", updateLastActive);
        window.addEventListener("click", updateLastActive);
        window.addEventListener("scroll", updateLastActive);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("mousemove", updateLastActive);
            window.removeEventListener("keydown", updateLastActive);
            window.removeEventListener("click", updateLastActive);
            window.removeEventListener("scroll", updateLastActive);

            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [currentLang]);

    return (
        <>
            <MetaUpdater />
            <Notification show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: "", message: "" })} />
            <UserActivityTracker lang={lang} />
            <AppRoutes />
        </>
    );
}

export default App;