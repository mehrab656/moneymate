import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { createRef, useEffect, useState } from "react";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import MainLoader from "../components/loader/MainLoader.jsx";

export default function Login() {
  const naviagte = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = createRef();
  const passwordRef = createRef();
  const { setUser, setToken } = useStateContext();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);


 const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const configureAxios = (baseURL) => {
    axios.defaults.baseURL = baseURL;
  };

  useEffect(() => {
    document.title = "Login";

    // Check if VITE_APP_BASE_URL is defined
    if (
      typeof window.__APP_CONFIG__ !== "undefined" &&
      window.__APP_CONFIG__.VITE_APP_BASE_URL
    ) {
      configureAxios(`${window.__APP_CONFIG__.VITE_APP_BASE_URL}/api`);
    } else {
      // Handle the case when VITE_APP_BASE_URL is not defined
      // Display an error message or handle the scenario appropriately
      console.error(
        "VITE_APP_BASE_URL is not defined. Please check your configuration."
      );
    }
  }, []);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };


    if (typeof axios.defaults.baseURL !== "undefined") {
      // Only make the API call if axios.defaults.baseURL is defined
      axios
        .post("/login", payload)
        .then(({ data }) => {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem("ACCESS_USER", JSON.stringify(data.user));
          localStorage.setItem("ACCESS_TOKEN", data.token);
          localStorage.setItem("ACCESS_ROLE", data.user.role_as);
          localStorage.setItem("CURRENT_COMPANY", data.user.primary_company);
          setLoading(false);
          if (data.user.role_as === "employee") {
            naviagte("/employee-dashboard");
          } else {
            naviagte("/dashboard"); //backend user dashboard
          }
        })
        .catch((err) => {
          const response = err.response;
          if (response && response.status === 403) {
            setMessage("Your subscription is not active");
            if (response.data.subscription_status === "renew") {
              setSubscriptionStatus(response.data.subscription_status);
            }
          } else if (response && response.status === 422) {
            setMessage(response.data.message);
          } else if (response && response.status === 404) {
            setMessage(
              "Attention: The configuration process is incomplete as VITE_APP_BASE_URL is not defined in config.js. Kindly refer to the installation documentation for guidance and ensure that the application is properly configured before proceeding with the login."
            );
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
      // Handle the case when axios.defaults.baseURL is not defined
      setMessage(
        "Attention: The configuration process is incomplete as VITE_APP_BASE_URL is not defined in config.js. Kindly refer to the installation documentation for guidance and ensure that the application is properly configured before proceeding with the login. Once configured properly make a hard reload of the page."
      );
    }
  };

  return (
    <div className="login-signup-form animated fadeInDown">
      <MainLoader loaderVisible={loading} />
      <div className="form">
        <div className="alert alert-info title">Login into your account</div>
        <hr />
        {message && <div className="form-group alert-box">{message}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="custom-form-label" htmlFor="email">
              Email
            </label>
            <input
              className="custom-form-control"
              ref={emailRef}
              type="email"
              placeholder="Email"
            />
          </div>

          <div className="form-group">
            <label className="custom-form-label" htmlFor="password">
              Password
            </label>
            <div className="password-input">
              <input
                className="custom-form-control"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="eye-icon"
                onClick={togglePasswordVisibility}
              />
            </div>
          </div>

          <button className="btn-add btn-block">Login</button>
          <p className="message">
            Not registered? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
