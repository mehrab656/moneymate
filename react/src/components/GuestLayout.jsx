import {Navigate, Outlet} from "react-router-dom";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import React, {useContext} from "react";
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import {SettingsContext} from "../contexts/SettingsContext.jsx";

export default function GuestLayout() {
    const {token} = useStateContext();
    const {applicationSettings} = useContext(SettingsContext);

    // Check if applicationSettings or public_key is undefined
    if (!applicationSettings || applicationSettings.public_key === undefined) {
        const handleHardRefresh = () => {
            window.location.reload(true); // Perform a hard refresh
        };

        return (
            <div className="login-signup-form animated fadeInDown">
                <div className="form">
                    <div className="alert alert-danger title">ATTENTION!</div>
                    <hr/>
                    <p>
                        The configuration process is incomplete as VITE_APP_BASE_URL is not defined in config.js.
                        Kindly refer to the installation documentation for guidance and ensure that the application
                        is properly configured before proceeding with the login. Once you put the VITE_APP_BASE_URL
                        in config.js in the base folder,
                        click <a href="#" onClick={handleHardRefresh}>here</a> to perform a hard refresh and redirect to
                        the login page.
                    </p>
                </div>
            </div>
        );
    }

    const {public_key} = applicationSettings;
    const stripePromise = loadStripe(`${public_key}`);

    // Check if the user is already logged in and redirect to the Dashboard
    if (token) {
        return <Navigate to="/"/>;
    }

    return (
        <div>
            <Elements stripe={stripePromise}>
                <Outlet/>
            </Elements>
        </div>
    );
}
