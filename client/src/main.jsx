import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AttendanceProvider } from "./context/AttendanceContext";
import { LanguageProvider } from "./context/LanguageContext";
import { DataProvider } from "./context/DataContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <LanguageProvider>
                <AttendanceProvider>
                    <DataProvider>
                        <App />
                    </DataProvider>
                </AttendanceProvider>
            </LanguageProvider>
        </BrowserRouter>
    </React.StrictMode>
);

if ("serviceWorker" in navigator)
{
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then((registration) => {
                console.log("[INFO] Service Worker registered with scope:", registration.scope);
            })
            .catch((error) => {
                console.error("[ERROR] Service Worker registration failed:", error);
            });
    });
}