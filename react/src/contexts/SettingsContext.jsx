import React, {createContext, useEffect, useState} from 'react';
import axiosClient from '../axios-client.js'; // Import your axios client instance

// Create a new context
const SettingsContext = createContext({
    applicationSettings: {},
    userRole: {},
    userPermission: {},
    setApplicationSettings: () => {
    },
    setUserRole: () => {
    },
    setUserPermission: () => {
    },
});

const SettingsProvider = ({children}) => {
    const [applicationSettings, setApplicationSettings] = useState({});
    const [userRole, setUserRole] = useState({});
    const [userPermission, setUserPermission] = useState({});

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
                    setUserPermission(data.access);
                })
                .catch((error) => {
                }).finally(() => {
            });
        }


    }, []);

    const checkPermission = (permission, limit=0)=>{
        if (userRole === 'admin' || permission) {
            return true;
        }
        else if(userRole === 'baseUser'){ //baseUser = baseAdmin edit, delete, view = always true
            return true; //@FIx Me for base user and subscriptions limit.
        }
        else { // sub-user or employee
            return userPermission[permission];
        }
    }

    return (
        <SettingsContext.Provider value={{applicationSettings, setApplicationSettings, userRole, setUserRole,userPermission, setUserPermission, checkPermission}}>
            {children}
        </SettingsContext.Provider>
    );
};

export {SettingsContext, SettingsProvider};
