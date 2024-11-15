import {configureStore} from "@reduxjs/toolkit";
import {setupListeners} from "@reduxjs/toolkit/query";

import {userSlice} from "../api/slices/userSlice";
import {sectorSlice} from "../api/slices/sectorSlice";
import {accountSlice} from "../api/slices/accountSlice";
import {companySlice} from "../api/slices/companySlice";
import {categorySlice} from "../api/slices/categorySlice";
import {taskSlice} from "../api/slices/taskSlice";
import {employeeSlice} from "../api/slices/employeeSlice";
import {investmentSlice} from "../api/slices/investmentSlice.js";
import {bankSlice} from "../api/slices/bankSlice.js";
import {incomeSlice} from "../api/slices/incomeSlice.js";
import { expenseSlice } from "../api/slices/expenseSlice.js";
import { dashboardSlice } from "../api/slices/dashBoardSlice.js";


export const store = configureStore({
    reducer: {
        [dashboardSlice.reducerPath]: dashboardSlice.reducer,
        [userSlice.reducerPath]: userSlice.reducer,
        [sectorSlice.reducerPath]: sectorSlice.reducer,
        [accountSlice.reducerPath]: accountSlice.reducer,
        [companySlice.reducerPath]: companySlice.reducer,
        [categorySlice.reducerPath]: categorySlice.reducer,
        [taskSlice.reducerPath]: taskSlice.reducer,
        [employeeSlice.reducerPath]: employeeSlice.reducer,
        [investmentSlice.reducerPath]: investmentSlice.reducer,
        [bankSlice.reducerPath]: bankSlice.reducer,
        [incomeSlice.reducerPath]: incomeSlice.reducer,
        [expenseSlice.reducerPath]: expenseSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            dashboardSlice.middleware,
            userSlice.middleware,
            sectorSlice.middleware,
            accountSlice.middleware,
            companySlice.middleware,
            categorySlice.middleware,
            taskSlice.middleware,
            employeeSlice.middleware,
            investmentSlice.middleware,
            bankSlice.middleware,
            incomeSlice.middleware,
            expenseSlice.middleware,
        ),
});

setupListeners(store.dispatch);