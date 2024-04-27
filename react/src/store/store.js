import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { userSlice } from "../api/slices/userSlice";
import { sectorSlice } from "../api/slices/sectorSlice";
import { accountSlice } from "../api/slices/accountSlice";


export const store = configureStore({
  reducer: {
    [userSlice.reducerPath]: userSlice.reducer,
    [sectorSlice.reducerPath]: sectorSlice.reducer,
    [accountSlice.reducerPath]: accountSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userSlice.middleware,
      sectorSlice.middleware,
      accountSlice.middleware,
    ),
});

setupListeners(store.dispatch);