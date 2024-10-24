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


export const store = configureStore({
    reducer: {
        [userSlice.reducerPath]: userSlice.reducer,
        [sectorSlice.reducerPath]: sectorSlice.reducer,
        [accountSlice.reducerPath]: accountSlice.reducer,
        [companySlice.reducerPath]: companySlice.reducer,
        [categorySlice.reducerPath]: categorySlice.reducer,
        [taskSlice.reducerPath]: taskSlice.reducer,
        [employeeSlice.reducerPath]: employeeSlice.reducer,
        [investmentSlice.reducerPath]: investmentSlice.reducer,
        [bankSlice.reducerPath]: bankSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            userSlice.middleware,
            sectorSlice.middleware,
            accountSlice.middleware,
            companySlice.middleware,
            categorySlice.middleware,
            taskSlice.middleware,
            employeeSlice.middleware,
            investmentSlice.middleware,
            bankSlice.middleware,
        ),
});

setupListeners(store.dispatch);