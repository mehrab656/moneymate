import { createBrowserRouter, Navigate } from "react-router-dom";
import GuestLayout from "../Layout/GuestLayout";
import Login from "../views/Login";
import Signup from "../views/Signup";
import CompanySignUp from "../views/Company/CompanySignUp";


export const createGuestRouter = () => createBrowserRouter([
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      { path: "/", element: <Navigate to="/login" replace /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/signup/company", element: <CompanySignUp /> },
    ]
  },
  { path: "*", element: <Navigate to="/login" replace /> }
]);
