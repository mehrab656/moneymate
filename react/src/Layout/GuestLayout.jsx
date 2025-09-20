import { Navigate } from "react-router-dom";
import Login from "../views/Login";
import { useStateContext } from "../contexts/ContextProvider";


export default function GuestLayout() {
  const { token } = useStateContext();
  const baseUrl = window.__APP_CONFIG__.VITE_APP_BASE_URL;

  // Check if applicationSettings or public_key is undefined
  if (!baseUrl) {
    const handleHardRefresh = () => {
      window.location.reload(true); // Perform a hard refresh
    };

    return (
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
    );
  }


  // Check if the user is already logged in and redirect to the Dashboard
  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <Login />
    </div>
  );
}
