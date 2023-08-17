import React, {createContext, useEffect, useState} from 'react';
import axiosClient from '../axios-client.js'; // Import your axios client instance

// Create a new context
const SettingsContext = createContext({
    applicationSettings: {},
    userRole: {},
    setApplicationSettings: () => {
    },
    setUserRole: () => {
    },
});

const SettingsProvider = ({children}) => {
    const [applicationSettings, setApplicationSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState({});

    useEffect(() => {
        axiosClient
            .get('/get-application-settings')
            .then(({data}) => {
                setApplicationSettings(data.application_settings);
            })
            .catch(() => {
                // Handle error if needed
            })
            .finally(() => {

            });

        var access_token = localStorage.getItem('ACCESS_TOKEN');


        if (access_token) {
            axiosClient
                .get('/get-user-role')
                .then(({data}) => {
                    setUserRole(data.role);
                })
                .catch((error) => {
                }).finally(() => {
                setLoading(false);
            });
        }


    }, []);

    return (
        <SettingsContext.Provider value={{applicationSettings, setApplicationSettings, userRole, setUserRole}}>
            {children}
        </SettingsContext.Provider>
    );
};

export {SettingsContext, SettingsProvider};
