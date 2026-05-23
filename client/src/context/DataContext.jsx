import { createContext, useState } from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [dataUpdated, setDataUpdated] = useState(false);

    const triggerDataUpdate = () => {
        setDataUpdated(prev => !prev);
    };

    return (
        <DataContext.Provider value={{ dataUpdated, triggerDataUpdate }}>
            {children}
        </DataContext.Provider>
    );
};