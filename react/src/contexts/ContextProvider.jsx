import {createContext, useContext, useEffect, useState} from "react";
import axiosClient from "../axios-client.js";

const StateContext = createContext({
    currentUser: null,
    token: null,
    notification: null,
    setUser: () => {
    },
    setToken: () => {
    },
    setNotification: () => {
    }
})

export const ContextProvider = ({children}) => {
    const [user, setUser] = useState({});
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [notification, _setNotification] = useState('');

    const setToken = (token) => {
        _setToken(token)
        if (token) {
            localStorage.setItem('ACCESS_TOKEN', token);
        } else {
            localStorage.removeItem('ACCESS_TOKEN');

        }
    }

    useEffect(()=>{
        //check if user exist on local storage
        const getUser = localStorage.getItem('ACCESS_USER')
        if(getUser){
            setUser(JSON.parse(getUser))
        }
    },[localStorage.getItem('ACCESS_USER')])

    const setNotification = message => {
        _setNotification(message);

        setTimeout(() => {
            _setNotification('')
        }, 5000)
    }

    return (
        <StateContext.Provider value={{
            user,
            setUser,
            token,
            setToken,
            notification,
            setNotification
        }}>
            {children}
        </StateContext.Provider>
    );
}

export const useStateContext = () => useContext(StateContext);
