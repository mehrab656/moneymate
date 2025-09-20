import React from 'react';
import ReactDOM from 'react-dom/client'
import './index.css'

import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "../public/custom.css";

import {ContextProvider} from "./contexts/ContextProvider.jsx";
import {SettingsProvider} from "./contexts/SettingsContext.jsx";
import 'react-tooltip/dist/react-tooltip.css';

import { Provider } from "react-redux";

import OneSignal from 'react-onesignal';
import AppRouter from './router/AppRouter.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ContextProvider>
            <SettingsProvider>
              <AppRouter />
            </SettingsProvider>
        </ContextProvider>
    </React.StrictMode>,
)
