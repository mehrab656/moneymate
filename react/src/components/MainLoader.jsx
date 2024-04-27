import { Backdrop, Grid } from "@mui/material";
import React from "react";
import { Circles } from  'react-loader-spinner'
const MainLoader = ({loaderVisible}) => {
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={loaderVisible}
    >
      <Circles
        height="80"
        width="80"
        color="#fff"
        ariaLabel="circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={loaderVisible}
        />
    </Backdrop>
  );
};

export default MainLoader;
