import { Backdrop, Grid } from "@mui/material";
import React from "react";
import { Circles } from  'react-loader-spinner'
const MainLoader = ({loaderVisible}) => {

  const loading = loaderVisible === undefined?false:loaderVisible;
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={loading}
    >
      <Circles
        height="80"
        width="80"
        color="#fff"
        ariaLabel="circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={loading}
        />
    </Backdrop>
  );
};

export default MainLoader;
