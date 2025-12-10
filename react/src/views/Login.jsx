import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { createRef, useEffect, useState } from "react";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import MainLoader from "../components/loader/MainLoader.jsx";
import { Box, Card, Button, Typography, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function Login() {
  const naviagte = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = createRef();
  const passwordRef = createRef();
  const { setUser, setToken } = useStateContext();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();


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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        p: 2,
      }}
      className="animated fadeInDown"
    >
      <MainLoader loaderVisible={loading} />
      <Card
        sx={{
          width: 420,
          p: 4,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Login into your account
        </Typography>
        {message && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}

        <form onSubmit={onSubmit}>
          <TextField
            label="Email"
            type="email"
            inputRef={emailRef}
            fullWidth
            margin="normal"
            variant="filled"
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            inputRef={passwordRef}
            fullWidth
            margin="normal"
            variant="filled"
          />

          <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
            <Button type="button" variant="text" onClick={togglePasswordVisibility} sx={{ color: theme.palette.text.secondary }}>
              {showPassword ? "Hide" : "Show"} Password
            </Button>
            <Button type="submit" variant="contained">
              Login
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Not registered? <Link to="/signup">Create an account</Link>
          </Typography>
        </form>
      </Card>
    </Box>
  );
}
