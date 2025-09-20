import { Navigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useStateContext } from "../../contexts/ContextProvider";


export default function DefaultLayout() {
  const { token } = useStateContext();

  // Check if the user is already logged in and redirect to the Dashboard
  if (!token) {
    return <Navigate to="/login" />;
  }

  return <AuthLayout />
}
