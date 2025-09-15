import { Suspense } from "react";
import MainLoader from "../components/loader/MainLoader";

const LazyRoute = ({ children }) => (
  <Suspense fallback={<MainLoader />}>
    {children}
  </Suspense>
);

export default LazyRoute;
