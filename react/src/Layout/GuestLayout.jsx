import { Navigate, Outlet } from "react-router-dom";
import React, { useContext } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SettingsContext } from "../contexts/SettingsContext.jsx";
import { createCmsTheme } from "../styles/cmsTheme";


export default function GuestLayout() {
  const { token } = useStateContext();
  const { themeMode } = useContext(SettingsContext);
  const baseUrl = window.__APP_CONFIG__.VITE_APP_BASE_URL;

  // Check if applicationSettings or public_key is undefined
  if (!baseUrl) {
    const handleHardRefresh = () => {
      window.location.reload(true); // Perform a hard refresh
    };

    return (
      <ThemeProvider theme={createCmsTheme(themeMode)}>
        <CssBaseline />
        <div className="login-signup-form animated fadeInDown">
          <div className="form">
            <div className="alert alert-danger title">ATTENTION!</div>
            <hr />
            <p>
              The configuration process is incomplete as VITE_APP_BASE_URL is not
              defined in config.js. Kindly refer to the installation documentation
              for guidance and ensure that the application is properly configured
              before proceeding with the login. Once you put the VITE_APP_BASE_URL
              in config.js in the base folder, click{" "}
              <a href="#" onClick={handleHardRefresh}>
                here
              </a>{" "}
              to perform a hard refresh and redirect to the login page.
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }


  // Check if the user is already logged in and redirect to the Dashboard
  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <ThemeProvider theme={createCmsTheme(themeMode)}>
      <CssBaseline />
      <Outlet />
    </ThemeProvider>
  );
}
