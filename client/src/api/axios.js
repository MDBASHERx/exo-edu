import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

API.interceptors.request.use((req) => {
    const isLoginRequest = req.url.includes("/auth/login");
    const isOnLoginPage = window.location.pathname === "/login";

    if (!isLoginRequest && !isOnLoginPage)
    {
        const token = sessionStorage.getItem("token");
        const expiresAt = Number(sessionStorage.getItem("expiresAt"));
        const lastActive = Number(sessionStorage.getItem("lastActive"));
        const now = Date.now();

        const isExpired = !token || !expiresAt || now > expiresAt;
        const isAfk = !lastActive || now - lastActive > 20 * 60 * 1000;

        if (isExpired || isAfk)
        {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = "/login";
            return Promise.reject(new Error("Session expired or user inactive"));
        }

        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});


API.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err.response?.status;
        const isOnLoginPage = window.location.pathname === "/login";

        if (status === 401 && !isOnLoginPage)
        {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = "/login";
        }

        return Promise.reject(err);
    }
);

export default API;