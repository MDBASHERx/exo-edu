import { createContext, useState } from "react";

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
    const [attendanceUpdated, setAttendanceUpdated] = useState(false);

    const triggerUpdate = () => {
        setAttendanceUpdated(prev => !prev);
    };

    return (
        <AttendanceContext.Provider value={{ attendanceUpdated, triggerUpdate }}>
            {children}
        </AttendanceContext.Provider>
    );
};