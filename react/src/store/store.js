import { configureStore, combineReducers } from "@reduxjs/toolkit";

// Import all your RTK Query slices
import { dashboardSlice } from "../api/slices/dashBoardSlice";
import { userSlice } from "../api/slices/userSlice";
import { sectorSlice } from "../api/slices/sectorSlice";
import { assetSlice } from "../api/slices/assetSlice";
import { accountSlice } from "../api/slices/accountSlice";
import { companySlice } from "../api/slices/companySlice";
import { categorySlice } from "../api/slices/categorySlice";
import { taskSlice } from "../api/slices/taskSlice";
import { employeeSlice } from "../api/slices/employeeSlice";
import { investmentSlice } from "../api/slices/investmentSlice";
import { bankSlice } from "../api/slices/bankSlice";
import { incomeSlice } from "../api/slices/incomeSlice";
import { expenseSlice } from "../api/slices/expenseSlice";
import { debtSlice } from "../api/slices/debtSlice";
import { reportSlice } from "../api/slices/reportSlice";
import { settingsSlice } from "../api/slices/settingsSlice";

// Create store dynamically based on authentication
export const createStore = (isAuthenticated = false) => {
  const reducers = {};
  let middleware = (getDefaultMiddleware) => getDefaultMiddleware();

  if (isAuthenticated) {
    // Add all reducers for authenticated slices
    const slices = [
      accountSlice,
      dashboardSlice,
      userSlice,
      sectorSlice,
      assetSlice,
      companySlice,
      categorySlice,
      taskSlice,
      employeeSlice,
      investmentSlice,
      bankSlice,
      incomeSlice,
      expenseSlice,
      debtSlice,
      reportSlice,
      settingsSlice,
    ];

    slices.forEach((slice) => {
      reducers[slice.reducerPath] = slice.reducer;
    });

    // Include all RTK Query middleware
    middleware = (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(slices.map((slice) => slice.middleware));
  }

  return configureStore({
    reducer: combineReducers(reducers),
    middleware,
  });
};
