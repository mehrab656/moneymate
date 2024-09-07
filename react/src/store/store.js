import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { userSlice } from "../api/slices/userSlice";
import { sectorSlice } from "../api/slices/sectorSlice";
import { accountSlice } from "../api/slices/accountSlice";
import { companySlice } from "../api/slices/companySlice";
import { categorySlice } from "../api/slices/categorySlice";


export const store = configureStore({
  reducer: {
    [userSlice.reducerPath]: userSlice.reducer,
    [sectorSlice.reducerPath]: sectorSlice.reducer,
    [accountSlice.reducerPath]: accountSlice.reducer,
    [companySlice.reducerPath]: companySlice.reducer,
    [categorySlice.reducerPath]: categorySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userSlice.middleware,
      sectorSlice.middleware,
      accountSlice.middleware,
      companySlice.middleware,
      categorySlice.middleware,
    ),
});

setupListeners(store.dispatch);