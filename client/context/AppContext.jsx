import {createContext, useState} from 'react';

export const AppContent = createContext();

export const AppContextProvider = (props) => {

    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [isloggedIn,setIsloggedIn] = useState(false);
    const [userData,setUserData] = useState(false);

    const value = {
        backendURL,
        isloggedIn,
        setIsloggedIn,
        userData,
        setUserData
    }
    
    return(
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}