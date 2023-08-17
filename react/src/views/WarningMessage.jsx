import React from "react";

export default function WarningMessage() {
    return (
        <div className="login-signup-form animated fadeInDown">
            <div className="form">
                <div className="alert alert-danger title">ATTENTION!</div>
                <hr/>
                <p>
                    The configuration process is incomplete as VITE_APP_BASE_URL is not defined in config.js.
                    Kindly refer to the installation documentation for guidance and ensure that the application
                    is properly configured before proceeding with the login.
                </p>
            </div>
        </div>
    )
}
