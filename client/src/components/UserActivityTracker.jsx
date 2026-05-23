import { useEffect } from "react";

const UserActivityTracker = ({ lang }) => {
    useEffect(() => {
        let logoutTimer;
        let warningTimer;

        const checkActivity = () => {
            const lastActive = parseInt(sessionStorage.getItem("lastActive") || Date.now(), 10);
            const now = Date.now();
            const diffMinutes = (now - lastActive) / 60000;

            if (diffMinutes >= 10)
            {
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = "/login";
            }
            else if (diffMinutes >= 9.5)
            {
                window.dispatchEvent(
                    new CustomEvent("custom-toast", {
                        detail: {
                            type: "warning",
                            message: lang.all.afk,
                        },
                    })
                );
            }
        };

        logoutTimer = setInterval(checkActivity, 10000);

        return () => {
            clearInterval(logoutTimer);
            clearTimeout(warningTimer);
        };
    }, [lang]);

    return null;
};

export default UserActivityTracker;