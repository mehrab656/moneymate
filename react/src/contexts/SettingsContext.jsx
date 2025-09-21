import React, { createContext, useEffect, useState } from 'react';
import { useStateContext } from './ContextProvider.jsx';
import axiosClient from '../axios-client.js';

// Create a new context
const SettingsContext = createContext({
    applicationSettings: {},
    userRole: {},
    userPermission: {},
    setApplicationSettings: () => {},
    setUserRole: () => {},
    setUserPermission: () => {},
});

const SettingsProvider = ({ children }) => {
    const [applicationSettings, setApplicationSettings] = useState({});
    const [userRole, setUserRole] = useState({});
    const [userPermission, setUserPermission] = useState({});
    const [isSettingsFetched, setIsSettingsFetched] = useState(false); // Flag
    //  to prevent double API calls
  const { token } = useStateContext();


    useEffect(() => {
        // Ensure settings are fetched only once
        if (token) {
            axiosClient
                .get('/get-application-settings')
                .then(({ data }) => {
                    setApplicationSettings(data.application_settings);
                })
                .catch(() => {
                    // Handle error if needed
                })
                .finally(() => {
                    setIsSettingsFetched(true); // Mark as fetched
                });
        }

        if (token) {
            axiosClient
                .get('/get-user-role')
                .then(({ data }) => {
                    setUserRole(data.role);
                    setUserPermission(data.access);
                })
                .catch(() => {
                    // Handle error if needed
                });
        }
    }, [token]); // Dependency ensures fetch only if flag is false

    const checkPermission = (permission, limit = 0) => {
        if (userRole === 'admin' || permission) {
            return true;
        } else if (userRole === 'baseUser') {
            return true; // Always true for base users; adjust logic for subscriptions
        } else {
            return userPermission[permission];
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                applicationSettings,
                setApplicationSettings,
                userRole,
                setUserRole,
                userPermission,
                setUserPermission,
                checkPermission,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export { SettingsContext, SettingsProvider };
