import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {RouterProvider} from "react-router-dom";
import router from "./router.jsx";
import {ContextProvider} from "./contexts/ContextProvider.jsx";
import {SettingsProvider} from "./contexts/SettingsContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ContextProvider>
            <SettingsProvider>
                <RouterProvider router={router}/>
            </SettingsProvider>
        </ContextProvider>
    </React.StrictMode>,
)
