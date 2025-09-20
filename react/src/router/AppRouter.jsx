import React, { useMemo, useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import { createStore } from "../store/store";
import CenteredMessage from "../components/CenteredMessage.jsx";

const AppRouter = () => {
  const { token } = useStateContext();
  const [router, setRouter] = useState(null);


  // 🔹 Conditionally create store when token changes
  const store = createStore(!!token);

  // 🔹 Conditionally import routes when token changes
  const routerPromise = useMemo(() => {
    return token
      ? import("./AuthRoutes").then((m) => m.createAuthRouter())
      : import("./GuestRoutes").then((m) => m.createGuestRouter());
  }, [token]);

  useEffect(() => {
    routerPromise.then(setRouter);
  }, [routerPromise]);

  if (!router) return <CenteredMessage text="Loading..." />;

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

export default AppRouter;
